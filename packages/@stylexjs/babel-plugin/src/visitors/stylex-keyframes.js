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
import StateManager from '../utils/state-manager';
import { keyframes as stylexKeyframes, messages } from '../shared';
import { evaluate } from '../utils/evaluate-path';
import { firstThatWorks as stylexFirstThatWorks } from '../shared';

/// This function looks for `stylex.keyframes` calls and transforms them.
/// 1. It finds the first argument to `stylex.keyframes` and validates it.
/// 2. It evaluates the style object to get a JS object. This also handles local constants automatically.
/// 4. It uses the `stylexKeyframes` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXKeyframes(
  path: NodePath<t.VariableDeclarator>,
  state: StateManager,
) {
  const { node } = path;

  if (node.init?.type !== 'CallExpression') {
    return;
  }
  if (node.id.type !== 'Identifier') {
    return;
  }
  const nodeInit: t.CallExpression = node.init;

  if (
    (nodeInit.callee.type === 'Identifier' &&
      state.stylexKeyframesImport.has(nodeInit.callee.name)) ||
    (nodeInit.callee.type === 'MemberExpression' &&
      nodeInit.callee.object.type === 'Identifier' &&
      nodeInit.callee.property.name === 'keyframes' &&
      nodeInit.callee.property.type === 'Identifier' &&
      state.stylexImport.has(nodeInit.callee.object.name))
  ) {
    if (nodeInit.arguments.length !== 1) {
      throw path.buildCodeFrameError(
        messages.illegalArgumentLength('keyframes', 1),
        SyntaxError,
      );
    }
    // TODO: We should allow using references to local constants here.
    if (nodeInit.arguments[0].type !== 'ObjectExpression') {
      throw path.buildCodeFrameError(
        messages.nonStyleObject('keyframes'),
        SyntaxError,
      );
    }

    const init: ?NodePath<t.Expression> = path.get('init');
    if (init == null || !init.isCallExpression()) {
      throw path.buildCodeFrameError(
        messages.nonStaticValue('keyframes'),
        SyntaxError,
      );
    }
    const args: $ReadOnlyArray<NodePath<>> = init.get('arguments');
    const firstArg = args[0];

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexFirstThatWorksImport.forEach((name) => {
      identifiers[name] = { fn: stylexFirstThatWorks };
    });
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].firstThatWorks = { fn: stylexFirstThatWorks };
    });
    state.applyStylexEnv(identifiers);

    const { confident, value } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw path.buildCodeFrameError(
        messages.nonStaticValue('keyframes'),
        SyntaxError,
      );
    }
    const plainObject = value;
    assertValidKeyframes(path, plainObject);
    const [animationName, { ltr, priority, rtl }] = stylexKeyframes(
      plainObject,
      state.options,
    );

    // This should be a string
    init.replaceWith(t.stringLiteral(animationName));

    state.registerStyles([[animationName, { ltr, rtl }, priority]], path);
  }
}

// Validation of `stylex.keyframes` function call.
function assertValidKeyframes(
  path: NodePath<t.VariableDeclarator>,
  obj: mixed,
) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
    throw path.buildCodeFrameError(
      messages.nonStyleObject('keyframes'),
      SyntaxError,
    );
  }
  for (const [_key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw path.buildCodeFrameError(messages.NON_OBJECT_KEYFRAME, SyntaxError);
    }
  }
}
