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
import type { CSSType } from '../shared/types';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import {
  defineVars as stylexDefineVars,
  messages,
  utils,
  keyframes as stylexKeyframes,
  positionTry as stylexPositionTry,
  types as stylexTypes,
} from '../shared';
import { isCSSType } from '../shared/types';
import { convertObjectToAST } from '../utils/js-to-ast';
import { createVarGroupProxy, evaluate } from '../utils/evaluate-path';
import { isVariableNamedExported } from '../utils/ast-helpers';

class DefineVarsValueError extends Error {}

type NormalizedDefineVarsLeaf = string | number | null;
type NormalizedDefineVarsValue =
  | NormalizedDefineVarsLeaf
  | CSSType<>
  | { [string]: NormalizedDefineVarsValue };
type EvaluatedDefineVarsFunction = (() => mixed) & {
  __stylexParamCount?: number,
};

/// This function looks for `stylex.defineVars` calls and transforms them.
/// 1. It finds the first argument to `stylex.defineVars` and validates it.
/// 2. It evaluates the style object to get a JS object. This also handles local constants automatically.
/// 4. It uses the `stylexDefineVars` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXDefineVars(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;

  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexDefineVarsImport.has(callExpressionNode.callee.name)) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.property.name === 'defineVars' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      callExpressionNode.callee.property.type === 'Identifier' &&
      state.stylexImport.has(callExpressionNode.callee.object.name))
  ) {
    validateStyleXDefineVars(callExpressionPath);

    // We know that parent is a variable declaration
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!variableDeclaratorPath.isVariableDeclarator()) {
      return;
    }

    const variableDeclaratorNode = variableDeclaratorPath.node;

    if (variableDeclaratorNode.id.type !== 'Identifier') {
      return;
    }
    const varId: t.Identifier = variableDeclaratorNode.id;

    const args: $ReadOnlyArray<
      NodePath<
        | t.Expression
        | t.SpreadElement
        | t.JSXNamespacedName
        | t.ArgumentPlaceholder,
      >,
    > = callExpressionPath.get('arguments');
    const firstArg = args[0];

    const otherInjectedCSSRules: { [animationName: string]: InjectableStyle } =
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

    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error(messages.cannotGenerateHash('defineVars'));
    }

    const exportName = varId.name;
    let currentDependencies: Set<string> | null = null;
    const selfReferenceProxy = createVarGroupProxy({
      fileName,
      exportName,
      traversalState: state,
      onAccess: (key) => {
        currentDependencies?.add(key);
      },
    });

    const { confident, value } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStaticValue('defineVars'),
        SyntaxError,
      );
    }
    if (typeof value !== 'object' || value == null) {
      throw callExpressionPath.buildCodeFrameError(
        messages.nonStyleObject('defineVars'),
        SyntaxError,
      );
    }

    identifiers[varId.name] = selfReferenceProxy;

    let normalizedValue;
    try {
      normalizedValue = normalizeDefineVarsObject(value, {
        getCurrentDependencies: () => currentDependencies,
        setCurrentDependencies: (deps) => {
          currentDependencies = deps;
        },
      });
    } catch (error) {
      throw callExpressionPath.buildCodeFrameError(
        error instanceof Error
          ? error.message
          : messages.nonStaticValue('defineVars'),
        SyntaxError,
      );
    }

    const [variablesObj, injectedStylesSansKeyframes] = stylexDefineVars(
      normalizedValue as any,
      {
        ...state.options,
        exportId: utils.genFileBasedIdentifier({ fileName, exportName }),
      },
    );

    const injectedStyles = {
      ...otherInjectedCSSRules,
      ...injectedStylesSansKeyframes,
    };

    // This should be a transformed variables object
    callExpressionPath.replaceWith(convertObjectToAST(variablesObj));

    const listOfStyles = Object.entries(injectedStyles).map(
      ([key, { priority, ...rest }]) => [key, rest, priority],
    );

    state.registerStyles(listOfStyles, variableDeclaratorPath);
  }
}

function normalizeDefineVarsObject(
  variables: { [string]: mixed },
  dependencyState: {
    getCurrentDependencies: () => Set<string> | null,
    setCurrentDependencies: (deps: Set<string> | null) => void,
  },
): { [string]: NormalizedDefineVarsValue } {
  const normalizedVariables: { [string]: NormalizedDefineVarsValue } = {};
  const dependencyMap: Map<string, Set<string>> = new Map();

  for (const [key, value] of Object.entries(variables)) {
    const deps: Set<string> = new Set();
    dependencyMap.set(key, deps);
    normalizedVariables[key] = normalizeDefineVarsValue(
      value,
      key,
      dependencyState,
      deps,
      true,
    );
  }

  const keys: Set<string> = new Set(Object.keys(normalizedVariables));
  for (const [key, deps] of dependencyMap.entries()) {
    deps.delete('__varGroupHash__');
    for (const dependency of deps) {
      if (!keys.has(dependency)) {
        throw new DefineVarsValueError(
          messages.unknownDefineVarsReference(key, dependency),
        );
      }
    }
  }

  assertNoDefineVarsCycles(dependencyMap);
  return normalizedVariables;
}

function normalizeDefineVarsValue(
  value: mixed,
  rootKey: string,
  dependencyState: {
    getCurrentDependencies: () => Set<string> | null,
    setCurrentDependencies: (deps: Set<string> | null) => void,
  },
  dependencies: Set<string>,
  allowCSSType: boolean = false,
): NormalizedDefineVarsValue {
  if (typeof value === 'function') {
    return evaluateDefineVarsFunction(
      value as any as EvaluatedDefineVarsFunction,
      rootKey,
      dependencyState,
      dependencies,
    );
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    value === null
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    throw new DefineVarsValueError('Array is not supported in defineVars');
  }

  if (isCSSType(value)) {
    if (allowCSSType) {
      return value;
    }
    throw new DefineVarsValueError(messages.invalidDefineVarsFunctionValue());
  }

  if (typeof value === 'object' && value != null) {
    if (value.default === undefined) {
      throw new DefineVarsValueError(
        'Default value is not defined for ' + rootKey + ' variable.',
      );
    }

    const normalizedValue: { [string]: NormalizedDefineVarsValue } = {};
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      normalizedValue[nestedKey] = normalizeDefineVarsValue(
        nestedValue,
        rootKey,
        dependencyState,
        dependencies,
      );
    }
    return normalizedValue;
  }

  throw new DefineVarsValueError('Invalid value in defineVars');
}

function evaluateDefineVarsFunction(
  fn: EvaluatedDefineVarsFunction,
  rootKey: string,
  dependencyState: {
    getCurrentDependencies: () => Set<string> | null,
    setCurrentDependencies: (deps: Set<string> | null) => void,
  },
  dependencies: Set<string>,
): NormalizedDefineVarsValue {
  if ((fn.__stylexParamCount ?? fn.length) !== 0) {
    throw new DefineVarsValueError(messages.invalidDefineVarsFunctionValue());
  }

  const prevDependencies = dependencyState.getCurrentDependencies();
  dependencyState.setCurrentDependencies(dependencies);

  let result;
  try {
    result = fn();
  } catch {
    throw new DefineVarsValueError(messages.nonStaticValue('defineVars'));
  } finally {
    dependencyState.setCurrentDependencies(prevDependencies);
  }
  if (typeof result === 'function') {
    throw new DefineVarsValueError(messages.invalidDefineVarsFunctionValue());
  }
  if (isCSSType(result)) {
    return result;
  }

  return normalizeDefineVarsValue(
    result,
    rootKey,
    dependencyState,
    dependencies,
  );
}

function assertNoDefineVarsCycles(
  dependencyMap: Map<string, Set<string>>,
): void {
  const visited: Set<string> = new Set();
  const inStack: Set<string> = new Set();
  const stack: Array<string> = [];

  function visit(key: string): void {
    if (inStack.has(key)) {
      const cycleStart = stack.indexOf(key);
      const cycle = [...stack.slice(cycleStart), key].join(' -> ');
      throw new DefineVarsValueError(messages.cyclicDefineVarsReference(cycle));
    }
    if (visited.has(key)) {
      return;
    }

    visited.add(key);
    inStack.add(key);
    stack.push(key);

    for (const dependency of dependencyMap.get(key) ?? []) {
      if (!dependencyMap.has(dependency)) {
        continue;
      }
      visit(dependency);
    }

    stack.pop();
    inStack.delete(key);
  }

  for (const key of dependencyMap.keys()) {
    visit(key);
  }
}

// Validates the call of `stylex.defineVars`.
function validateStyleXDefineVars(
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
      messages.unboundCallValue('defineVars'),
      SyntaxError,
    );
  }

  if (!isVariableNamedExported(variableDeclaratorPath)) {
    throw callExpressionPath.buildCodeFrameError(
      messages.nonExportNamedDeclaration('defineVars'),
      SyntaxError,
    );
  }

  if (callExpressionPath.node.arguments.length !== 1) {
    throw callExpressionPath.buildCodeFrameError(
      messages.illegalArgumentLength('defineVars', 1),
      SyntaxError,
    );
  }
}
