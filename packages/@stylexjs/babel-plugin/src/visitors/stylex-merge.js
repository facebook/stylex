/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';
import type { StyleObject } from '../utils/stylex-merge-utils';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import {
  collectStyleVarsToKeep,
  makeConditionalExpression,
  resolveStylexArguments,
} from '../utils/stylex-merge-utils';
import { evaluate } from '../utils/evaluate-path';
import { legacyMerge } from '@stylexjs/stylex';

export function skipStylexMergeChildren(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const { node } = path;
  if (
    node == null ||
    node.callee.type !== 'Identifier' ||
    !state.stylexImport.has(node.callee.name)
  ) {
    return;
  }
  path.skip();
}

// If a `stylex()` call uses styles that are all locally defined,
// This function is able to pre-compute that into a single string or
// a single expression of strings and ternary expressions.
export default function transformStyleXMerge(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const { node } = path;

  if (
    node == null ||
    node.callee.type !== 'Identifier' ||
    !state.stylexImport.has(node.callee.name)
  ) {
    return;
  }

  const { resolvedArgs, bailOut, bailOutIndex, conditionalCount } =
    resolveStylexArguments(path.get('arguments'), (argPath) =>
      parseNullableStyle(argPath.node, state),
    );

  if (!state.options.enableInlinedConditionalMerge && conditionalCount) {
    collectStyleVarsToKeep(path.get('arguments'), state, {
      bailOutIndex,
      evaluateMemberExpression: (memberPath) => evaluate(memberPath, state),
    });
    return;
  }
  if (bailOut) {
    collectStyleVarsToKeep(path.get('arguments'), state, {
      bailOutIndex,
      evaluateMemberExpression: (memberPath) => evaluate(memberPath, state),
    });
    return;
  }

  path.skip();
  // convert resolvedStyles to a string + ternary expressions
  // We no longer need the keys, so we can just use the values.
  const stringExpression = makeConditionalExpression(
    resolvedArgs,
    (values: $ReadOnlyArray<?StyleObject>) =>
      t.stringLiteral(legacyMerge(values as $FlowFixMe)),
  );
  path.replaceWith(stringExpression);
}

// Looks for Null or locally defined style namespaces.
// Otherwise it returns the string "other"
// Which is used as an indicator to bail out of this optimization.
function parseNullableStyle(
  node: t.Expression,
  state: StateManager,
): null | StyleObject | 'other' {
  if (
    t.isNullLiteral(node) ||
    (t.isIdentifier(node) && node.name === 'undefined')
  ) {
    return null;
  }

  if (t.isMemberExpression(node)) {
    const { object, property, computed: computed } = node;
    let objName = null;
    let propName: null | number | string = null;
    if (
      object.type === 'Identifier' &&
      state.styleMap.has(object.name) &&
      property.type === 'Identifier' &&
      !computed
    ) {
      objName = object.name;
      propName = property.name;
    }
    if (
      object.type === 'Identifier' &&
      state.styleMap.has(object.name) &&
      (property.type === 'StringLiteral' ||
        property.type === 'NumericLiteral') &&
      computed
    ) {
      objName = object.name;
      propName = property.value;
    }

    if (objName != null && propName != null) {
      const style = state.styleMap.get(objName);
      if (style != null && style[String(propName)] != null) {
        // $FlowFixMe[incompatible-type]
        return style[String(propName)];
      }
    }
  }

  return 'other';
}
