/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as t from '@babel/types';
import { evaluate } from '../utils/evaluate-path';
import {
  utils,
  defineConsts as styleXDefineConsts,
  messages,
} from '@stylexjs/shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import type { NodePath } from '@babel/traverse';
import StateManager from '../utils/state-manager';

/**
 * This function looks for `stylex.defineConsts` calls and transforms them.
 *
 * 1. It finds the first argument to `stylex.defineConsts` and validates it.
 * 2. It evaluates the constants object to get a JS object.
 * 3. It uses `styleXDefineConsts` to transform the object into a structured format.
 * 4. It converts the resulting object back into an AST and replaces the function call with it.
 * 5. The transformed constants are stored in metadata and used during rule processing.
 * 6. During CSS rule generation, any references to `var(--keyhash)` (or `var(--keyhash, fallback)`)
 *    are replaced with their corresponding `constVal` from `defineConsts`.
 * 7. Unlike `stylex.defineVars`, `defineConsts` does not generate runtime CSS variables but instead
 *    directly inlines the resolved values into the final CSS output.
 */
export default function transformStyleXDefineConsts(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;

  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexDefineConstsImport.has(callExpressionNode.callee.name)) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.property.name === 'defineConsts' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      state.stylexImport.has(callExpressionNode.callee.object.name))
  ) {
    validateStyleXDefineConsts(callExpressionPath);

    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!variableDeclaratorPath.isVariableDeclarator()) {
      return;
    }

    const variableDeclaratorNode = variableDeclaratorPath.node;
    if (variableDeclaratorNode.id.type !== 'Identifier') {
      return;
    }

    if (variableDeclaratorNode.id.type !== 'Identifier') {
      return;
    }
    const varId: t.Identifier = variableDeclaratorNode.id;
    const args = callExpressionPath.get('arguments');
    const firstArg = args[0];

    const { confident, value } = evaluate(firstArg, state);
    if (!confident) {
      throw callExpressionPath.buildCodeFrameError(
        messages.NON_STATIC_VALUE,
        SyntaxError,
      );
    }
    if (typeof value !== 'object' || value == null) {
      throw callExpressionPath.buildCodeFrameError(
        messages.NON_OBJECT_FOR_STYLEX_CALL,
        SyntaxError,
      );
    }

    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error('No filename found for generating theme name.');
    }

    const exportName = varId.name;

    const [transformedJsOutput, jsOutput] = styleXDefineConsts(value, {
      ...state.options,
      themeName: utils.genFileBasedIdentifier({ fileName, exportName }),
    });

    callExpressionPath.replaceWith(convertObjectToAST(transformedJsOutput));

    const styles = Object.entries(jsOutput).map(([key, obj]) => [
      key,
      {
        constKey: obj.constKey,
        constVal: obj.constVal,
        ltr: obj.ltr,
        rtl: obj.rtl ?? null,
      },
      obj.priority,
    ]);

    state.registerStyles(styles);
  }
}

function validateStyleXDefineConsts(
  callExpressionPath: NodePath<t.CallExpression>,
) {
  const variableDeclaratorPath = callExpressionPath.parentPath;
  const exportNamedDeclarationPath =
    variableDeclaratorPath.parentPath?.parentPath;

  if (
    variableDeclaratorPath == null ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.UNBOUND_STYLEX_CALL_VALUE,
      SyntaxError,
    );
  }

  if (
    exportNamedDeclarationPath == null ||
    !exportNamedDeclarationPath.isExportNamedDeclaration()
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.NON_EXPORT_NAMED_DECLARATION,
      SyntaxError,
    );
  }

  if (callExpressionPath.node.arguments.length !== 1) {
    throw callExpressionPath.buildCodeFrameError(
      messages.ILLEGAL_ARGUMENT_LENGTH,
      SyntaxError,
    );
  }
}
