/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';

import * as t from '@babel/types';
import StateManager from './state-manager';

type ClassNameValue = string | null | boolean | NonStringClassNameValue;
type NonStringClassNameValue = [t.Expression, ClassNameValue, ClassNameValue];

export type StyleObject = {
  [key: string]: string | null | boolean,
};

export class ConditionalStyle {
  test: t.Expression;
  primary: ?StyleObject;
  fallback: ?StyleObject;
  constructor(
    test: t.Expression,
    primary: ?StyleObject,
    fallback: ?StyleObject,
  ) {
    this.test = test;
    this.primary = primary;
    this.fallback = fallback;
  }
}

export type ResolvedArg = ?StyleObject | ConditionalStyle;
export type ResolvedArgs = $ReadOnlyArray<ResolvedArg>;

export type ResolveStyle = (
  path: NodePath<t.Expression>,
) => null | StyleObject | 'other';

export type ResolveStylexArgumentsResult = {
  resolvedArgs: ResolvedArgs,
  bailOut: boolean,
  bailOutIndex: ?number,
  conditionalCount: number,
};

export function resolveStylexArguments(
  argsPaths: $ReadOnlyArray<NodePath<>>,
  resolveStyle: ResolveStyle,
  options?: {
    allowStylePath?: (path: NodePath<>) => boolean,
  },
): ResolveStylexArgumentsResult {
  let bailOut = false;
  let conditionalCount = 0;
  let currentIndex = -1;
  let bailOutIndex: ?number = null;
  const resolvedArgs: Array<ResolvedArg> = [];
  const allowStylePath = options ? options.allowStylePath : undefined;

  for (const argPath of argsPaths) {
    currentIndex++;

    if (argPath.isConditionalExpression()) {
      const arg = argPath.node;
      const { test } = arg;
      const consequentPath = argPath.get('consequent');
      const alternatePath = argPath.get('alternate');

      if (!consequentPath.isExpression() || !alternatePath.isExpression()) {
        bailOutIndex = currentIndex;
        bailOut = true;
      } else {
        const primary = resolveStyle(consequentPath);
        const fallback = resolveStyle(alternatePath);
        if (primary === 'other' || fallback === 'other') {
          bailOutIndex = currentIndex;
          bailOut = true;
        } else {
          resolvedArgs.push(new ConditionalStyle(test, primary, fallback));
          conditionalCount++;
        }
      }
    } else if (argPath.isLogicalExpression()) {
      const arg = argPath.node;
      if (arg.operator !== '&&') {
        bailOutIndex = currentIndex;
        bailOut = true;
      } else {
        const leftPath = argPath.get('left');
        const rightPath = argPath.get('right');
        if (!leftPath.isExpression() || !rightPath.isExpression()) {
          bailOutIndex = currentIndex;
          bailOut = true;
        } else {
          const leftResolved = resolveStyle(leftPath);
          const rightResolved = resolveStyle(rightPath);
          if (leftResolved !== 'other' || rightResolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push(
              new ConditionalStyle(leftPath.node, rightResolved, null),
            );
            conditionalCount++;
          }
        }
      }
    } else if (argPath.isExpression()) {
      if (allowStylePath != null && !allowStylePath(argPath)) {
        bailOutIndex = currentIndex;
        bailOut = true;
      } else {
        const resolved = resolveStyle(argPath as any as NodePath<t.Expression>);
        if (resolved === 'other') {
          bailOutIndex = currentIndex;
          bailOut = true;
        } else {
          resolvedArgs.push(resolved);
        }
      }
    } else {
      bailOutIndex = currentIndex;
      bailOut = true;
    }

    if (conditionalCount > 4) {
      bailOut = true;
    }
    if (bailOut) {
      break;
    }
  }

  return { resolvedArgs, bailOut, bailOutIndex, conditionalCount };
}

export function collectStyleVarsToKeep(
  argumentPaths: $ReadOnlyArray<NodePath<>>,
  state: StateManager,
  options: {
    bailOutIndex: ?number,
    evaluateMemberExpression: (
      path: NodePath<t.MemberExpression>,
    ) => $ReadOnly<{
      confident: boolean,
      value: any,
      ...
    }>,
    isProxyStyle?: (value: any) => boolean,
  },
): void {
  const { bailOutIndex, evaluateMemberExpression, isProxyStyle } = options;
  let nonNullProps: Array<string> | true = [];
  let index = -1;

  for (const argPath of argumentPaths) {
    index++;
    // eslint-disable-next-line no-loop-func, no-inner-declarations
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
        const { confident, value: styleValue } = evaluateMemberExpression(path);
        if (
          !confident ||
          styleValue == null ||
          (isProxyStyle != null && isProxyStyle(styleValue))
        ) {
          nonNullProps = true;
          styleNonNullProps = true;
        } else {
          styleNonNullProps = nonNullProps === true ? true : [...nonNullProps];
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
}

export function makeConditionalExpression(
  values: ResolvedArgs,
  buildResult: (styles: $ReadOnlyArray<?StyleObject>) => t.Expression,
): t.Expression {
  const conditions = values
    .filter(
      (v: ResolvedArg): v is ConditionalStyle => v instanceof ConditionalStyle,
    )
    .map((v: ConditionalStyle) => v.test);

  if (conditions.length === 0) {
    return buildResult(values as any);
  }

  const conditionPermutations = genConditionPermutations(conditions.length);
  const objEntries = conditionPermutations.map((permutation) => {
    let i = 0;
    const args = values.map((v) => {
      if (v instanceof ConditionalStyle) {
        const { primary, fallback } = v;
        return permutation[i++] ? primary : fallback;
      }
      return v;
    });
    const key = permutation.reduce(
      (soFar, bool) => (soFar << 1) | (bool ? 1 : 0),
      0,
    );
    return t.objectProperty(t.numericLiteral(key), buildResult(args as any));
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
