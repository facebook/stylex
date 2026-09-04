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
  createThemeNested as stylexCreateThemeNested,
  messages,
} from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate } from '../utils/evaluate-path';
import path from 'node:path';
import { isCallTo, validateDefineCall, buildEvalConfig } from './visitor-utils';

/// Transforms `stylex.unstable_createThemeNested` calls.
/// Validates, evaluates both arguments, delegates to the shared
/// stylexCreateThemeNested transform, replaces the AST, and registers styles.
export default function transformStyleXCreateThemeNested(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const node = callExpressionPath.node;
  if (node.type !== 'CallExpression') return;

  if (
    !isCallTo(
      node,
      state.stylexCreateThemeNestedImport,
      'unstable_createThemeNested',
      state.stylexImport,
    )
  ) {
    return;
  }

  validateDefineCall(
    callExpressionPath,
    'unstable_createThemeNested',
    2,
    false,
  );

  const variableDeclaratorPath = callExpressionPath.parentPath;
  if (!variableDeclaratorPath.isVariableDeclarator()) return;

  const id = variableDeclaratorPath.get('id');
  if (!id.isIdentifier()) return;
  const variableName = id.node.name;

  const args: $ReadOnlyArray<NodePath<>> = callExpressionPath.get('arguments');
  const firstArg = args[0];
  const secondArg = args[1];

  // Evaluate first arg (the defineVarsNested result) without eval config
  const { confident: confident1, value: variables } = evaluate(firstArg, state);
  if (!confident1) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStaticValue('unstable_createThemeNested'),
      SyntaxError,
    );
  }

  // Check that first arg has __varGroupHash__ set
  if (
    typeof variables.__varGroupHash__ !== 'string' ||
    variables.__varGroupHash__ === ''
  ) {
    throw callExpressionPath.buildCodeFrameError(
      'Can only override variables theme created with unstable_defineVarsNested().',
      SyntaxError,
    );
  }

  // Evaluate second arg (overrides) with keyframes/positionTry/types support
  const otherInjectedCSSRules: { [string]: InjectableStyle } = {};
  const { identifiers, memberExpressions } = buildEvalConfig(
    state,
    otherInjectedCSSRules,
  );

  const { confident: confident2, value: overrides } = evaluate(
    secondArg,
    state,
    { identifiers, memberExpressions },
  );
  if (!confident2) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStaticValue('unstable_createThemeNested'),
      SyntaxError,
    );
  }
  if (typeof overrides !== 'object' || overrides == null) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonStyleObject('unstable_createThemeNested'),
      SyntaxError,
    );
  }

  // eslint-disable-next-line prefer-const
  let [overridesObj, injectedStyles] = stylexCreateThemeNested(
    variables,
    overrides,
    state.options,
  );

  if (state.isTest) {
    const fileName = state.filename ?? 'UnknownFile';
    const basename = path.basename(fileName).split('.')[0];
    const devClassName = `${basename}__${variableName}`;
    overridesObj = {
      [devClassName]: devClassName,
      $$css: true,
    };
  } else if (state.isDev) {
    const fileName = state.filename ?? 'UnknownFile';
    const basename = path.basename(fileName).split('.')[0];
    const devClassName = `${basename}__${variableName}`;
    // $FlowFixMe[cannot-spread-indexer]
    overridesObj = {
      [devClassName]: devClassName,
      ...overridesObj,
    };
  }

  callExpressionPath.replaceWith(convertObjectToAST(overridesObj));

  const listOfStyles = Object.entries({
    ...otherInjectedCSSRules,
    ...injectedStyles,
  }).map(([key, { priority, ...rest }]) => [key, rest, priority]);

  state.registerStyles(listOfStyles, variableDeclaratorPath);
}
