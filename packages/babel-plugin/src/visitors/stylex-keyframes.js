/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import StateManager from '../utils/state-manager';
import { keyframes as stylexKeyframes, messages } from '@stylexjs/shared';
import * as pathUtils from '../babel-path-utils';
import { evaluate, type FunctionConfig } from '../utils/evaluate-path';
import { firstThatWorks as stylexFirstThatWorks } from '@stylexjs/shared';

/// This function looks for `stylex.keyframes` calls and transforms them.
//. 1. It finds the first argument to `stylex.keyframes` and validates it.
/// 2. It envalues the style object to get a JS object. This also handles local constants automatically.
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
      throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
    }
    if (nodeInit.arguments[0].type !== 'ObjectExpression') {
      throw new Error(messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL);
    }

    const init: ?NodePath<t.Expression> = path.get('init');
    if (init == null || !pathUtils.isCallExpression(init)) {
      throw new Error(messages.NON_STATIC_KEYFRAME_VALUE);
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

    const { confident, value } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw new Error(messages.NON_STATIC_VALUE);
    }
    const plainObject = value;
    assertValidKeyframes(plainObject);
    const [animationName, injectedStyle] = stylexKeyframes(
      plainObject,
      state.options,
    );

    // This should be a string
    init.replaceWith(t.stringLiteral(animationName));

    const { ltr, priority, rtl } = injectedStyle;

    const statementPath: ?NodePath<t.Statement> = path.getStatementParent();

    if (statementPath != null && state.runtimeInjection != null) {
      let injectName: t.Identifier;
      if (state.injectImportInserted != null) {
        injectName = state.injectImportInserted;
      } else {
        const { from, as } = state.runtimeInjection;
        injectName =
          as != null
            ? state.addNamedImport(statementPath, as, from, {
                nameHint: 'inject',
              })
            : state.addDefaultImport(statementPath, from, {
                nameHint: 'inject',
              });

        state.injectImportInserted = injectName;
      }

      statementPath.insertBefore(
        t.expressionStatement(
          t.callExpression(injectName, [
            t.stringLiteral(ltr),
            t.numericLiteral(priority),
            ...(rtl != null ? [t.stringLiteral(rtl)] : []),
          ]),
        ),
      );
    }

    state.addStyle([animationName, { ltr, rtl }, priority]);
  }
}

// Validation of `stylex.keyframes` function call.
function assertValidKeyframes(obj: mixed) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
    throw new Error(messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL);
  }
  for (const [_key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(messages.NON_OBJECT_KEYFRAME);
    }
  }
}
