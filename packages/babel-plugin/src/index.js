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
import type { PluginObj } from '@babel/core';
import type { StyleXOptions } from './utils/state-manager';
import StateManager from './utils/state-manager';
import {
  EXTENSIONS,
  filePathResolver,
  matchesFileSuffix,
  getRelativePath,
} from './utils/state-manager';
import { readImportDeclarations, readRequires } from './visitors/imports';
import transformStyleXCreate from './visitors/stylex-create';
import transformStyleXDefineVars from './visitors/stylex-define-vars';
import transformStyleXDefineConsts from './visitors/stylex-define-consts';
import transformStyleXCreateTheme from './visitors/stylex-create-theme';
import transformStyleXKeyframes from './visitors/stylex-keyframes';
import transformStylexCall, {
  skipStylexMergeChildren,
} from './visitors/stylex-merge';
import transformStylexProps from './visitors/stylex-props';
import { skipStylexPropsChildren } from './visitors/stylex-props';

const NAME = 'stylex';

export type Options = StyleXOptions;

/**
 * Entry point for the StyleX babel plugin.
 */
function styleXTransform(): PluginObj<> {
  // To simplify state management, we use a StateManager object to abstract
  // away some of the details.
  let state: StateManager;

  /**
   * Babel plugins will run the `visitor` on "enter" by default.
   *
   * This visitor object can be read mostly top-down, except, Program.exit runs
   * after all other visitors.
   */
  return {
    name: NAME,
    visitor: {
      Program: {
        // First we reads all relevant imports and requires.
        // Store them in the StateManager object.
        enter: (path: NodePath<t.Program>, s: any) => {
          state = new StateManager(s);

          for (const block of path.get('body')) {
            if (block.isImportDeclaration()) {
              // Read and remember 'stylex' Imports
              // Consider user `path.referencesImport`
              // But what about `requires`?
              readImportDeclarations(block, state);
            }

            if (block.isVariableDeclaration()) {
              for (const decl of block.get('declarations')) {
                // Read and remember 'stylex' requires
                readRequires(decl, state);
              }
            }
          }
        },
        // After all other visitors are done, we can remove `styles=stylex.create(...)`
        // variables entirely if they're not needed.
        exit: (path: NodePath<t.Program>) => {
          path.traverse({
            ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
              const filename = state.filename;
              if (filename == null || !state.options.rewriteAliases) {
                return;
              }

              const source = path.node.source.value;

              const aliases = state.options.aliases;

              const themeFileExtension = '.stylex';
              if (!matchesFileSuffix(themeFileExtension)(source)) {
                return;
              }
              const resolvedFilePath = filePathResolver(
                source,
                filename,
                aliases,
              );

              if (resolvedFilePath == null) {
                return;
              }

              let relativeFilePath = getRelativePath(
                filename,
                resolvedFilePath,
              );

              const extension = EXTENSIONS.find((ext) =>
                relativeFilePath.endsWith(ext),
              );
              if (extension != null) {
                relativeFilePath = relativeFilePath.slice(0, -extension.length);
              }

              path.node.source.value = relativeFilePath;
            },
            Identifier(path: NodePath<t.Identifier>) {
              // Look for variables bound to `stylex.create` calls that are used
              // outside of `stylex(...)` calls
              if (path.isReferencedIdentifier()) {
                const { name } = path.node;
                if (state.styleMap.has(name)) {
                  const parentPath = path.parentPath;
                  if (parentPath.isMemberExpression()) {
                    const { property, computed } = parentPath.node;
                    if (property.type === 'Identifier' && !computed) {
                      state.markComposedNamespace([name, property.name, true]);
                    } else if (property.type === 'StringLiteral' && computed) {
                      state.markComposedNamespace([name, property.value, true]);
                    } else if (property.type === 'NumericLiteral' && computed) {
                      state.markComposedNamespace([
                        name,
                        String(property.value),
                        true,
                      ]);
                    } else {
                      state.markComposedNamespace([name, true, true]);
                    }
                  } else {
                    state.markComposedNamespace([name, true, true]);
                  }
                }
              }
            },
            CallExpression(path: NodePath<t.CallExpression>) {
              // Don't traverse the children of `stylex(...)` calls.
              // This is important for detecting which `stylex.create()` calls
              // should be kept.
              skipStylexMergeChildren(path, state);
              skipStylexPropsChildren(path, state);
            },
          });
          path.traverse({
            CallExpression(path: NodePath<t.CallExpression>) {
              transformStylexCall(path, state);
              transformStylexProps(path, state);
            },
          });

          const varsToKeep: { [string]: true | Array<string> } = {};
          for (const [varName, namespaceName] of state.styleVarsToKeep) {
            if (varsToKeep[varName] === true) {
              continue;
            }
            if (varsToKeep[varName] == null) {
              varsToKeep[varName] =
                namespaceName === true ? true : [namespaceName];
            } else if (Array.isArray(varsToKeep[varName])) {
              if (namespaceName === true) {
                varsToKeep[varName] = true;
              } else {
                varsToKeep[varName].push(namespaceName);
              }
            }
          }

          const varsToKeepOld = new Set(
            [...state.styleVarsToKeep.values()].map(
              ([varName, _namespaceName]) => varName,
            ),
          );
          state.styleVars.forEach((path, varName) => {
            if (isExported(path)) {
              return;
            }

            if (varsToKeep[varName] === true) {
              return;
            }

            const namespacesToKeep: Array<string> = varsToKeep[varName];

            if (namespacesToKeep == null) {
              path.remove();
              return;
            }

            if (path.isVariableDeclarator()) {
              const init = path.get('init');
              if (init != null && init.isObjectExpression()) {
                for (const prop of init.get('properties')) {
                  if (prop.isObjectProperty()) {
                    const key = prop.get('key').node;
                    const keyAsString =
                      key.type === 'Identifier'
                        ? key.name
                        : key.type === 'StringLiteral'
                          ? key.value
                          : key.type === 'NumericLiteral'
                            ? String(key.value)
                            : null;

                    if (keyAsString != null) {
                      if (!namespacesToKeep.includes(keyAsString)) {
                        prop.remove();
                      } else {
                        const allNullsToKeep = [
                          ...state.styleVarsToKeep.values(),
                        ]
                          .filter(
                            ([v, namespaceName]) =>
                              v === varName && namespaceName === keyAsString,
                          )
                          .map(
                            ([_v, _namespaceName, nullPropsToKeep]) =>
                              nullPropsToKeep,
                          );
                        if (!allNullsToKeep.includes(true)) {
                          const nullsToKeep = new Set<string>(
                            allNullsToKeep
                              .filter((x): x is Array<string> => x !== true)
                              .flat(),
                          );
                          const styleObject = prop.get('value');
                          if (styleObject.isObjectExpression()) {
                            for (const styleProp of styleObject.get(
                              'properties',
                            )) {
                              if (
                                styleProp.isObjectProperty() &&
                                styleProp.get('value').isNullLiteral()
                              ) {
                                const styleKey = styleProp.get('key').node;
                                const styleKeyAsString =
                                  styleKey.type === 'Identifier'
                                    ? styleKey.name
                                    : styleKey.type === 'StringLiteral'
                                      ? styleKey.value
                                      : styleKey.type === 'NumericLiteral'
                                        ? String(styleKey.value)
                                        : null;

                                if (
                                  styleKeyAsString != null &&
                                  !nullsToKeep.has(styleKeyAsString)
                                ) {
                                  styleProp.remove();
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            if (!varsToKeepOld.has(varName) && !isExported(path)) {
              path.remove();
            }
          });
        },
      },

      CallExpression(path: NodePath<t.CallExpression>) {
        if (path.parentPath.isVariableDeclarator()) {
          // # Look for `stylex.keyframes` calls
          //   Needs to be handled *before* `stylex.create` as the `create` call
          //   may use the generated animation name.
          transformStyleXKeyframes(path.parentPath, state);
        }
        transformStyleXDefineVars(path, state);
        transformStyleXDefineConsts(path, state);
        transformStyleXCreateTheme(path, state);
        transformStyleXCreate(path, state);
      },
    },
  };
}

function stylexPluginWithOptions(
  options: Partial<StyleXOptions>,
): [typeof styleXTransform, Partial<StyleXOptions>] {
  return [styleXTransform, options];
}
styleXTransform.withOptions = stylexPluginWithOptions;

function isExported(path: null | NodePath<t.Node>): boolean {
  if (path == null || path.isProgram()) {
    return false;
  }
  if (path.isExportNamedDeclaration() || path.isExportDefaultDeclaration()) {
    return true;
  }
  return isExported(path.parentPath);
}

/**
 *
 * @param rules An array of CSS rules that has been generated and collected from all JS files
 * in a project
 * @returns A string that represents the final CSS file.
 *
 * This function take an Array of CSS rules, de-duplicates them, sorts them priority and generates
 * a final CSS file.
 *
 * When Stylex is correctly configured, the babel plugin will return an array of CSS rule objects.
 * You're expected to concatenate all the Rules into a single Array and use this function to convert
 * that into the final CSS file.
 *
 * End-users can choose to not use this function and use their own logic instead.
 */
export type Rule = [
  string,
  {
    ltr: string,
    rtl?: null | string,
    constKey?: string,
    constVal?: string | number,
  },
  number,
];
function processStylexRules(
  rules: Array<Rule>,
  useLayers: boolean = false,
): string {
  if (rules.length === 0) {
    return '';
  }

  const constantRules = rules.filter(
    ([, ruleObj]) => ruleObj?.constKey != null && ruleObj?.constVal != null,
  );
  const nonConstantRules = rules.filter(
    ([, ruleObj]) => !(ruleObj?.constKey != null && ruleObj?.constVal != null),
  );

  const constsMap: Map<string, string | number> = new Map();
  for (const [keyhash, ruleObj] of constantRules) {
    // $FlowFixMe null check above
    const constVal: string | number = ruleObj.constVal;
    const constName = `var(--${keyhash})`;
    constsMap.set(constName, constVal);
  }

  function resolveConstant(
    value: string | number,
    visited: Set<string> = new Set(),
  ): string | number {
    if (typeof value !== 'string') return value;
    const regex = /var\((--[A-Za-z0-9_-]+)\)/g;
    let result: string = value;
    let match: RegExp$matchResult | null;
    while ((match = regex.exec(result)) !== null) {
      if (match == null) continue;
      const ref = match[1];
      if (visited.has(ref)) {
        throw new Error(`circular reference detected for constant ${ref}`);
      }
      const refKey = `var(${ref})`;
      const refValue = constsMap.get(refKey);
      if (refValue == null) continue;
      visited.add(ref);
      const replacement = resolveConstant(refValue, visited);
      result = result.replace(match[0], replacement.toString());
      visited.delete(ref);
      regex.lastIndex = 0;
    }
    return result;
  }

  for (const [key, value] of constsMap.entries()) {
    constsMap.set(key, resolveConstant(value));
  }

  const sortedRules = nonConstantRules.sort(
    (
      [, { ltr: rule1 }, firstPriority]: [string, any, number],
      [, { ltr: rule2 }, secondPriority]: [string, any, number],
    ) => {
      const priorityComparison = firstPriority - secondPriority;
      if (priorityComparison !== 0) return priorityComparison;
      if (rule1.startsWith('@') && !rule2.startsWith('@')) {
        const query1 = rule1.slice(0, rule1.indexOf('{'));
        const query2 = rule2.slice(0, rule2.indexOf('{'));
        if (query1 !== query2) {
          return query1.localeCompare(query2);
        }
      }
      const property1 = rule1.slice(rule1.lastIndexOf('{'));
      const property2 = rule2.slice(rule2.lastIndexOf('{'));
      return property1.localeCompare(property2);
    },
  );

  let lastKPri = -1;
  const grouped = sortedRules.reduce((acc: Array<Array<Rule>>, rule) => {
    const [_key, styleObj, priority] = rule;
    const priorityLevel = Math.floor(priority / 1000);

    Object.keys(styleObj).forEach((dir) => {
      let original = styleObj[dir];

      for (const [varRef, constValue] of constsMap.entries()) {
        if (typeof original === 'string') {
          const replacement = String(constValue);
          original = original.replaceAll(varRef, replacement);
          styleObj[dir] = original;
        }
      }
    });

    if (priorityLevel === lastKPri) {
      acc[acc.length - 1].push(rule);
      return acc;
    }

    lastKPri = priorityLevel;
    acc.push([rule]);
    return acc;
  }, []);

  const header = useLayers
    ? '\n@layer ' +
      grouped.map((_, index) => `priority${index + 1}`).join(', ') +
      ';\n'
    : '';

  const collectedCSS = grouped
    .map((group, index) => {
      const collectedCSS = Array.from(
        new Map(group.map(([a, b]) => [a, b])).values(),
      )
        .flatMap(({ ltr, rtl }) => {
          let ltrRule = ltr,
            rtlRule = rtl;

          if (!useLayers) {
            ltrRule = addSpecificityLevel(ltrRule, index);
            rtlRule = rtlRule && addSpecificityLevel(rtlRule, index);
          }

          return rtlRule
            ? [
                addAncestorSelector(ltrRule, "html:not([dir='rtl'])"),
                addAncestorSelector(rtlRule, "html[dir='rtl']"),
              ]
            : [ltrRule];
        })
        .join('\n');

      return useLayers
        ? `@layer priority${index + 1}{\n${collectedCSS}\n}`
        : collectedCSS;
    })
    .join('\n');

  return header + collectedCSS;
}

styleXTransform.processStylexRules = processStylexRules;

/**
 * Adds an ancestor selector in a media-query-aware way.
 *
 * Helper function for `processStylexRules`.
 */
function addAncestorSelector(
  selector: string,
  ancestorSelector: string,
): string {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  if (!selector.startsWith('@')) {
    return `${ancestorSelector} ${selector}`;
  }

  const lastAtRule = selector.lastIndexOf('@');
  const atRuleBracketIndex = selector.indexOf('{', lastAtRule);
  const mediaQueryPart = selector.slice(0, atRuleBracketIndex + 1);
  const rest = selector.slice(atRuleBracketIndex + 1);
  return `${mediaQueryPart}${ancestorSelector} ${rest}`;
}

/**
 * Adds :not(#\#) to bump up specificity. as a polyfill for @layer
 */
function addSpecificityLevel(selector: string, index: number): string {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  const pseudo = Array.from({ length: index })
    .map(() => ':not(#\\#)')
    .join('');

  const lastOpenCurly = selector.includes('::')
    ? selector.indexOf('::')
    : selector.lastIndexOf('{');
  const beforeCurly = selector.slice(0, lastOpenCurly);
  const afterCurly = selector.slice(lastOpenCurly);

  return `${beforeCurly}${pseudo}${afterCurly}`;
}

export type StyleXTransformObj = $ReadOnly<{
  (): PluginObj<>,
  withOptions: typeof stylexPluginWithOptions,
  processStylexRules: typeof processStylexRules,
  ...
}>;

export default styleXTransform as StyleXTransformObj;
