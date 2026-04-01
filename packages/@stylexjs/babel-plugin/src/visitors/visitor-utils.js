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
  messages,
  keyframes as stylexKeyframes,
  positionTry as stylexPositionTry,
  types as stylexTypes,
} from '../shared';
import { isVariableNamedExported } from '../utils/ast-helpers';

/// Checks if a CallExpression matches either a named import or a member expression call.
/// e.g., `unstable_defineVarsNested(...)` or `stylex.unstable_defineVarsNested(...)`
export function isCallTo(
  node: t.CallExpression,
  importSet: Set<string>,
  memberName: string,
  stylexImport: Set<string>,
): boolean {
  return (
    (node.callee.type === 'Identifier' && importSet.has(node.callee.name)) ||
    (node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === memberName &&
      stylexImport.has(node.callee.object.name))
  );
}

/// Validates that a stylex define/createTheme call is:
/// 1. Assigned to a variable declarator with an Identifier
/// 2. A named export (for defineVars/defineConsts) — set requireExport=true
/// 3. Has the expected number of arguments
export function validateDefineCall(
  callExpressionPath: NodePath<t.CallExpression>,
  apiName: string,
  argCount: number,
  requireExport: boolean = true,
): void {
  const variableDeclaratorPath: any = callExpressionPath.parentPath;

  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw callExpressionPath.buildCodeFrameError(
      messages.unboundCallValue(apiName),
      SyntaxError,
    );
  }

  if (requireExport && !isVariableNamedExported(variableDeclaratorPath)) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonExportNamedDeclaration(apiName),
      SyntaxError,
    );
  }

  if (callExpressionPath.node.arguments.length !== argCount) {
    throw callExpressionPath.buildCodeFrameError(
      messages.illegalArgumentLength(apiName, argCount),
      SyntaxError,
    );
  }
}

/// Builds the evaluation config for resolving keyframes, positionTry, types, and env
/// within defineVars/createTheme arguments. Returns the identifiers and memberExpressions
/// maps needed by the evaluate() function.
export function buildEvalConfig(
  state: StateManager,
  otherInjectedCSSRules: { [string]: InjectableStyle },
): {
  identifiers: FunctionConfig['identifiers'],
  memberExpressions: FunctionConfig['memberExpressions'],
} {
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
  function positionTry<
    Obj: {
      +[k: string]: string | number,
    },
  >(fallbackStyles: Obj): string {
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
    identifiers[name] = stylexTypes;
  });
  state.stylexImport.forEach((name) => {
    if (memberExpressions[name] === undefined) {
      memberExpressions[name] = {};
    }

    memberExpressions[name].keyframes = { fn: keyframes };
    memberExpressions[name].positionTry = { fn: positionTry };
    identifiers[name] = { ...(identifiers[name] ?? {}), types: stylexTypes };
  });
  state.applyStylexEnv(identifiers);

  return { identifiers, memberExpressions };
}
