/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import StateManager from '../utils/state-manager';
import { keyframes as stylexKeyframes, messages } from '@stylexjs/shared';

/// This function looks for `stylex.keyframes` calls and transforms them.
//. 1. It finds the first argument to `stylex.keyframes` and validates it.
/// 2. It envalues the style object to get a JS object. This also handles local constants automatically.
/// 4. It uses the `stylexKeyframes` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXKeyframes(
  path: NodePath<t.VariableDeclarator>,
  state: StateManager
) {
  const { node } = path;

  if (node.init?.type !== 'CallExpression') {
    return;
  }
  if (node.id.type !== 'Identifier') {
    return;
  }

  if (
    (node.init.callee.type === 'Identifier' &&
      state.stylexKeyframesImport.has(node.init.callee.name)) ||
    (node.init.callee.type === 'MemberExpression' &&
      node.init.callee.object.type === 'Identifier' &&
      node.init.callee.property.type === 'Identifier' &&
      state.stylexImport.has(node.init.callee.object.name) &&
      node.init.callee.property.name === 'keyframes')
  ) {
    if (node.init.arguments.length !== 1) {
      throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
    }
    if (node.init.arguments[0].type !== 'ObjectExpression') {
      throw new Error(messages.NON_OBJECT_FOR_STYLEX_CALL);
    }

    const init = path.get('init');
    const args: Array<NodePath> = init.get('arguments') as any;
    const firstArg = args[0];

    // TODO: This doesn't support nested function calls.
    // So when we add those, we'll need to replace this with an
    // expanded fork of `evaluate` from `@babel/traverse.
    const { confident, value } = firstArg.evaluate();
    if (!confident) {
      throw new Error(messages.NON_STATIC_VALUE);
    }
    const plainObject = value;
    assertValidKeyframes(plainObject);
    let [animationName, injectedStyle] = stylexKeyframes(
      plainObject,
      state.options
    );

    // This should be a string
    path.get('init').replaceWith(t.stringLiteral(animationName));

    const { ltr, priority, rtl } = injectedStyle;

    if (state.isDev || state.stylexSheetName == null) {
      // We know that the parent path is a variable declaration
      const statementPath: NodePath<t.VariableDeclaration> =
        path.parentPath as any;

      let stylexName: string | undefined;
      state.stylexImport.forEach((importName) => {
        stylexName = importName;
      });
      if (stylexName == null) {
        stylexName = '__stylex__';
        statementPath.insertBefore(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(stylexName))],
            t.stringLiteral('stylex')
          )
        );
      }

      statementPath.insertBefore(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(stylexName),
              t.identifier('inject')
            ),
            [
              t.stringLiteral(ltr),
              t.numericLiteral(priority),
              ...(rtl != null ? [t.stringLiteral(rtl)] : []),
            ]
          )
        )
      );
    }

    state.addStyle([animationName, { ltr, rtl }, priority]);
  }
}

type KeyFrameConfig = {
  [key: string]: { [key: string]: any };
};
// Validation of `stylex.keyframes` function call.
function assertValidKeyframes(obj: unknown): asserts obj is KeyFrameConfig {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
    throw new Error(messages.NON_OBJECT_FOR_STYLEX_CALL);
  }
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(messages.ILLEGAL_NAMESPACE_VALUE);
    }
  }
}
