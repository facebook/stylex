/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';
import type { FunctionConfig } from '../utils/evaluate-path';
import type { InjectableStyle } from '../shared';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import {
  create as stylexCreate,
  firstThatWorks as stylexFirstThatWorks,
  keyframes as stylexKeyframes,
  positionTry as stylexPositionTry,
} from '../shared';
import { addSourceMapData } from '../utils/add-sourcemap-data';
import {
  convertToTestStyles,
  injectDevClassNames,
} from '../utils/dev-classname';
import {
  convertObjectToAST,
  removeObjectsWithSpreads,
} from '../utils/js-to-ast';
import { messages } from '../shared';
import { evaluateStyleXCreateArg } from './parse-stylex-create-arg';
import flatMapExpandedShorthands from '../shared/preprocess-rules';
import { hoistExpression, pathReplaceHoisted } from '../utils/ast-helpers';

function isSafeToSkipNullCheck(expr: t.Expression): boolean {
  if (t.isTemplateLiteral(expr)) return true;

  if (
    t.isStringLiteral(expr) ||
    t.isNumericLiteral(expr) ||
    t.isBooleanLiteral(expr)
  )
    return true;

  if (t.isBinaryExpression(expr)) {
    return ['+', '-', '*', '/', '%', '**'].includes(expr.operator);
  }

  if (t.isUnaryExpression(expr)) {
    return ['-', '+'].includes(expr.operator);
  }

  if (t.isConditionalExpression(expr)) {
    return (
      isSafeToSkipNullCheck(expr.consequent) &&
      isSafeToSkipNullCheck(expr.alternate)
    );
  }

  if (t.isLogicalExpression(expr)) {
    if (expr.operator === '??' || expr.operator === '||') {
      return (
        isSafeToSkipNullCheck(expr.left) || isSafeToSkipNullCheck(expr.right)
      );
    }
    if (expr.operator === '&&') {
      return (
        isSafeToSkipNullCheck(expr.left) && isSafeToSkipNullCheck(expr.right)
      );
    }
  }

  return false;
}

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

    const otherInjectedCSSRules: { [propertyName: string]: InjectableStyle } =
      {};

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
      otherInjectedCSSRules[animationName] = injectedStyle;
      return animationName;
    }

    // eslint-disable-next-line no-inner-declarations
    function positionTry<
      Obj: {
        +[k: string]: string | number,
      },
    >(fallbackStyles: Obj): string {
      const [positionTryName, injectedStyle] = stylexPositionTry(
        fallbackStyles,
        state.options,
      );
      otherInjectedCSSRules[positionTryName] = injectedStyle;
      return positionTryName;
    }

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexFirstThatWorksImport.forEach((name) => {
      identifiers[name] = { fn: stylexFirstThatWorks };
    });
    state.stylexKeyframesImport.forEach((name) => {
      identifiers[name] = { fn: keyframes };
    });
    state.stylexPositionTryImport.forEach((name) => {
      identifiers[name] = { fn: positionTry };
    });
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].firstThatWorks = { fn: stylexFirstThatWorks };
      memberExpressions[name].keyframes = { fn: keyframes };
      memberExpressions[name].positionTry = { fn: positionTry };
    });

    const { confident, value, fns, reason, deopt } = evaluateStyleXCreateArg(
      firstArg,
      state,
      {
        identifiers,
        memberExpressions,
      },
    );

    if (!confident) {
      throw (deopt ?? path).buildCodeFrameError(
        reason ?? messages.nonStaticValue('create'),
        SyntaxError,
      );
    }
    const plainObject = value;

    // add injection that mark variables used for dynamic styles as `inherits: false`
    const injectedInheritStyles: { [string]: InjectableStyle } = {};
    if (fns != null) {
      const dynamicFnsNames = Object.values(fns)
        ?.map((entry) =>
          Object.entries(entry[1]).map(([variableName, obj]) => ({
            variableName,
            path: obj.path,
          })),
        )
        .flat();

      dynamicFnsNames.forEach(({ variableName, path }) => {
        // Pseudo elements can only access css vars via inheritance
        const isPseudoElement = path.some((p) => p.startsWith('::'));
        injectedInheritStyles[variableName] = {
          priority: 0,
          ltr: `@property ${variableName} { syntax: "*";${isPseudoElement ? '' : ' inherits: false;'}}`,
          rtl: null,
        };
      });
    }

    // eslint-disable-next-line prefer-const
    let [compiledStyles, injectedStylesSansKeyframes, classPathsPerNamespace] =
      stylexCreate(plainObject, state.options);

    const injectedStyles = {
      ...otherInjectedCSSRules,
      ...injectedStylesSansKeyframes,
      ...injectedInheritStyles,
    };

    let varName = null;
    if (path.parentPath.isVariableDeclarator()) {
      const idNode = path.parentPath.node.id;
      if (idNode.type === 'Identifier') {
        varName = idNode.name;
      }
    }

    if (state.isDebug && state.opts.enableDebugDataProp) {
      compiledStyles = {
        ...addSourceMapData(compiledStyles, path, state),
      };
    }
    if (state.isDev && state.opts.enableDevClassNames) {
      compiledStyles = {
        ...injectDevClassNames(compiledStyles, varName, state),
      };
    }
    if (state.isTest) {
      compiledStyles = {
        ...convertToTestStyles(compiledStyles, varName, state),
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

              let cssTagValue: t.Expression | t.PatternLike =
                t.booleanLiteral(true);

              const staticProps: Array<t.ObjectProperty> = [];

              const conditionalProps: Array<t.ObjectProperty> = [];

              value.properties.forEach((prop) => {
                if (!t.isObjectProperty(prop) || t.isPrivateName(prop.key)) {
                  return;
                }

                const objProp: t.ObjectProperty = prop;
                const propKey =
                  t.isIdentifier(objProp.key) && !objProp.computed
                    ? objProp.key.name
                    : t.isStringLiteral(objProp.key)
                      ? objProp.key.value
                      : null;

                if (propKey == null) {
                  staticProps.push(objProp);
                  return;
                }

                if (propKey === '$$css') {
                  cssTagValue = objProp.value;
                  return;
                }

                const classList = t.isStringLiteral(objProp.value)
                  ? objProp.value.value.split(' ')
                  : [];

                let isStatic = true;
                const exprList: t.Expression[] = [];

                classList.forEach((cls) => {
                  const expr = dynamicStyles.find(
                    ({ path }) => origClassPaths[cls] === path,
                  )?.expression;

                  if (expr && !isSafeToSkipNullCheck(expr)) {
                    isStatic = false;
                    exprList.push(
                      t.conditionalExpression(
                        t.binaryExpression('!=', expr, t.nullLiteral()),
                        t.stringLiteral(cls),
                        expr,
                      ),
                    );
                  } else {
                    exprList.push(t.stringLiteral(cls));
                  }
                });

                const joined =
                  exprList.length === 0
                    ? t.stringLiteral('')
                    : exprList.reduce((acc, curr) =>
                        t.binaryExpression('+', acc, curr),
                      );

                if (isStatic) {
                  staticProps.push(t.objectProperty(objProp.key, joined));
                } else {
                  conditionalProps.push(t.objectProperty(objProp.key, joined));
                }
              });

              let staticObj = null;
              let conditionalObj = null;

              if (staticProps.length > 0) {
                staticProps.push(
                  t.objectProperty(t.stringLiteral('$$css'), cssTagValue),
                );
                staticObj = t.objectExpression(staticProps);
              }

              if (conditionalProps.length > 0) {
                conditionalProps.push(
                  t.objectProperty(t.identifier('$$css'), cssTagValue),
                );
                conditionalObj = t.objectExpression(conditionalProps);
              }

              let finalFnValue: t.Expression = t.objectExpression(
                Object.entries(inlineStyles).map(([key, val]) =>
                  t.objectProperty(t.stringLiteral(key), val.expression),
                ),
              );
              if (staticObj != null || conditionalObj != null) {
                finalFnValue = t.arrayExpression(
                  [
                    staticObj && hoistExpression(path, staticObj),
                    conditionalObj,
                    finalFnValue,
                  ].filter(Boolean),
                );
              }

              prop.value = t.arrowFunctionExpression(params, finalFnValue);
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

    pathReplaceHoisted(path, resultAst);

    if (Object.keys(injectedStyles).length === 0) {
      return;
    }
  }
  state.inStyleXCreate = false;
}

// Validates the first argument to `stylex.create`.
function validateStyleXCreate(path: NodePath<t.CallExpression>) {
  if (path.parentPath == null || path.parentPath.isExpressionStatement()) {
    throw path.buildCodeFrameError(
      messages.unboundCallValue('create'),
      SyntaxError,
    );
  }

  if (path.node.arguments.length !== 1) {
    throw path.buildCodeFrameError(
      messages.illegalArgumentLength('create', 1),
      SyntaxError,
    );
  }

  const arg = path.node.arguments[0];
  if (arg.type !== 'ObjectExpression') {
    throw path.buildCodeFrameError(
      messages.nonStyleObject('create'),
      SyntaxError,
    );
  }

  const hasSpread = arg.properties.some((prop) => t.isSpreadElement(prop));
  if (hasSpread) {
    throw path.buildCodeFrameError(messages.NO_OBJECT_SPREADS, SyntaxError);
  }
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
