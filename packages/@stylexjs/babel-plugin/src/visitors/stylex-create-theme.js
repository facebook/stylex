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
import type { InjectableStyle } from '../shared';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import {
  createTheme as stylexCreateTheme,
  messages,
  keyframes as stylexKeyframes,
  positionTry as stylexPositionTry,
  types,
} from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate } from '../utils/evaluate-path';
import path from 'node:path';

/// This function looks for `stylex.createTheme` calls and transforms them.
/// 1. It finds the first two arguments to `stylex.createTheme` and validates those.
/// 2. This handles local constants automatically.
/// 4. It uses the `stylexCreateTheme` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXCreateTheme(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;

  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexCreateThemeImport.has(callExpressionNode.callee.name)) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      callExpressionNode.callee.property.type === 'Identifier' &&
      callExpressionNode.callee.property.name === 'createTheme' &&
      state.stylexImport.has(callExpressionNode.callee.object.name))
  ) {
    validateStyleXCreateTheme(callExpressionPath);

    // We know that parent is a variable declaration
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!variableDeclaratorPath.isVariableDeclarator()) {
      return;
    }
    const id = variableDeclaratorPath.get('id');
    if (!id.isIdentifier()) {
      return;
    }
    const variableName = id.node.name;

    const args: $ReadOnlyArray<NodePath<>> =
      callExpressionPath.get('arguments');
    const firstArg = args[0];
    const secondArg = args[1];

    const { confident: confident1, value: variables } = evaluate(
      firstArg,
      state,
    );
    if (!confident1) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStaticValue('createTheme'),
        SyntaxError,
      );
    }

    const otherInjectedCSSRules: { [propertyName: string]: InjectableStyle } =
      {};

    // eslint-disable-next-line no-inner-declarations
    function keyframes<
      Obj: {
        +[key: string]: { +[k: string]: string | number },
      },
    >(animation: Obj): string {
      const [animationName, injectedStyle] = stylexKeyframes(
        animation,
        state.options,
      );
      otherInjectedCSSRules[animationName] = injectedStyle;
      return animationName;
    }

    // eslint-disable-next-line no-inner-declarations
    function positionTry<Obj: { +[k: string]: string | number }>(
      fallbackStyles: Obj,
    ): string {
      const [positionTryName, injectedStyle] = stylexPositionTry(
        fallbackStyles,
        state.options,
      );
      otherInjectedCSSRules[positionTryName] = injectedStyle;
      return positionTryName;
    }

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexKeyframesImport.forEach((name) => {
      identifiers[name] = { fn: keyframes };
    });
    state.stylexPositionTryImport.forEach((name) => {
      identifiers[name] = { fn: positionTry };
    });
    state.stylexTypesImport.forEach((name) => {
      identifiers[name] = types;
    });
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] === undefined) {
        memberExpressions[name] = {};
      }

      memberExpressions[name].keyframes = { fn: keyframes };
      memberExpressions[name].positionTry = { fn: positionTry };
      identifiers[name] = { ...(identifiers[name] ?? {}), types };
    });
    state.applyStylexEnv(identifiers);

    const { confident: confident2, value: overrides } = evaluate(
      secondArg,
      state,
      {
        identifiers,
        memberExpressions,
      },
    );
    if (!confident2) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStaticValue('createTheme'),
        SyntaxError,
      );
    }
    if (typeof overrides !== 'object' || overrides == null) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStyleObject('createTheme'),
        SyntaxError,
      );
    }

    // Check that first arg has __varGroupHash__ set
    if (
      typeof variables.__varGroupHash__ !== 'string' ||
      variables.__varGroupHash__ === ''
    ) {
      throw callExpressionPath.buildCodeFrameError(
        'Can only override variables theme created with defineVars().',
        SyntaxError,
      );
    }

    // eslint-disable-next-line prefer-const
    let [overridesObj, injectedStyles] = stylexCreateTheme(
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

    // This should be a transformed variables object
    callExpressionPath.replaceWith(convertObjectToAST(overridesObj));

    const listOfStyles = Object.entries({
      ...otherInjectedCSSRules,
      ...injectedStyles,
    }).map(([key, { priority, ...rest }]) => [key, rest, priority]);

    state.registerStyles(listOfStyles, variableDeclaratorPath);
  }
}

// Validates the call of `stylex.createTheme`.
function validateStyleXCreateTheme(
  callExpressionPath: NodePath<t.CallExpression>,
) {
  const variableDeclaratorPath: any = callExpressionPath.parentPath;

  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.unboundCallValue('createTheme'),
      SyntaxError,
    );
  }

  if (callExpressionPath.node.arguments.length !== 2) {
    throw callExpressionPath.buildCodeFrameError(
      messages.illegalArgumentLength('createTheme', 2),
      SyntaxError,
    );
  }
}
