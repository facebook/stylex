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
import * as messages from '../shared/messages';
import { evaluate } from '../utils/evaluate-path';
import {
  firstThatWorks as stylexFirstThatWorks,
  keyframes as stylexKeyframes,
} from '../shared';
import stylexViewTransitionClass from '../shared/stylex-view-transition-class';
import type { InjectableStyle } from '../shared/common-types';

/// This function looks for `stylex.viewTransitionClass` calls within variable declarations and transforms them.
/// 1. It finds the first argument to `stylex.viewTransitionClass` and validates it.
/// 2. It evaluates the style object to get a JS object. This also handles local constants automatically.
/// 3. The actual transform is done by `stylexViewTransitionClass` from `../shared`
/// 4. The results are replaced, and generated CSS rules are injected as needed.

export default function transformStyleXViewTransitionClass(
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
      state.stylexViewTransitionClassImport.has(nodeInit.callee.name)) ||
    (nodeInit.callee.type === 'MemberExpression' &&
      nodeInit.callee.object.type === 'Identifier' &&
      nodeInit.callee.property.name === 'viewTransitionClass' &&
      nodeInit.callee.property.type === 'Identifier' &&
      state.stylexImport.has(nodeInit.callee.object.name))
  ) {
    const init: ?NodePath<t.Expression> = path.get('init');
    if (init == null || !init.isCallExpression()) {
      throw path.buildCodeFrameError(
        messages.nonStaticValue('viewTransitionClass'),
        SyntaxError,
      );
    }
    if (nodeInit.arguments.length !== 1) {
      throw path.buildCodeFrameError(
        messages.illegalArgumentLength('viewTransitionClass', 1),
        SyntaxError,
      );
    }
    const args: $ReadOnlyArray<NodePath<>> = init.get('arguments');
    const firstArgPath = args[0];

    const otherInjectedCSSRules: { [propertyName: string]: InjectableStyle } =
      {};

    const keyframes = <
      Obj: {
        +[key: string]: { +[k: string]: string | number },
      },
    >(
      animation: Obj,
    ): string => {
      const [animationName, injectedStyle] = stylexKeyframes(
        animation,
        state.options,
      );
      otherInjectedCSSRules[animationName] = injectedStyle;
      return animationName;
    };

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexFirstThatWorksImport.forEach((name) => {
      identifiers[name] = { fn: stylexFirstThatWorks };
    });
    state.stylexKeyframesImport.forEach((name) => {
      identifiers[name] = { fn: keyframes };
    });
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].firstThatWorks = { fn: stylexFirstThatWorks };
      memberExpressions[name].keyframes = { fn: keyframes };
    });
    state.applyStylexEnv(identifiers);

    const { confident, value } = evaluate(firstArgPath, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStaticValue('viewTransitionClass'),
        SyntaxError,
      );
    }

    const plainObject = value;
    assertValidViewTransitionClass(firstArgPath, plainObject);
    assertValidProperties(firstArgPath, plainObject);

    const [viewTransitionClassName, { ltr, priority, rtl }] =
      stylexViewTransitionClass(plainObject, state.options);

    // This should be a string
    init.replaceWith(t.stringLiteral(viewTransitionClassName));

    const injectedStyles = {
      ...otherInjectedCSSRules,
      [viewTransitionClassName]: { priority, ltr, rtl },
    };

    const listOfStyles = Object.entries(injectedStyles).map(
      ([key, { priority, ...rest }]) => [key, rest, priority],
    );

    state.registerStyles(listOfStyles, path);
  }
}

// Validation of `stylex.viewTransitionClass` function call
function assertValidViewTransitionClass(path: NodePath<>, obj: mixed) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
    throw path.buildCodeFrameError(
      messages.nonStyleObject('viewTransitionClass'),
      SyntaxError,
    );
  }
}

const VALID_VIEW_TRANSITION_CLASS_PROPERTIES = [
  'group',
  'imagePair',
  'old',
  'new',
];

function assertValidProperties(path: NodePath<>, obj: Object) {
  const keys = Object.keys(obj);
  if (
    keys.some((key) => !VALID_VIEW_TRANSITION_CLASS_PROPERTIES.includes(key))
  ) {
    throw path.buildCodeFrameError(
      messages.VIEW_TRANSITION_CLASS_INVALID_PROPERTY,
      SyntaxError,
    );
  }
}
