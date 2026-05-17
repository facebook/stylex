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
import { isCallTo, validateDefineCall } from './visitor-utils';

/// Transforms `stylex.unstable_defineConstsNested` calls.
/// Validates, evaluates the argument statically (with imports disabled),
/// delegates to the shared styleXDefineConstsNested transform, replaces
/// the AST, and registers the const metadata.
export default function transformStyleXDefineConstsNested(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const node = callExpressionPath.node;
  if (node.type !== 'CallExpression') return;

  if (
    !isCallTo(
      node,
      state.stylexDefineConstsNestedImport,
      'unstable_defineConstsNested',
      state.stylexImport,
    )
  ) {
    return;
  }

  validateDefineCall(callExpressionPath, 'unstable_defineConstsNested', 1);

  const variableDeclaratorPath = callExpressionPath.parentPath;
  if (!variableDeclaratorPath.isVariableDeclarator()) return;

  const variableDeclaratorNode = variableDeclaratorPath.node;
  if (variableDeclaratorNode.id.type !== 'Identifier') return;
  const varId: t.Identifier = variableDeclaratorNode.id;

  const firstArg = callExpressionPath.get('arguments')[0];

  const evaluatePathFnConfig: FunctionConfig = {
    identifiers: {},
    memberExpressions: {},
    disableImports: true,
  };
  state.applyStylexEnv(evaluatePathFnConfig.identifiers);

  const { confident, value } = evaluate(firstArg, state, evaluatePathFnConfig);
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
    throw new Error(messages.cannotGenerateHash('unstable_defineConstsNested'));
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
