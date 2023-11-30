/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { FunctionConfig } from '../../utils/evaluate-path';
import StateManager from '../../utils/state-manager';
import {
  create as stylexCreate,
  include as stylexInclude,
  firstThatWorks as stylexFirstThatWorks,
  keyframes as stylexKeyframes,
  type InjectableStyle,
} from '@stylexjs/shared';
import {
  injectDevClassNames,
  convertToTestStyles,
} from '../../utils/dev-classname';
import { convertObjectToAST } from '../../utils/js-to-ast';
import { messages } from '@stylexjs/shared';
import * as pathUtils from '../../babel-path-utils';
import { evaluateStyleXCreateArg } from './parse-stylex-create-arg';

/// This function looks for `stylex.create` calls and transforms them.
//. 1. It finds the first argument to `stylex.create` and validates it.
/// 2. It pre-processes valid-dynamic parts of style object such as custom presets (spreads)
/// 3. It envalues the style object to get a JS object. This also handles local constants automatically.
/// 4. It uses the `stylexCreate` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXCreate(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const { node } = path;

  if (node.type !== 'CallExpression') {
    return;
  }

  if (
    (node.callee.type === 'Identifier' &&
      state.stylexCreateImport.has(node.callee.name)) ||
    (node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'create' &&
      state.stylexImport.has(node.callee.object.name))
  ) {
    validateStyleXCreate(path);

    const args: $ReadOnlyArray<
      NodePath<
        | t.Expression
        | t.SpreadElement
        | t.JSXNamespacedName
        | t.ArgumentPlaceholder,
      >,
    > = path.get('arguments');
    const firstArg = args[0];

    if (!pathUtils.isObjectExpression(firstArg)) {
      throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
    }

    // TODO: This should be removed soon since we should disallow spreads without
    // `stylex.include` in the future.
    // preProcessStyleArg(firstArg, state);

    state.inStyleXCreate = true;

    const injectedKeyframes: { [animationName: string]: InjectableStyle } = {};

    // eslint-disable-next-line no-inner-declarations
    function keyframes<
      Obj: {
        +[key: string]: { +[k: string]: string | number },
      },
    >(animation: Obj): string {
      const [animationName, injectedStyle] = stylexKeyframes(
        animation,
        state.options,
      );
      injectedKeyframes[animationName] = injectedStyle;
      return animationName;
    }

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexIncludeImport.forEach((name) => {
      identifiers[name] = { fn: stylexInclude, takesPath: true };
    });
    state.stylexFirstThatWorksImport.forEach((name) => {
      identifiers[name] = { fn: stylexFirstThatWorks };
    });
    state.stylexKeyframesImport.forEach((name) => {
      identifiers[name] = { fn: keyframes };
    });
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].include = { fn: stylexInclude, takesPath: true };
      memberExpressions[name].firstThatWorks = { fn: stylexFirstThatWorks };
      memberExpressions[name].keyframes = { fn: keyframes };
    });

    const { confident, value, fns } = evaluateStyleXCreateArg(firstArg, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw new Error(messages.NON_STATIC_VALUE);
    }
    const plainObject = value;
    // eslint-disable-next-line prefer-const
    let [compiledStyles, injectedStylesSansKeyframes] = stylexCreate(
      plainObject,
      state.options,
    );

    const injectedStyles = {
      ...injectedKeyframes,
      ...injectedStylesSansKeyframes,
    };

    let varName = null;
    if (pathUtils.isVariableDeclarator(path.parentPath)) {
      const idNode = path.parentPath.node.id;
      if (idNode.type === 'Identifier') {
        varName = idNode.name;
      }
    }

    if (state.isTest) {
      compiledStyles = {
        ...convertToTestStyles(compiledStyles, varName, state),
      };
    } else if (state.isDev) {
      compiledStyles = {
        ...injectDevClassNames(compiledStyles, varName, state),
      };
    }

    if (varName != null) {
      state.styleMap.set(varName, compiledStyles);
      state.styleVars.set(varName, (path.parentPath: $FlowFixMe));
    }

    const resultAst = convertObjectToAST(compiledStyles);

    if (fns != null) {
      resultAst.properties = resultAst.properties.map((prop) => {
        if (t.isObjectProperty(prop)) {
          const key =
            prop.key.type === 'Identifier' && !prop.computed
              ? prop.key.name
              : prop.key.type === 'StringLiteral'
                ? prop.key.value
                : null;
          if (key != null && Object.keys(fns).includes(key)) {
            const [params, inlineStyles] = fns[key];

            if (t.isExpression(prop.value)) {
              const value: t.Expression = (prop.value: $FlowFixMe);
              prop.value = t.arrowFunctionExpression(
                params,
                t.arrayExpression([
                  value,
                  t.objectExpression(
                    Object.entries(inlineStyles).map(([key, value]) =>
                      t.objectProperty(t.stringLiteral(key), value),
                    ),
                  ),
                ]),
              );
            }
          }
        }

        return prop;
      });
    }

    path.replaceWith(resultAst);

    if (Object.keys(injectedStyles).length === 0) {
      return;
    }
    if (state.runtimeInjection) {
      const statementPath = findNearestStatementAncestor(path);
      const stylexName = getStylexDefaultImport(path, state);

      for (const [_key, { ltr, priority, rtl }] of Object.entries(
        injectedStyles,
      )) {
        statementPath.insertBefore(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(stylexName),
                t.identifier('inject'),
              ),
              [
                t.stringLiteral(ltr),
                t.numericLiteral(priority),
                ...(rtl != null ? [t.stringLiteral(rtl)] : []),
              ],
            ),
          ),
        );
      }
    }

    for (const [key, { priority, ...rest }] of Object.entries(injectedStyles)) {
      state.addStyle([key, rest, priority]);
    }
  }
  state.inStyleXCreate = false;
}

// Validates the first argument to `stylex.create`.
function validateStyleXCreate(path: NodePath<t.CallExpression>) {
  if (
    path.parentPath == null ||
    pathUtils.isExpressionStatement(path.parentPath)
  ) {
    throw new Error(messages.UNBOUND_STYLEX_CALL_VALUE);
  }
  const nearestStatement = findNearestStatementAncestor(path);
  if (
    !pathUtils.isProgram(nearestStatement.parentPath) &&
    !pathUtils.isExportNamedDeclaration(nearestStatement.parentPath)
  ) {
    throw new Error(messages.ONLY_TOP_LEVEL);
  }
  if (path.node.arguments.length !== 1) {
    throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
  }
  if (path.node.arguments[0].type !== 'ObjectExpression') {
    throw new Error(messages.NON_OBJECT_FOR_STYLEX_CALL);
  }
}

// Find the nearest statement ancestor of a given path.
function findNearestStatementAncestor(path: NodePath<>): NodePath<t.Statement> {
  if (pathUtils.isStatement(path)) {
    return path;
  }
  if (path.parentPath == null) {
    throw new Error('Unexpected Path found that is not part of the AST.');
  }
  return findNearestStatementAncestor(path.parentPath);
}

// Converts typed spreads to `stylex.include` calls.
// function preProcessStyleArg(
//   objPath: NodePath<t.ObjectExpression>,
//   state: StateManager,
// ): void {
//   objPath.traverse({
//     SpreadElement(path) {
//       const argument = path.get('argument');
//       if (!pathUtils.isTypeCastExpression(argument)) {
//         return;
//       }
//       const expression = argument.get('expression');
//       if (
//         !pathUtils.isIdentifier(expression) &&
//         !pathUtils.isMemberExpression(expression)
//       ) {
//         throw new Error(messages.ILLEGAL_NAMESPACE_VALUE);
//       }
//       if (
//         !(
//           (
//             pathUtils.isObjectExpression(path.parentPath) && // namespaceObject
//             pathUtils.isObjectProperty(path.parentPath.parentPath) && // namespaceProperty
//             pathUtils.isObjectExpression(
//               path.parentPath.parentPath.parentPath,
//             ) && // stylex.create argument
//             pathUtils.isCallExpression(
//               path.parentPath.parentPath.parentPath.parentPath,
//             )
//           ) // stylex.create
//         )
//       ) {
//         // Disallow spreads within pseudo or media query objects
//         throw new Error(messages.ILLEGAL_NESTED_PSEUDO);
//       }

//       const stylexName = getStylexDefaultImport(path, state);

//       argument.replaceWith(
//         t.callExpression(
//           t.memberExpression(t.identifier(stylexName), t.identifier('include')),
//           [expression.node],
//         ),
//       );
//     },
//   });
// }

// A function to deterministicly convert a spreadded expression to a string.
// function toString(path: NodePath): string {
//   if (path.isIdentifier()) {
//     return path.node.name;
//   } else if (path.isStringLiteral() || path.isNumericLiteral()) {
//     return String(path.node.value);
//   } else if (path.isMemberExpression()) {
//     return `${toString(path.get('object'))}.${toString(path.get('property'))}`;
//   }
//   throw new Error(path.node.type);
// }

function getStylexDefaultImport(path: NodePath<>, state: StateManager): string {
  const statementPath = findNearestStatementAncestor(path);

  let stylexName: string;
  state.stylexImport.forEach((importName) => {
    stylexName = importName;
  });
  if (stylexName == null) {
    stylexName = '__stylex__';
    statementPath.insertBefore(
      t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier(stylexName))],
        t.stringLiteral(state.importPathString),
      ),
    );
    state.stylexImport.add(stylexName);
  }
  return stylexName;
}
