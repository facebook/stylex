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
import styleXPositionTry from '../shared/stylex-position-try';
import { evaluate } from '../utils/evaluate-path';
import { firstThatWorks as stylexFirstThatWorks } from '../shared';
import * as messages from '../shared/messages';

/// This function looks for `stylex.positionTry` calls within variable declarations and transforms them.
/// 1. It finds the first argument to `stylex.positionTry` and validates it.
/// 2. It evaluates the style object to get a JS object. This also handles local constants automatically.
/// 3. The actual transformation is done by `stylexPositionTry` from `../shared`
/// 4. The results are replaced, and generated CSS rules are injected as needed.

export default function transformStyleXPositionTry(
  path: NodePath<t.VariableDeclarator>,
  state: StateManager,
) {
  const initPath = path.get('init');
  if (!initPath.isCallExpression()) {
    return;
  }

  const callExpressionPath: NodePath<t.CallExpression> = initPath;
  const idPath = path.get('id');
  if (!idPath.isIdentifier()) {
    return;
  }

  const nodeInit: t.CallExpression = callExpressionPath.node;

  if (
    (nodeInit.callee.type === 'Identifier' &&
      state.stylexPositionTryImport.has(nodeInit.callee.name)) ||
    (nodeInit.callee.type === 'MemberExpression' &&
      nodeInit.callee.object.type === 'Identifier' &&
      nodeInit.callee.property.name === 'positionTry' &&
      nodeInit.callee.property.type === 'Identifier' &&
      state.stylexImport.has(nodeInit.callee.object.name))
  ) {
    const init: ?NodePath<t.Expression> = path.get('init');
    if (init == null || !init.isCallExpression()) {
      throw path.buildCodeFrameError(
        messages.nonStaticValue('positionTry'),
        SyntaxError,
      );
    }
    if (nodeInit.arguments.length !== 1) {
      throw path.buildCodeFrameError(
        messages.illegalArgumentLength('positionTry', 1),
        SyntaxError,
      );
    }
    const args: $ReadOnlyArray<NodePath<>> = init.get('arguments');
    const firstArgPath = args[0];

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

    const { confident, value } = evaluate(firstArgPath, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStaticValue('positionTry'),
        SyntaxError,
      );
    }
    const plainObject = value;
    assertValidPositionTry(firstArgPath, plainObject);
    assertValidProperties(firstArgPath, plainObject);

    const [positionTryName, { ltr, priority, rtl }] = styleXPositionTry(
      plainObject,
      state.options,
    );

    // This should be a string
    init.replaceWith(t.stringLiteral(positionTryName));

    state.registerStyles([[positionTryName, { ltr, rtl }, priority]], path);
  }
}

// Validation of `stylex.positionTry` function call.
function assertValidPositionTry(path: NodePath<>, obj: mixed) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
    throw path.buildCodeFrameError(
      messages.nonStyleObject('positionTry'),
      SyntaxError,
    );
  }
}

// TODO: Once we have a reliable validator, these property checks should be replaced with
// validators that can also validate the values.
const VALID_POSITION_TRY_PROPERTIES = [
  // anchor Properties
  'anchorName',
  // position Properties
  'positionAnchor',
  'positionArea',
  // inset Properties
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'insetBlock',
  'insetBlockEnd',
  'insetBlockStart',
  'insetInline',
  'insetInlineEnd',
  'insetInlineStart',
  // margin Properties
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  // size properties
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'blockSize',
  'inlineSize',
  'minBlockSize',
  'minInlineSize',
  'maxBlockSize',
  'maxInlineSize',
  // self alignment properties
  'alignSelf',
  'justifySelf',
  'placeSelf',
];
function assertValidProperties(path: NodePath<>, obj: Object) {
  const keys = Object.keys(obj);
  if (keys.some((key) => !VALID_POSITION_TRY_PROPERTIES.includes(key))) {
    throw path.buildCodeFrameError(
      messages.POSITION_TRY_INVALID_PROPERTY,
      SyntaxError,
    );
  }
}
