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
import {
  convertObjectToAST,
  removeObjectsWithSpreads,
} from '../../utils/js-to-ast';
import { messages } from '@stylexjs/shared';
import * as pathUtils from '../../babel-path-utils';
import { evaluateStyleXCreateArg } from './parse-stylex-create-arg';
import flatMapExpandedShorthands from '@stylexjs/shared/lib/preprocess-rules';

/// This function looks for `stylex.create` calls and transforms them.
/// 1. It finds the first argument to `stylex.create` and validates it.
/// 2. It pre-processes valid-dynamic parts of style object such as custom presets (spreads)
/// 3. It evaluates the style object to get a JS object. This also handles local constants automatically.
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

    // add injection that mark variables used for dynamic styles as `inherits: false`
    const injectedInheritStyles: { [string]: InjectableStyle } = {};
    if (fns != null) {
      const dynamicFnsNames = Object.values(fns)
        ?.map((entry) => Object.keys(entry[1]))
        .flat();
      dynamicFnsNames.forEach((fnsName) => {
        injectedInheritStyles[fnsName] = {
          priority: 0,
          ltr: `@property ${fnsName} { inherits: false }`,
          rtl: null,
        };
      });
    }

    if (!confident) {
      throw path.buildCodeFrameError(messages.NON_STATIC_VALUE, SyntaxError);
    }
    const plainObject = value;
    // eslint-disable-next-line prefer-const
    let [compiledStyles, injectedStylesSansKeyframes, classPathsPerNamespace] =
      stylexCreate(plainObject, state.options);

    const injectedStyles = {
      ...injectedKeyframes,
      ...injectedStylesSansKeyframes,
      ...injectedInheritStyles,
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
      const stylesToRemember = removeObjectsWithSpreads(compiledStyles);
      state.styleMap.set(varName, stylesToRemember);
      state.styleVars.set(varName, path.parentPath as $FlowFixMe);
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

            const origClassPaths: { [string]: string } = {};

            for (const [className, classPaths] of Object.entries(
              classPathsPerNamespace[key],
            )) {
              origClassPaths[className] = classPaths.join('_');
            }

            let dynamicStyles: $ReadOnlyArray<{
              +expression: t.Expression,
              +key: string,
              path: string,
            }> = Object.entries(inlineStyles).map(([_key, v]) => ({
              expression: v.originalExpression,
              key: v.path
                .slice(
                  0,
                  v.path.findIndex(
                    (p) => !p.startsWith(':') && !p.startsWith('@'),
                  ) + 1,
                )
                .join('_'),
              path: v.path.join('_'),
            }));

            if (state.options.styleResolution === 'legacy-expand-shorthands') {
              dynamicStyles = legacyExpandShorthands(dynamicStyles);
            }

            if (t.isObjectExpression(prop.value)) {
              const value: t.ObjectExpression = prop.value;

              value.properties = value.properties.map((prop) => {
                if (!t.isObjectProperty(prop)) {
                  return prop;
                }
                const objProp: t.ObjectProperty = prop;
                const propKey =
                  objProp.key.type === 'Identifier' && !objProp.computed
                    ? objProp.key.name
                    : objProp.key.type === 'StringLiteral'
                      ? objProp.key.value
                      : null;

                if (propKey != null) {
                  const dynamicMatch = dynamicStyles.filter(
                    ({ key }) => key === propKey,
                  );
                  if (dynamicMatch.length > 0) {
                    const value = objProp.value;
                    if (t.isStringLiteral(value)) {
                      const classList = value.value.split(' ');
                      if (classList.length === 1) {
                        const cls = classList[0];
                        const expr = dynamicMatch.find(
                          ({ path }) => origClassPaths[cls] === path,
                        )?.expression;
                        if (expr != null) {
                          objProp.value = t.conditionalExpression(
                            t.binaryExpression('==', expr, t.nullLiteral()),
                            t.nullLiteral(),
                            value,
                          );
                        }
                      } else if (
                        classList.some((cls) =>
                          dynamicMatch.find(
                            ({ path }) => origClassPaths[cls] === path,
                          ),
                        )
                      ) {
                        const exprArray: $ReadOnlyArray<t.Expression> =
                          classList.map((cls, index) => {
                            const expr = dynamicMatch.find(
                              ({ path }) => origClassPaths[cls] === path,
                            )?.expression;
                            const suffix =
                              index === classList.length - 1 ? '' : ' ';
                            if (expr != null) {
                              return t.conditionalExpression(
                                t.binaryExpression('==', expr, t.nullLiteral()),
                                t.stringLiteral(''),
                                t.stringLiteral(cls + suffix),
                              );
                            }
                            return t.stringLiteral(cls + suffix);
                          });

                        const [first, ...rest] = exprArray;

                        objProp.value = rest.reduce(
                          (
                            acc: t.Expression,
                            curr: t.Expression,
                          ): t.Expression => {
                            return t.binaryExpression('+', acc, curr);
                          },
                          first as t.Expression,
                        );
                      }
                    }
                  }
                }

                return objProp;
              });

              prop.value = t.arrowFunctionExpression(
                params,
                t.arrayExpression([
                  value,
                  t.objectExpression(
                    Object.entries(inlineStyles).map(([key, value]) =>
                      t.objectProperty(t.stringLiteral(key), value.expression),
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

    const listOfStyles = Object.entries(injectedStyles).map(
      ([key, { priority, ...rest }]) => [key, rest, priority],
    );

    state.registerStyles(listOfStyles, path);

    path.replaceWith(resultAst);

    if (Object.keys(injectedStyles).length === 0) {
      return;
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
    throw path.buildCodeFrameError(
      messages.UNBOUND_STYLEX_CALL_VALUE,
      SyntaxError,
    );
  }
  const nearestStatement = findNearestStatementAncestor(path);
  if (
    !pathUtils.isProgram(nearestStatement.parentPath) &&
    !pathUtils.isExportNamedDeclaration(nearestStatement.parentPath)
  ) {
    throw path.buildCodeFrameError(messages.ONLY_TOP_LEVEL, SyntaxError);
  }
  if (path.node.arguments.length !== 1) {
    throw path.buildCodeFrameError(
      messages.ILLEGAL_ARGUMENT_LENGTH,
      SyntaxError,
    );
  }
  if (path.node.arguments[0].type !== 'ObjectExpression') {
    throw path.buildCodeFrameError(
      messages.NON_OBJECT_FOR_STYLEX_CALL,
      SyntaxError,
    );
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

function legacyExpandShorthands(
  dynamicStyles: $ReadOnlyArray<{
    +expression: t.Expression,
    +key: string,
    path: string,
  }>,
): $ReadOnlyArray<{
  +expression: t.Expression,
  +key: string,
  path: string,
}> {
  const expandedKeysToKeyPaths = dynamicStyles
    .flatMap(({ key }, i) => {
      return flatMapExpandedShorthands([key, 'p' + i], {
        styleResolution: 'legacy-expand-shorthands',
      });
    })
    .map(([key, value]) => {
      if (typeof value !== 'string') {
        return null;
      }
      const index = parseInt(value.slice(1), 10);
      const thatDynStyle = dynamicStyles[index];
      return {
        ...thatDynStyle,
        key,
        path:
          thatDynStyle.path === thatDynStyle.key
            ? key
            : thatDynStyle.path.includes(thatDynStyle.key + '_')
              ? thatDynStyle.path.replace(thatDynStyle.key + '_', key + '_')
              : thatDynStyle.path.replace('_' + thatDynStyle.key, '_' + key),
      };
    })
    .filter(Boolean);

  return expandedKeysToKeyPaths;
}
