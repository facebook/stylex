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
import {
  utils,
  defineConstsNested as styleXDefineConstsNested,
  messages,
} from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import StateManager from '../utils/state-manager';
import { isVariableNamedExported } from '../utils/ast-helpers';

/// This function looks for `stylex.unstable_defineConstsNested` calls and transforms them.
/// 1. finds and validates the first argument to `stylex.unstable_defineConstsNested`.
/// 2. evaluates the style const object to a JS value, erroring on non-static or non-object values.
/// 3. generates a theme name from the filename and export name for hashing.
/// 4. invokes `stylexDefineConstsNested` to transform the JS object and collect injected styles.
/// 5. creates a map of key-value pairs of constants to be inlined.
/// 6. replaces the call with the transformed AST and registers the styles in state.
export default function transformStyleXDefineConstsNested(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;
  if (callExpressionNode.type !== 'CallExpression') return;

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexDefineConstsNestedImport.has(
        callExpressionNode.callee.name,
      )) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.property.name ===
        'unstable_defineConstsNested' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      state.stylexImport.has(callExpressionNode.callee.object.name))
  ) {
    validateStyleXDefineConstsNested(callExpressionPath);

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
        messages.nonStaticValue('unstable_defineConstsNested'),
        SyntaxError,
      );
    }
    if (typeof value !== 'object' || value == null) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStyleObject('unstable_defineConstsNested'),
        SyntaxError,
      );
    }

    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error(
        messages.cannotGenerateHash('unstable_defineConstsNested'),
      );
    }

    const exportName = varId.name;
    const exportId = utils.genFileBasedIdentifier({ fileName, exportName });

    const [transformedJsOutput, jsOutput] = styleXDefineConstsNested(value, {
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

    state.registerStyles(styles, variableDeclaratorPath);
  }
}

function validateStyleXDefineConstsNested(
  callExpressionPath: NodePath<t.CallExpression>,
) {
  const variableDeclaratorPath = callExpressionPath.parentPath;

  if (
    variableDeclaratorPath == null ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.unboundCallValue('unstable_defineConstsNested'),
      SyntaxError,
    );
  }

  if (!isVariableNamedExported(variableDeclaratorPath)) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonExportNamedDeclaration('unstable_defineConstsNested'),
      SyntaxError,
    );
  }

  if (callExpressionPath.node.arguments.length !== 1) {
    throw callExpressionPath.buildCodeFrameError(
      messages.illegalArgumentLength('unstable_defineConstsNested', 1),
      SyntaxError,
    );
  }
}
