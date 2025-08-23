/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import * as messages from '../shared/messages';
import stylexDefaultTarget from '../shared/stylex-defaultTarget';

/**
 * Transforms calls to `stylex.defaultTarget()` (or imported `defaultTarget()`)
 * into a string literal: "stylex-target".
 */
export default function transformStyleXDefaultTarget(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): void {
  const { node } = path;

  if (node.type !== 'CallExpression') {
    return;
  }

  if (
    (node.callee.type === 'Identifier' &&
      state.stylexDefaultTargetImport.has(node.callee.name)) ||
    (node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'defaultTarget' &&
      state.stylexImport.has(node.callee.object.name))
  ) {
    // Validate: no arguments expected
    if (node.arguments.length !== 0) {
      throw path.buildCodeFrameError(
        messages.illegalArgumentLength('defaultTarget', 0),
        SyntaxError,
      );
    }

    const value = stylexDefaultTarget(state.options);
    path.replaceWith(t.stringLiteral(value));
  }
}
