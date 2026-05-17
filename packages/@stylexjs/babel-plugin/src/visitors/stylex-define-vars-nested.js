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
import {
  defineVarsNested as stylexDefineVarsNested,
  messages,
  utils,
} from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate } from '../utils/evaluate-path';
import { isCallTo, validateDefineCall, buildEvalConfig } from './visitor-utils';

/// Transforms `stylex.unstable_defineVarsNested` calls.
/// Validates, evaluates the argument statically, delegates to the shared
/// stylexDefineVarsNested transform, replaces the AST, and registers styles.
export default function transformStyleXDefineVarsNested(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const node = callExpressionPath.node;
  if (node.type !== 'CallExpression') return;

  if (
    !isCallTo(
      node,
      state.stylexDefineVarsNestedImport,
      'unstable_defineVarsNested',
      state.stylexImport,
    )
  ) {
    return;
  }

  validateDefineCall(callExpressionPath, 'unstable_defineVarsNested', 1);

  const variableDeclaratorPath = callExpressionPath.parentPath;
  if (!variableDeclaratorPath.isVariableDeclarator()) return;

  const variableDeclaratorNode = variableDeclaratorPath.node;
  if (variableDeclaratorNode.id.type !== 'Identifier') return;
  const varId: t.Identifier = variableDeclaratorNode.id;

  const firstArg = callExpressionPath.get('arguments')[0];

  const otherInjectedCSSRules: { [string]: InjectableStyle } = {};
  const { identifiers, memberExpressions } = buildEvalConfig(
    state,
    otherInjectedCSSRules,
  );

  const { confident, value } = evaluate(firstArg, state, {
    identifiers,
    memberExpressions,
  });
  if (!confident) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStaticValue('unstable_defineVarsNested'),
      SyntaxError,
    );
  }
  if (typeof value !== 'object' || value == null) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStyleObject('unstable_defineVarsNested'),
      SyntaxError,
    );
  }

  const fileName = state.fileNameForHashing;
  if (fileName == null) {
    throw new Error(messages.cannotGenerateHash('unstable_defineVarsNested'));
  }

  const [variablesObj, injectedStylesSansKeyframes] = stylexDefineVarsNested(
    value,
    {
      ...state.options,
      exportId: utils.genFileBasedIdentifier({
        fileName,
        exportName: varId.name,
      }),
    },
  );

  callExpressionPath.replaceWith(convertObjectToAST(variablesObj));

  const listOfStyles = Object.entries({
    ...otherInjectedCSSRules,
    ...injectedStylesSansKeyframes,
  }).map(([key, { priority, ...rest }]) => [key, rest, priority]);

  state.registerStyles(listOfStyles, variableDeclaratorPath);
}
