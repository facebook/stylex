/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { FunctionConfig } from '../utils/evaluate-path';
import StateManager from '../utils/state-manager';
import {
  create as stylexCreate,
  include as stylexInclude,
  firstThatWorks as stylexFirstThatWorks,
} from '@stylexjs/shared';
import {
  injectDevClassNames,
  convertToTestStyles,
} from '../utils/dev-classname';
import { convertObjectToAST } from '../utils/js-to-ast';
import { messages } from '@stylexjs/shared';
import { evaluate } from '../utils/evaluate-path';

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
  state: StateManager
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
      state.stylexImport.has(node.callee.object.name) &&
      node.callee.property.name === 'create')
  ) {
    validateStyleXCreate(path);

    const args: ReadonlyArray<NodePath> = path.get('arguments');
    const firstArg = args[0];

    if (firstArg == null || !firstArg.isObjectExpression()) {
      throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
    }

    const processingState = preProcessStyleArg(firstArg);

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexIncludeImport.forEach((name) => {
      identifiers[name] = { fn: stylexInclude, takesPath: true };
    });
    state.stylexFirstThatWorksImport.forEach((name) => {
      identifiers[name] = { fn: stylexFirstThatWorks };
    });
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].include = { fn: stylexInclude, takesPath: true };
      memberExpressions[name].firstThatWorks = { fn: stylexFirstThatWorks };
    });

    const { confident, value } = evaluate(firstArg, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw new Error(messages.NON_STATIC_VALUE);
    }
    const plainObject = value;
    let [compiledStyles, injectedStyles] = stylexCreate(
      plainObject,
      state.options
    );

    let varName = null;
    if (path.parentPath.isVariableDeclarator()) {
      const idNode = path.parentPath.node.id;
      if (idNode.type === 'Identifier') {
        varName = idNode.name;
      }
    }

    if (state.isTest) {
      compiledStyles = convertToTestStyles(compiledStyles, varName, state);
    } else if (state.isDev) {
      compiledStyles = injectDevClassNames(compiledStyles, varName, state);
    }

    if (varName != null) {
      state.styleMap.set(varName, compiledStyles);
      state.styleVars.set(varName, path.parentPath);
    }

    path.replaceWith(convertObjectToAST(compiledStyles));

    postProcessStyles(path, processingState);

    if (Object.keys(injectedStyles).length === 0) {
      return;
    }
    if (state.isDev || state.stylexSheetName == null) {
      const statementPath = findNearestStatementAncestor(path);

      let stylexName: string | undefined;
      state.stylexImport.forEach((importName) => {
        stylexName = importName;
      });
      if (stylexName == null) {
        stylexName = '__stylex__';
        statementPath.insertBefore(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(stylexName))],
            t.stringLiteral('stylex')
          )
        );
      }

      for (const [key, { ltr, priority, rtl }] of Object.entries(
        injectedStyles
      )) {
        statementPath.insertBefore(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(stylexName),
                t.identifier('inject')
              ),
              [
                t.stringLiteral(ltr),
                t.numericLiteral(priority),
                ...(rtl != null ? [t.stringLiteral(rtl)] : []),
              ]
            )
          )
        );
      }
    }

    for (const [key, { priority, ...rest }] of Object.entries(injectedStyles)) {
      state.addStyle([key, rest, priority]);
    }
  }
}

// Validates the first argument to `stylex.create`.
function validateStyleXCreate(path: NodePath<t.CallExpression>) {
  if (path.parentPath == null || path.parentPath.isExpressionStatement()) {
    throw new Error(messages.UNBOUND_STYLEX_CALL_VALUE);
  }
  const nearestStatement = findNearestStatementAncestor(path);
  if (
    !nearestStatement.parentPath.isProgram() &&
    !nearestStatement.parentPath.isExportNamedDeclaration()
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
function findNearestStatementAncestor(path: NodePath): NodePath<t.Statement> {
  if (path.isStatement()) {
    return path;
  }
  if (path.parentPath == null) {
    throw new Error('Unexpected Path found that is not part of the AST.');
  }
  return findNearestStatementAncestor(path.parentPath as any);
}

// These functions are for special handling of dynamic parts of the style object
// Currently they handle spreading pre-defined style objects with stylex.create calls.
//
// It converts the spreads into a special string and remembers the original value in an object...
type ProcessingState = {
  [key: string]: t.Expression;
};
function preProcessStyleArg(
  objPath: NodePath<t.ObjectExpression>
): ProcessingState {
  const state: { [key: string]: t.Expression } = {};
  objPath.traverse({
    SpreadElement(path) {
      const argument = path.get('argument');
      if (!argument.isTypeCastExpression()) {
        return;
      }
      const expression = argument.get('expression');
      if (!expression.isIdentifier() && !expression.isMemberExpression()) {
        throw new Error(messages.ILLEGAL_NAMESPACE_VALUE);
      }
      if (
        !(
          (
            path.parentPath.isObjectExpression() && // namespaceObject
            path.parentPath.parentPath.isObjectProperty() && // namespaceProperty
            path.parentPath.parentPath.parentPath.isObjectExpression() && // stylex.create argument
            path.parentPath.parentPath.parentPath.parentPath.isCallExpression()
          ) // stylex.create
        )
      ) {
        // Disallow spreads within pseudo or media query objects
        throw new Error(messages.ILLEGAL_NESTED_PSEUDO);
      }

      const key = `include(${toString(expression)})`;

      path.replaceWith(
        t.objectProperty(t.stringLiteral(key), t.stringLiteral(key))
      );
      state[key] = expression.node;
    },
  });
  return state;
}

// Later, it finds those strings and replaces them back with their original values.
function postProcessStyles(objPath: NodePath, state: ProcessingState) {
  objPath.traverse({
    ObjectProperty(path) {
      const node = path.node.key;
      if (node.type === 'StringLiteral' && state[node.value] != null) {
        path.replaceWith(t.spreadElement(state[node.value]));
      }
    },
  });
}

// A function to deterministicly convert a spreadded expression to a string.
function toString(path: NodePath): string {
  if (path.isIdentifier()) {
    return path.node.name;
  } else if (path.isStringLiteral() || path.isNumericLiteral()) {
    return String(path.node.value);
  } else if (path.isMemberExpression()) {
    return `${toString(path.get('object'))}.${toString(path.get('property'))}`;
  }
  throw new Error(path.node.type);
}
