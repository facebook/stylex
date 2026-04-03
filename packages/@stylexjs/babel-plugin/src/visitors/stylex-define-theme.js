/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';
import type { InjectableStyle } from '../shared';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import { defineTheme as stylexDefineTheme, messages, utils } from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate } from '../utils/evaluate-path';
import { isCallTo, buildEvalConfig } from './visitor-utils';
import { isVariableNamedExported } from '../utils/ast-helpers';
import path from 'node:path';

/// Transforms `stylex.defineTheme` calls.
/// Supports two patterns:
///   A. export const { tokens, themes } = stylex.defineTheme({...})  (destructured)
///   B. export const myTheme = stylex.defineTheme({...})             (single binding)
///
/// Delegates to the shared styleXDefineTheme transform which composes
/// styleXDefineVarsNested + styleXCreateThemeNested internally.
export default function transformStyleXDefineTheme(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const node = callExpressionPath.node;
  if (node.type !== 'CallExpression') return;

  if (
    !isCallTo(
      node,
      state.stylexDefineThemeImport,
      'defineTheme',
      state.stylexImport,
    )
  ) {
    return;
  }

  // Validate: must be assigned to a VariableDeclarator
  const variableDeclaratorPath = callExpressionPath.parentPath;
  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator()
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.unboundCallValue('defineTheme'),
      SyntaxError,
    );
  }

  const idNode = variableDeclaratorPath.node.id;
  const isDestructured = idNode.type === 'ObjectPattern';
  const isSingleBinding = idNode.type === 'Identifier';

  if (!isDestructured && !isSingleBinding) {
    throw callExpressionPath.buildCodeFrameError(
      'defineTheme() must be assigned to a variable or destructured: ' +
        'const { tokens, themes } = stylex.defineTheme({...}) or ' +
        'const myTheme = stylex.defineTheme({...})',
      SyntaxError,
    );
  }

  // Must be a named export
  // isVariableNamedExported only works with Identifier ids.
  // For destructured patterns (ObjectPattern), walk ancestors to find ExportNamedDeclaration.
  let isExported: boolean;
  if (isDestructured) {
    let ancestor: ?NodePath<> = variableDeclaratorPath.parentPath;
    isExported = false;
    while (ancestor != null && !ancestor.isProgram()) {
      if (ancestor.isExportNamedDeclaration()) {
        isExported = true;
        break;
      }
      ancestor = ancestor.parentPath;
    }
  } else {
    isExported = isVariableNamedExported(variableDeclaratorPath);
  }

  if (!isExported) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonExportNamedDeclaration('defineTheme'),
      SyntaxError,
    );
  }

  // Must have exactly 1 argument
  if (callExpressionPath.node.arguments.length !== 1) {
    throw callExpressionPath.buildCodeFrameError(
      messages.illegalArgumentLength('defineTheme', 1),
      SyntaxError,
    );
  }

  // Static evaluation
  const firstArg = callExpressionPath.get('arguments')[0];
  const otherInjectedCSSRules: { [string]: InjectableStyle } = {};
  const { identifiers, memberExpressions } = buildEvalConfig(
    state,
    otherInjectedCSSRules,
  );

  const { confident, value: config } = evaluate(firstArg, state, {
    identifiers,
    memberExpressions,
  });

  if (!confident) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStaticValue('defineTheme'),
      SyntaxError,
    );
  }
  if (typeof config !== 'object' || config == null) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStyleObject('defineTheme'),
      SyntaxError,
    );
  }
  if (config.tokens == null || typeof config.tokens !== 'object') {
    throw callExpressionPath.buildCodeFrameError(
      'defineTheme() config must have a "tokens" property.',
      SyntaxError,
    );
  }

  // Determine exportId for hash generation
  const exportName = idNode.type === 'Identifier' ? idNode.name : 'tokens';

  const fileName = state.fileNameForHashing;
  if (fileName == null) {
    throw new Error(messages.cannotGenerateHash('defineTheme'));
  }

  // Run shared transform
  const { tokensResult, themesResult, injectableStyles } = stylexDefineTheme(
    config,
    {
      ...state.options,
      exportId: utils.genFileBasedIdentifier({
        fileName,
        exportName,
      }),
    },
  );

  // Dev/Test mode: add readable class names to themes
  let finalThemesResult: { [string]: { $$css: true, +[string]: string } } =
    themesResult;
  if (state.isTest || state.isDev) {
    const baseName = path
      .basename(state.filename ?? 'UnknownFile')
      .split('.')[0];
    const devThemesResult: { [string]: { $$css: true, +[string]: string } } =
      {};
    for (const [themeName, themeObj] of Object.entries(themesResult)) {
      const devClassName = `${baseName}__${themeName}`;
      if (state.isTest) {
        devThemesResult[themeName] = {
          [devClassName]: devClassName,
          $$css: true,
        };
      } else {
        // $FlowFixMe[cannot-spread-indexer]
        devThemesResult[themeName] = {
          [devClassName]: devClassName,
          ...themeObj,
        };
      }
    }
    finalThemesResult = devThemesResult;
  }

  // Register CSS before AST replacement (paths may be invalidated after replace)
  const listOfStyles = Object.entries({
    ...otherInjectedCSSRules,
    ...injectableStyles,
  }).map(([key, { priority, ...rest }]) => [key, rest, priority]);

  state.registerStyles(listOfStyles, variableDeclaratorPath);

  // AST Replacement
  if (isDestructured) {
    // Expand destructuring into separate declarations:
    // export const { tokens, themes } = stylex.defineTheme({...})
    //   →
    // export const tokens = { ... };
    // export const themes = { ... };
    const fullResult: { [string]: mixed } = {
      tokens: tokensResult,
      themes: finalThemesResult,
    };

    const newDeclarations: Array<t.VariableDeclaration> = [];
    if (idNode.type !== 'ObjectPattern') return;
    for (const prop of idNode.properties) {
      if (
        prop.type === 'ObjectProperty' &&
        prop.key.type === 'Identifier' &&
        prop.value.type === 'Identifier'
      ) {
        const key: string = prop.key.name;
        const localName: string =
          prop.value.type === 'Identifier'
            ? prop.value.name
            : prop.key.type === 'Identifier'
              ? prop.key.name
              : '';
        const value = fullResult[key];
        if (value == null) {
          throw callExpressionPath.buildCodeFrameError(
            `defineTheme() result does not have property "${key}". ` +
              'Valid properties are "tokens" and "themes".',
            SyntaxError,
          );
        }
        newDeclarations.push(
          t.variableDeclaration('const', [
            t.variableDeclarator(
              t.identifier(localName),
              convertObjectToAST(value as any),
            ),
          ]),
        );
      }
    }

    const variableDeclarationPath = variableDeclaratorPath.parentPath;
    const exportPath = variableDeclarationPath?.parentPath;
    if (exportPath != null && exportPath.isExportNamedDeclaration()) {
      const newExports = newDeclarations.map((decl) =>
        t.exportNamedDeclaration(decl, []),
      );
      exportPath.replaceWithMultiple(newExports);
    } else if (variableDeclarationPath != null) {
      variableDeclarationPath.replaceWithMultiple(newDeclarations);
    }
  } else {
    // Single binding: export const myTheme = stylex.defineTheme({...})
    //   → export const myTheme = { tokens: { ... }, themes: { ... } };
    const fullResult = {
      tokens: tokensResult,
      themes: finalThemesResult,
    };
    callExpressionPath.replaceWith(convertObjectToAST(fullResult));
  }
}
