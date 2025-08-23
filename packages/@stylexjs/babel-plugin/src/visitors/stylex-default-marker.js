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
import stylexDefaultMarker from '../shared/stylex-defaultMarker';

/**
 * Transforms calls to `stylex.defaultMarker()` (or imported `defaultMarker()`)
 * into a string literal: "stylex-marker".
 */
export default function transformStyleXDefaultMarker(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): void {
  const { node } = path;

  if (node.type !== 'CallExpression') {
    return;
  }

  if (
    (node.callee.type === 'Identifier' &&
      state.stylexDefaultMarkerImport.has(node.callee.name)) ||
    (node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'defaultMarker' &&
      state.stylexImport.has(node.callee.object.name))
  ) {
    // Validate: no arguments expected
    if (node.arguments.length !== 0) {
      throw path.buildCodeFrameError(
        messages.illegalArgumentLength('defaultMarker', 0),
        SyntaxError,
      );
    }

    const value = stylexDefaultMarker(state.options);
    path.replaceWith(t.stringLiteral(value));
  }
}
