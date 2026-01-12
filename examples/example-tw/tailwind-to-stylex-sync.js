/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Synchronous wrapper for tailwind-to-stylex Babel plugin.
 * Uses spawnSync to compile Tailwind classes synchronously.
 */

const t = require('@babel/types');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Use static requires that webpack can analyze (need .js extension)
const classesToCss = require('tailwind-to-stylex/lib/classes-to-css.js');
const helpers = require('tailwind-to-stylex/lib/helpers.js');
const pathUtils = require('tailwind-to-stylex/lib/babel-path-utils.js');

const { optimizeCss } = classesToCss;
const { convertFromCssToJss } = helpers;

// Cache for compiled classes
const cache = new Map();
const compileScriptPath = path.join(__dirname, 'tw-compile.js');

// Compile classes synchronously using a child process
function compileClassesSync(classNames) {
  const cacheKey = typeof classNames === 'string' ? classNames : classNames.join(' ');

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const candidates = typeof classNames === 'string' ? classNames.split(' ') : classNames;

  try {
    // Use dynamic require to avoid webpack bundling
    const childProcess = eval('require')('child_process');
    const result = childProcess.spawnSync('node', [compileScriptPath, JSON.stringify(candidates)], {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (result.error) {
      console.error('Compile error:', result.error.message);
      return null;
    }

    if (result.status !== 0) {
      console.error('Compile failed:', result.stderr);
      return null;
    }

    const css = optimizeCss(result.stdout);
    cache.set(cacheKey, css);
    return css;
  } catch (e) {
    console.error('Failed to compile classes:', e.message);
    return null;
  }
}

const rebaseJss = (jss) => {
  const result = {};
  const baseKeys = Object.keys(jss).filter(
    (key) => !key.startsWith(':') && !key.startsWith('@'),
  );
  const otherKeys = Object.keys(jss).filter(
    (key) => key.startsWith(':') || key.startsWith('@'),
  );
  for (const key of baseKeys) {
    result[key] = jss[key];
  }
  for (const key of otherKeys) {
    const value = jss[key];
    if (typeof value !== 'object' || value == null) {
      throw new Error(`Expected object for ${key}`);
    }
    for (const subKey of Object.keys(value)) {
      const subValue =
        typeof value[subKey] === 'object' && value[subKey] != null
          ? rebaseJss(value[subKey])
          : value[subKey];
      result[subKey] = {
        default: result[subKey] ?? null,
        [key]: subValue,
      };
    }
  }
  return result;
};

const canBeIdentifier = (value) => {
  if (value.length === 0) return false;
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) return false;
  if (value === 'undefined') return false;
  return true;
};

const convertToAst = (value) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  if (typeof value === 'boolean') return t.booleanLiteral(value);
  if (value === null) return t.nullLiteral();
  if (value === undefined) return t.identifier('undefined');
  if (Array.isArray(value)) return t.arrayExpression(value.map(convertToAst));
  if (
    typeof value === 'object' &&
    value != null &&
    typeof value.type === 'string'
  ) {
    return value;
  }
  if (typeof value === 'object' && value != null) {
    return t.objectExpression(
      Object.keys(value).map((key) =>
        t.objectProperty(
          canBeIdentifier(key) ? t.identifier(key) : t.stringLiteral(key),
          convertToAst(value[key]),
        ),
      ),
    );
  }
  throw new Error(`Cannot convert value to AST: ${String(value)}`);
};

function isCallExpressionNamed(nodePath, fnNames) {
  if (!pathUtils.isCallExpression(nodePath)) return false;
  const callee = nodePath.get('callee');
  if (!pathUtils.isIdentifier(callee)) return false;
  const name = callee.node.name;
  if (!fnNames.includes(name)) return false;
  return true;
}

// Synchronous plugin that compiles Tailwind classes via child process
module.exports = function tailwindToStylexSync() {
  let count = 0;
  let cnMap = {};
  let styleMap = {};
  let stylex;
  let styles;

  const convertTwToJs = (classNames) => {
    let resultCss, resultJSS;
    try {
      resultCss = compileClassesSync(classNames);
      if (resultCss == null) return null;
      resultJSS = convertFromCssToJss(classNames, resultCss);
      return resultJSS;
    } catch (e) {
      console.log('Error converting', classNames);
      console.log('CSS Result:', resultCss);
      console.log('JSS Result:', resultJSS, '\n\n\n\n');
      return null;
    }
  };

  const pathToStyleX = (arg) => {
    const node = arg.node;
    let expressionMap = {};
    let input;

    if (pathUtils.isStringLiteral(arg)) {
      input = arg.node.value;
    } else if (pathUtils.isTemplateLiteral(arg)) {
      let val = 0;
      const replacedExpressions = arg.node.expressions.map((e) => {
        const key = `$${++val}`;
        expressionMap[key] = e;
        return key;
      });
      input = arg.node.quasis
        .map((q, i) => q.value.raw + (replacedExpressions[i] || ''))
        .join('');
    } else {
      return node;
    }

    let keyName;
    if (input != null && cnMap[input]) {
      keyName = cnMap[input];
    } else {
      const styleObject = convertTwToJs(input);
      if (styleObject == null) return null;

      for (const key of Object.keys(styleObject)) {
        const value = styleObject[key];
        if (expressionMap[value]) {
          styleObject[key] = expressionMap[value];
        }
      }
      keyName = `$${++count}`;
      styleMap[keyName] = styleObject;
      cnMap[input] = keyName;
    }

    return t.memberExpression(styles, t.identifier(keyName));
  };

  return {
    name: 'tailwind-to-stylex-sync',
    visitor: {
      Program: {
        enter: (programPath) => {
          count = 0;
          cnMap = {};
          styleMap = {};
          stylex = programPath.scope.generateUidIdentifier('stylex');
          styles = programPath.scope.generateUidIdentifier('styles');

          programPath.traverse({
            JSXAttribute: (jsxAttributePath) => {
              const jsxOpeningElement = jsxAttributePath.parentPath.node;
              if (jsxOpeningElement.type !== 'JSXOpeningElement') return;

              const name = jsxOpeningElement.name;
              const isHTML =
                name.type === 'JSXIdentifier' &&
                name.name[0].toLocaleLowerCase() === name.name[0] &&
                name.name.match(/^[a-z][a-z0-9\-]*$/);

              const node = jsxAttributePath.node;
              if (
                node.name.name !== 'className' &&
                node.name.name !== 'class'
              ) {
                return;
              }

              let valuePath = jsxAttributePath.get('value');
              if (pathUtils.isJSXExpressionContainer(valuePath)) {
                valuePath = valuePath.get('expression');
              }

              if (isCallExpressionNamed(valuePath, ['cn', 'twMerge'])) {
                const callExpression = valuePath;
                const transformedArgs = callExpression
                  .get('arguments')
                  .map(pathToStyleX);
                if (isHTML) {
                  jsxAttributePath.replaceWith(
                    t.jsxSpreadAttribute(
                      t.callExpression(
                        t.memberExpression(stylex, t.identifier('props')),
                        transformedArgs,
                      ),
                    ),
                  );
                } else {
                  valuePath.replaceWith(t.arrayExpression(transformedArgs));
                }
                return;
              }

              const result = valuePath.evaluate();
              const { confident, value: existingValue } = result;
              if (!confident) return;
              if (typeof existingValue !== 'string') return;

              let keyName;
              if (cnMap[existingValue]) {
                keyName = cnMap[existingValue];
              } else {
                const styleObject = convertTwToJs(existingValue);
                if (styleObject == null) return;
                keyName = `$${++count}`;
                styleMap[keyName] = styleObject;
                cnMap[existingValue] = keyName;
              }

              if (isHTML) {
                jsxAttributePath.replaceWith(
                  t.jsxSpreadAttribute(
                    t.callExpression(
                      t.memberExpression(stylex, t.identifier('props')),
                      [t.memberExpression(styles, t.identifier(keyName))],
                    ),
                  ),
                );
              } else {
                valuePath.replaceWith(
                  t.jsxExpressionContainer(
                    t.memberExpression(styles, t.identifier(keyName)),
                  ),
                );
              }
            },

            CallExpression: (callExpressionPath) => {
              if (!isCallExpressionNamed(callExpressionPath, ['tw'])) return;
              const transformedArgs = callExpressionPath
                .get('arguments')
                .map(pathToStyleX);
              callExpressionPath.replaceWith(t.arrayExpression(transformedArgs));
            },
          });

          if (Object.keys(styleMap).length === 0) return;

          const statements = programPath.get('body');
          const firstStatement = statements[0];
          const lastStatement = statements[statements.length - 1];

          firstStatement.insertBefore(
            t.importDeclaration(
              [t.importNamespaceSpecifier(stylex)],
              t.stringLiteral('@stylexjs/stylex'),
            ),
          );

          lastStatement.insertAfter(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                styles,
                t.callExpression(
                  t.memberExpression(stylex, t.identifier('create')),
                  [convertToAst(styleMap)],
                ),
              ),
            ]),
          );
        },
      },
    },
  };
};
