/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as t from '@babel/types';
import type { NodePath, VisitNodeObject } from '@babel/traverse';
import { PluginObj } from '@babel/core';
import StateManager from './utils/state-manager';
import { readImportDeclarations, readRequires } from './visitors/imports';
import transformStyleXCreate from './visitors/stylex-create';
import transformStyleXKeyframes from './visitors/stylex-keyframes';
import transformStylexCall, {
  skipStylexMergeChildren,
} from './visitors/stylex-merge';

const NAME = 'stylex';

/**
 * Entry point for the StyleX babel plugin.
 */
export default function styleXTransform<U extends {}>(): PluginObj {
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

          path.traverse({
            // Look for stylex-related function calls and transform them.
            // e.g.
            //   stylex.create(...)
            //   stylex.keyframes(...)
            CallExpression(path: NodePath<t.CallExpression>) {
              if (path.parentPath.isVariableDeclarator()) {
                // # Look for `stylex.keyframes` calls
                //   Needs to be handled *before* `stylex.create` as the `create` call
                //   may use the generated animation name.
                transformStyleXKeyframes(path.parentPath, state);
              }
              transformStyleXCreate(path, state);
            },
          });
        },
        // After all other visitors are done, we can remove `styles=stylex.create(...)`
        // variables entirely if they're not needed.
        exit: (path: NodePath<t.Program>) => {
          path.traverse({
            CallExpression(path: NodePath<t.CallExpression>) {
              transformStylexCall(path, state);
            },
          });

          const varsToKeep = new Set(
            [...state.styleVarsToKeep.values()].map(
              ([varName, _namespaceName]) => varName
            )
          );
          state.styleVars.forEach((path, varName) => {
            if (!varsToKeep.has(varName) && !isExported(path)) {
              path.remove();
            }
          });
        },
      },

      CallExpression(path: NodePath<t.CallExpression>) {
        // Don't traverse the children of `stylex(...)` calls.
        // This is important for detecting which `stylex.create()` calls
        // should be kept.
        skipStylexMergeChildren(path, state);
      },

      Identifier(path: NodePath<t.Identifier>) {
        // Look for variables bound to `stylex.create` calls that are used
        // outside of `stylex(...)` calls
        if (path.isReferencedIdentifier()) {
          const { name } = path.node;
          if (state.styleMap.has(name)) {
            if (path.parentPath.isMemberExpression()) {
              const { property, computed } = path.parentPath.node;
              if (property.type === 'Identifier' && !computed) {
                state.markComposedNamespace([name, property.name]);
              }
              if (property.type === 'StringLiteral' && computed) {
                state.markComposedNamespace([name, property.value]);
              }
              state.markComposedNamespace([name, null]);
            } else {
              state.markComposedNamespace([name, null]);
            }
          }
        }
      },
    },
  };
}

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
 * @returns A string that represets the final CSS file.
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
export const processStylexRules = function processStylexRules(
  rules: Array<[string, { ltr: string; rtl?: null | string }, number]>
): string {
  if (rules.length === 0) {
    return '';
  }

  const sortedRules = rules.sort(
    ([firstSelector, , firstPriority], [secondSelector, , secondPriority]) => {
      const priorityComparison = firstPriority - secondPriority;
      if (priorityComparison !== 0) return priorityComparison;
      return firstSelector < secondSelector ? -1 : 1;
    }
  );

  const collectedCSS = Array.from(new Map(sortedRules as any).values() as any)
    .flatMap(
      ({ ltr, rtl }: any): Array<string> =>
        rtl != null
          ? [
              addAncestorSelector(ltr, "html:not([dir='rtl'])"),
              addAncestorSelector(rtl, "html[dir='rtl']"),
            ]
          : [ltr]
    )
    .join('\n');

  return collectedCSS;
};

styleXTransform.processStylexRules = processStylexRules;

/**
 * Adds an ancestor selector in a media-query-aware way.
 *
 * Helper function for `processStylexRules`.
 */
function addAncestorSelector(
  selector: string,
  ancestorSelector: string
): string {
  if (!selector.startsWith('@')) {
    return `${ancestorSelector} ${selector}`;
  }

  const firstBracketIndex = selector.indexOf('{');
  const mediaQueryPart = selector.slice(0, firstBracketIndex + 1);
  const rest = selector.slice(firstBracketIndex + 1);
  return `${mediaQueryPart}${ancestorSelector} ${rest}`;
}
