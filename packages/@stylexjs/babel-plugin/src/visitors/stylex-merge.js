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
import { evaluate } from '../utils/evaluate-path';
import { legacyMerge } from '@stylexjs/stylex';

type ClassNameValue = string | null | boolean | NonStringClassNameValue;
type NonStringClassNameValue = [t.Expression, ClassNameValue, ClassNameValue];

type StyleObject = {
  [key: string]: string | null | boolean,
};

type ConditionalStyle = [t.Expression, ?StyleObject, ?StyleObject];
type ResolvedArg = ?StyleObject | ConditionalStyle;
type ResolvedArgs = Array<ResolvedArg>;

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

  const evaluatePathFnConfig: FunctionConfig = {
    identifiers: {},
    memberExpressions: {},
    disableImports: true,
  };
  state.applyStylexEnv(evaluatePathFnConfig.identifiers);

  let bailOut = false;
  let conditional = 0;

  let currentIndex = -1;
  let bailOutIndex: ?number = null;

  const resolvedArgs: ResolvedArgs = [];
  for (const arg of node.arguments) {
    currentIndex++;
    switch (arg.type) {
      case 'MemberExpression': {
        const resolved = parseNullableStyle(arg, state);
        if (resolved === 'other') {
          bailOutIndex = currentIndex;
          bailOut = true;
        } else {
          resolvedArgs.push(resolved);
        }
        break;
      }
      case 'ConditionalExpression': {
        const { test, consequent, alternate } = arg;
        const primary = parseNullableStyle(consequent, state);
        const fallback = parseNullableStyle(alternate, state);
        if (primary === 'other' || fallback === 'other') {
          bailOutIndex = currentIndex;
          bailOut = true;
        } else {
          resolvedArgs.push([test, primary, fallback]);
          conditional++;
        }
        break;
      }
      case 'LogicalExpression': {
        if (arg.operator !== '&&') {
          bailOutIndex = currentIndex;
          bailOut = true;
          break;
        }
        const { left, right } = arg;
        const leftResolved = parseNullableStyle(left, state);
        const rightResolved = parseNullableStyle(right, state);
        if (leftResolved !== 'other' || rightResolved === 'other') {
          bailOutIndex = currentIndex;
          bailOut = true;
        } else {
          resolvedArgs.push([left, rightResolved, null]);
          conditional++;
        }
        break;
      }
      default:
        bailOutIndex = currentIndex;
        bailOut = true;
        break;
    }
    if (conditional > 4) {
      bailOut = true;
    }
    if (bailOut) {
      break;
    }
  }
  if (!state.options.enableInlinedConditionalMerge && conditional) {
    bailOut = true;
  }
  if (bailOut) {
    const argumentPaths = path.get('arguments');

    let nonNullProps: Array<string> | true = [];

    let index = -1;
    for (const argPath of argumentPaths) {
      index++;
      // eslint-disable-next-line no-inner-declarations, no-loop-func
      function MemberExpression(path: NodePath<t.MemberExpression>) {
        const object = path.get('object').node;
        const property = path.get('property').node;
        const computed = path.node.computed;
        let objName: string | null = null;
        let propName: number | string | null = null;
        if (object.type === 'Identifier' && state.styleMap.has(object.name)) {
          objName = object.name;

          if (property.type === 'Identifier' && !computed) {
            propName = property.name;
          }
          if (
            (property.type === 'StringLiteral' ||
              property.type === 'NumericLiteral') &&
            computed
          ) {
            propName = property.value;
          }
        }
        let styleNonNullProps: true | Array<string> = [];
        if (bailOutIndex != null && index > bailOutIndex) {
          nonNullProps = true;
          styleNonNullProps = true;
        }
        if (nonNullProps === true) {
          styleNonNullProps = true;
        } else {
          const { confident, value: styleValue } = evaluate(
            path,
            state,
            evaluatePathFnConfig,
          );
          if (!confident || styleValue == null) {
            nonNullProps = true;
            styleNonNullProps = true;
          } else {
            styleNonNullProps =
              nonNullProps === true ? true : [...nonNullProps];
            if (nonNullProps !== true) {
              nonNullProps = [
                ...nonNullProps,
                ...Object.keys(styleValue).filter(
                  (key) => styleValue[key] !== null,
                ),
              ];
            }
          }
        }

        if (objName != null) {
          state.styleVarsToKeep.add([
            objName,
            propName != null ? String(propName) : true,
            styleNonNullProps,
          ]);
        }
      }

      if (argPath.isMemberExpression()) {
        MemberExpression(argPath);
      } else {
        argPath.traverse({
          MemberExpression,
        });
      }
    }
  } else {
    path.skip();
    // convert resolvedStyles to a string + ternary expressions
    // We no longer need the keys, so we can just use the values.
    const stringExpression = makeStringExpression(resolvedArgs);
    path.replaceWith(stringExpression);
  }
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

function makeStringExpression(values: ResolvedArgs): t.Expression {
  const conditions = values
    .filter((v: ResolvedArg): v is ConditionalStyle => Array.isArray(v))
    .map((v: ConditionalStyle) => v[0]);

  if (conditions.length === 0) {
    return t.stringLiteral(legacyMerge(...(values as any)));
  }

  const conditionPermutations = genConditionPermutations(conditions.length);
  const objEntries = conditionPermutations.map((permutation) => {
    let i = 0;
    const args = values.map((v) => {
      if (Array.isArray(v)) {
        const [_test, primary, fallback] = v;
        return permutation[i++] ? primary : fallback;
      } else {
        return v;
      }
    });
    const key = permutation.reduce(
      (soFar, bool) => (soFar << 1) | (bool ? 1 : 0),
      0,
    );
    return t.objectProperty(
      t.numericLiteral(key),
      t.stringLiteral(legacyMerge(...(args as any))),
    );
  });
  const objExpressions = t.objectExpression(objEntries);
  const conditionsToKey = genBitwiseOrOfConditions(conditions);
  return t.memberExpression(objExpressions, conditionsToKey, true);
}

// A function to generate a list of all possible permutations of true and false for a given count of conditional expressions.
// For example, if there are 2 conditional expressions, this function will return:
// [[true, true], [true, false], [false, true], [false, false]]
function genConditionPermutations(count: number): Array<Array<boolean>> {
  const result = [];
  for (let i = 0; i < 2 ** count; i++) {
    const combination = [];
    for (let j = 0; j < count; j++) {
      combination.push(Boolean(i & (1 << j)));
    }
    result.push(combination);
  }
  return result;
}

// A function to generate a bitwise or of all the conditions.
// For example, if there are 2 conditional expressions, this function will return:
// `!!test1 << 2 | !!test2 << 1
function genBitwiseOrOfConditions(
  conditions: Array<t.Expression>,
): t.Expression {
  const binaryExpressions = conditions.map((condition, i) => {
    const shift = conditions.length - i - 1;
    return t.binaryExpression(
      '<<',
      t.unaryExpression('!', t.unaryExpression('!', condition)),
      t.numericLiteral(shift),
    );
  });
  return binaryExpressions.reduce((acc, expr) => {
    return t.binaryExpression('|', acc, expr);
  });
}
