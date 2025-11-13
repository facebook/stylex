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

import * as t from '@babel/types';
import { evaluate } from '../utils/evaluate-path';
import { utils, defineConsts as styleXDefineConsts, messages } from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import StateManager from '../utils/state-manager';

/// This function looks for `stylex.defineConsts` calls and transforms them.
/// 1. It finds and validates the first argument to `stylex.defineConsts`.
/// 2. It evaluates the style const object to a JS value, erroring on non-static or non-object values.
/// 3. It generates a theme name from the filename and export name for hashing.
/// 4. It invokes `stylexDefineConsts` to transform the JS object and collect injected styles.
/// 5. It creates a map of key-value pairs of constants to be inlined.
/// 6. It replaces the call with the transformed AST and registers the styles in state.
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

    const evaluatePathFnConfig: FunctionConfig = {
      identifiers: {},
      memberExpressions: {},
      disableImports: true,
    };
    state.applyStylexEnv(evaluatePathFnConfig.identifiers);

    const { confident, value } = evaluate(
      firstArg,
      state,
      evaluatePathFnConfig,
    );
    if (!confident) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStaticValue('defineConsts'),
        SyntaxError,
      );
    }
    if (typeof value !== 'object' || value == null) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStyleObject('defineConsts'),
        SyntaxError,
      );
    }

    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error(messages.cannotGenerateHash('defineConsts'));
    }

    const exportName = varId.name;
    const exportId = utils.genFileBasedIdentifier({ fileName, exportName });

    const [transformedJsOutput, jsOutput] = styleXDefineConsts(value, {
      ...state.options,
      exportId,
    });

    callExpressionPath.replaceWith(convertObjectToAST(transformedJsOutput));

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
      messages.unboundCallValue('defineConsts'),
      SyntaxError,
    );
  }

  if (
    exportNamedDeclarationPath == null ||
    !exportNamedDeclarationPath.isExportNamedDeclaration()
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonExportNamedDeclaration('defineConsts'),
      SyntaxError,
    );
  }

  if (callExpressionPath.node.arguments.length !== 1) {
    throw callExpressionPath.buildCodeFrameError(
      messages.illegalArgumentLength('defineConsts', 1),
      SyntaxError,
    );
  }
}
