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
import crypto from 'crypto';

export default function transformStyleXDefineConsts(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;
  if (callExpressionNode.type !== 'CallExpression') return;

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
    if (!variableDeclaratorPath.isVariableDeclarator()) return;

    const variableDeclaratorNode = variableDeclaratorPath.node;
    if (variableDeclaratorNode.id.type !== 'Identifier') return;

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
    const themeName = utils.genFileBasedIdentifier({ fileName, exportName });

    const constHash = crypto
      .createHash('md5')
      .update(JSON.stringify(value))
      .digest('hex')
      .slice(0, 8);

    const [transformedJsOutput, jsOutput] = styleXDefineConsts(value, {
      ...state.options,
      themeName,
    });

    const outputWithName = {
      ...transformedJsOutput,
      __constName__: themeName,
      __constHash__: constHash,
    };

    callExpressionPath.replaceWith(convertObjectToAST(outputWithName));

    const styles = Object.entries(jsOutput).map(([_, obj]) => [
      obj.constKey,
      {
        constKey: obj.constKey,
        constVal: obj.constVal,
        ltr: obj.ltr,
        rtl: obj.rtl ?? null,
      },
      obj.priority,
    ]);

    state.registerStyles(styles, variableDeclaratorPath);
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
