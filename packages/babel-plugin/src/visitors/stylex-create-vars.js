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
import {
  createVars as stylexCreateVars,
  messages,
  utils,
} from '@stylexjs/shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate, type FunctionConfig } from '../utils/evaluate-path';
import * as pathUtils from '../babel-path-utils';

/// This function looks for `stylex.createVars` calls and transforms them.
//. 1. It finds the first argument to `stylex.createVars` and validates it.
/// 2. It envalues the style object to get a JS object. This also handles local constants automatically.
/// 4. It uses the `stylexCreateVars` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXCreateVars(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;

  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexCreateVarsImport.has(callExpressionNode.callee.name)) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.property.name === 'unstable_createVars' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      callExpressionNode.callee.property.type === 'Identifier' &&
      state.stylexImport.has(callExpressionNode.callee.object.name))
  ) {
    validateStyleXCreateVars(callExpressionPath);

    // We know that parent is a variable declaration
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!pathUtils.isVariableDeclarator(variableDeclaratorPath)) {
      return;
    }

    const variableDeclaratorNode = variableDeclaratorPath.node;

    if (variableDeclaratorNode.id.type !== 'Identifier') {
      return;
    }
    const varId: t.Identifier = variableDeclaratorNode.id;

    const args: $ReadOnlyArray<
      NodePath<
        | t.Expression
        | t.SpreadElement
        | t.JSXNamespacedName
        | t.ArgumentPlaceholder,
      >,
    > = callExpressionPath.get('arguments');
    const firstArg = args[0];

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};

    const { confident, value } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw new Error(messages.NON_STATIC_VALUE);
    }
    if (typeof value !== 'object' || value == null) {
      throw new Error(messages.NON_OBJECT_FOR_STYLEX_CALL);
    }

    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error('No filename found for generating theme name.');
    }

    const exportName = varId.name;

    const [variablesObj, { css }] = stylexCreateVars(value, {
      ...state.options,
      themeName: utils.genFileBasedIdentifier({ fileName, exportName }),
    });

    // This should be a transformed variables object
    callExpressionPath.replaceWith(convertObjectToAST(variablesObj));

    if (state.isDev || state.stylexSheetName == null) {
      // We know that the top level parent path is an export named declaration
      const maybeStatementPath: ?NodePath<> =
        variableDeclaratorPath.parentPath.parentPath;
      if (maybeStatementPath == null) {
        throw new Error('impossible');
      }
      const statementPath: NodePath<> = maybeStatementPath;
      if (!pathUtils.isExportNamedDeclaration(statementPath)) {
        throw new Error('impossible');
      }

      let stylexName: string;
      state.stylexImport.forEach((importName) => {
        stylexName = importName;
      });
      if (stylexName == null) {
        stylexName = '__stylex__';
        statementPath.insertBefore(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(stylexName))],
            t.stringLiteral('stylex'),
          ),
        );
      }

      statementPath.insertBefore(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(stylexName),
              t.identifier('inject'),
            ),
            [t.stringLiteral(css), t.numericLiteral(0)],
          ),
        ),
      );
    }

    state.addStyle([variablesObj.__themeName__, { ltr: css }, 0]);
  }
}

// Validates the call of `stylex.createVars`.
function validateStyleXCreateVars(
  callExpressionPath: NodePath<t.CallExpression>,
) {
  const variableDeclaratorPath: any = callExpressionPath.parentPath;
  const exportNamedDeclarationPath =
    variableDeclaratorPath.parentPath?.parentPath;

  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw new Error(messages.UNBOUND_STYLEX_CALL_VALUE);
  }

  if (
    exportNamedDeclarationPath == null ||
    !exportNamedDeclarationPath.isExportNamedDeclaration()
  ) {
    throw new Error(messages.NON_EXPORT_NAMED_DECLARATION);
  }

  if (callExpressionPath.node.arguments.length !== 1) {
    throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
  }
}
