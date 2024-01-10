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
import StateManager from '../utils/state-manager';

// Read imports of react and remember the name of the local varsiables for later
export function readImportDeclarations(
  path: NodePath<t.ImportDeclaration>,
  state: StateManager,
): void {
  const { node } = path;
  if (node?.importKind === 'type' || node?.importKind === 'typeof') {
    return;
  }
  const sourcePath = node.source.value;
  if (state.importSources.includes(sourcePath)) {
    for (const specifier of node.specifiers) {
      if (
        specifier.type === 'ImportDefaultSpecifier' &&
        state.importAs(sourcePath) === null
      ) {
        state.importPaths.add(sourcePath);
        state.stylexImport.add(specifier.local.name);
      }
      if (
        specifier.type === 'ImportNamespaceSpecifier' &&
        state.importAs(sourcePath) === null
      ) {
        state.importPaths.add(sourcePath);
        state.stylexImport.add(specifier.local.name);
      }
      if (specifier.type === 'ImportSpecifier') {
        if (
          specifier.imported.type === 'Identifier' ||
          specifier.imported.type === 'StringLiteral'
        ) {
          const importedName =
            specifier.imported.type === 'Identifier'
              ? specifier.imported.name
              : specifier.imported.value;
          const localName = specifier.local.name;

          if (state.importAs(sourcePath) === importedName) {
            state.importPaths.add(sourcePath);
            state.stylexImport.add(localName);
          }
          if (state.importAs(sourcePath) === null) {
            state.importPaths.add(sourcePath);
            if (importedName === 'create') {
              state.stylexCreateImport.add(localName);
            }
            if (importedName === 'props') {
              state.stylexPropsImport.add(localName);
            }
            if (importedName === 'attrs') {
              state.stylexAttrsImport.add(localName);
            }
            if (importedName === 'keyframes') {
              state.stylexKeyframesImport.add(localName);
            }
            if (importedName === 'include') {
              state.stylexIncludeImport.add(localName);
            }
            if (importedName === 'firstThatWorks') {
              state.stylexFirstThatWorksImport.add(localName);
            }
            if (importedName === 'defineVars') {
              state.stylexDefineVarsImport.add(localName);
            }
            if (importedName === 'createTheme') {
              state.stylexCreateThemeImport.add(localName);
            }
            if (importedName === 'types') {
              state.stylexTypesImport.add(localName);
            }
          }
        }
      }
    }
  }
}

// Read require calls and remember the names of the variables for later
export function readRequires(
  path: NodePath<t.VariableDeclarator>,
  state: StateManager,
): void {
  const { node } = path;
  const init = node.init;
  if (
    init != null &&
    init.type === 'CallExpression' &&
    init.callee?.type === 'Identifier' &&
    init.callee?.name === 'require' &&
    init.arguments?.length === 1 &&
    init.arguments?.[0].type === 'StringLiteral' &&
    state.importSources.includes(init.arguments[0].value)
  ) {
    const importPath = init.arguments[0].value;
    if (importPath == null) {
      // Impossible.
      return;
    }
    state.importPaths.add(importPath);
    if (node.id.type === 'Identifier') {
      state.stylexImport.add(node.id.name);
    }
    if (node.id.type === 'ObjectPattern') {
      for (const prop of node.id.properties) {
        if (
          prop.type === 'ObjectProperty' &&
          prop.key.type === 'Identifier' &&
          prop.value.type === 'Identifier'
        ) {
          const value: t.Identifier = prop.value;
          if (prop.key.name === 'create') {
            state.stylexCreateImport.add(value.name);
          }
          if (prop.key.name === 'props') {
            state.stylexPropsImport.add(value.name);
          }
          if (prop.key.name === 'attrs') {
            state.stylexAttrsImport.add(value.name);
          }
          if (prop.key.name === 'keyframes') {
            state.stylexKeyframesImport.add(value.name);
          }
          if (prop.key.name === 'include') {
            state.stylexIncludeImport.add(value.name);
          }
          if (prop.key.name === 'firstThatWorks') {
            state.stylexFirstThatWorksImport.add(value.name);
          }
          if (prop.key.name === 'defineVars') {
            state.stylexDefineVarsImport.add(value.name);
          }
          if (prop.key.name === 'createTheme') {
            state.stylexCreateThemeImport.add(value.name);
          }
          if (prop.key.name === 'types') {
            state.stylexTypesImport.add(value.name);
          }
        }
      }
    }
  }
}
