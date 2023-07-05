/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import StateManager from '../utils/state-manager';
import { overrideVars as stylexOverrideVars, messages } from '@stylexjs/shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate } from '../utils/evaluate-path';
import path from 'path';

/// This function looks for `stylex.unstable_overrideVars` calls and transforms them.
//. 1. It finds the first two arguments to `stylex.unstable_overrideVars` and validates those.
/// 2. This handles local constants automatically.
/// 4. It uses the `stylexOverrideVars` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXOverrideVars(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager
) {
  const callExpressionNode = callExpressionPath.node;

  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexOverrideVarsImport.has(callExpressionNode.callee.name)) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      callExpressionNode.callee.property.type === 'Identifier' &&
      state.stylexImport.has(callExpressionNode.callee.object.name) &&
      callExpressionNode.callee.property.name === 'unstable_overrideVars')
  ) {
    validateStyleXOverrideVars(callExpressionPath);

    // We know that parent is a variable declaration
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!variableDeclaratorPath.isVariableDeclarator()) {
      return;
    }

    const args: Array<NodePath> = callExpressionPath.get('arguments');
    const firstArg = args[0];
    const secondArg = args[1];

    const { confident: confident1, value: variables } = evaluate(
      firstArg,
      state
    );
    if (!confident1) {
      throw new Error(messages.NON_STATIC_VALUE);
    }

    const { confident: confident2, value: overrides } = evaluate(
      secondArg,
      state
    );
    if (!confident2) {
      throw new Error(messages.NON_STATIC_VALUE);
    }

    // Check that first arg has __themeName__ set
    if (
      typeof variables.__themeName__ !== 'string' ||
      variables.__themeName__ === ''
    ) {
      throw new Error(
        'Can only override variables theme created with stylex.unstable_createVars().'
      );
    }

    const [overridesObj, css] = stylexOverrideVars(
      variables,
      overrides,
      state.options
    );

    const styleKey: string = overridesObj[variables.__themeName__] as any;

    // This should be a transformed variables object
    callExpressionPath.replaceWith(convertObjectToAST(overridesObj));

    if (state.isDev || state.stylexSheetName == null) {
      // We know that the top level parent path is an variable declarator
      const statementPath: NodePath<t.ExportNamedDeclaration> =
        variableDeclaratorPath.parentPath as any;

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

      statementPath.insertBefore(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(stylexName),
              t.identifier('inject')
            ),
            [
              t.stringLiteral(css[styleKey].ltr),
              t.numericLiteral(css[styleKey].priority),
            ]
          )
        )
      );
    }

    state.addStyle([
      styleKey,
      { ltr: css[styleKey].ltr },
      css[styleKey].priority,
    ]);
  }
}

// Validates the call of `stylex.overrideVars`.
function validateStyleXOverrideVars(
  callExpressionPath: NodePath<t.CallExpression>
) {
  const variableDeclaratorPath: any = callExpressionPath.parentPath;

  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw new Error(messages.UNBOUND_STYLEX_CALL_VALUE);
  }

  if (callExpressionPath.node.arguments.length !== 2) {
    throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
  }

  if (callExpressionPath.node.arguments[1].type !== 'ObjectExpression') {
    throw new Error(messages.NON_OBJECT_FOR_STYLEX_CALL);
  }
}
