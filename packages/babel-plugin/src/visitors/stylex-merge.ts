/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CompiledStyles } from '@stylexjs/shared';
import type { NodePath } from '@babel/traverse';

import * as t from '@babel/types';
import traverse from '@babel/traverse';
import StateManager from '../utils/state-manager';

type ClassNameValue = string | null | boolean | NonStringClassNameValue;
type NonStringClassNameValue = [t.Expression, ClassNameValue, ClassNameValue];
type TResolvedStyles = { [key: string]: ClassNameValue };

export function skipStylexMergeChildren(
  path: NodePath<t.CallExpression>,
  state: StateManager
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
  state: StateManager
) {
  const { node } = path;

  if (
    node == null ||
    node.callee.type !== 'Identifier' ||
    !state.stylexImport.has(node.callee.name)
  ) {
    return;
  }

  let bailOut = false;
  const resolvedStyles: TResolvedStyles = {};
  let conditional = false;
  for (const arg of node.arguments) {
    switch (arg.type) {
      case 'MemberExpression':
        const { property, object, computed } = arg;
        let objName = null;
        let propName = null;
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

          if (style == null || style[propName] == null) {
            throw new Error(
              `Unknown style ${objName}.${propName}. The defined style ${objName}, contains the following keys: ${Object.keys(
                style ?? {}
              ).join(', ')}`
            );
          }

          const namespace = style[propName];
          Object.assign(resolvedStyles, namespace);
        } else {
          // Unknown style found. bail out.
          bailOut = true;
        }
        break;
      case 'ConditionalExpression':
        const { test, consequent, alternate } = arg;
        const primary = parseNullableStyle(consequent, state);
        const fallback = parseNullableStyle(alternate, state);
        if (primary === 'other' || fallback === 'other') {
          bailOut = true;
          break;
        }
        if (primary === null && fallback === null) {
          // A no-op
          break;
        }
        const allKeys = new Set<string>([
          ...Object.keys(primary ?? {}),
          ...Object.keys(fallback ?? {}),
        ]);
        for (const key of allKeys) {
          // if (resolvedStyles[key] === undefined) {
          const primaryValue = firstValidValue(
            primary?.[key],
            resolvedStyles[key],
            ''
          );
          const fallbackValue = firstValidValue(
            fallback?.[key],
            resolvedStyles[key],
            ''
          );
          resolvedStyles[key] = [test, primaryValue, fallbackValue];
          // }
        }
        break;
      case 'LogicalExpression':
        if (arg.operator !== '&&') {
          bailOut = true;
          break;
        }
        const { left, right } = arg;
        if (
          left.type === 'MemberExpression' &&
          left.object.type === 'Identifier' &&
          state.styleMap.has(left.object.name)
        ) {
          // We don't support `a && b` in stylex calls where `a` is a style namespace.
          bailOut = true;
          break;
        }
        const value = parseNullableStyle(right, state);
        if (value === 'other') {
          bailOut = true;
          break;
        }
        if (value === null) {
          // A no-op??
          break;
        }
        for (const [key, val] of Object.entries(value)) {
          resolvedStyles[key] = [left, val, resolvedStyles[key] ?? ''];
        }
        break;
      default:
        bailOut = true;
        break;
    }
  }
  if (bailOut) {
    path.traverse({
      MemberExpression(path) {
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
        if (objName != null) {
          state.styleVarsToKeep.add([
            objName,
            propName != null ? String(propName) : null,
          ]);
        }
      },
    });
  } else {
    path.skip();
    // convert resolvedStyles to a string + ternary expressions
    // We no longer need the keys, so we can just use the values.
    const stringExpression = makeStringExpression(
      Object.values(resolvedStyles)
    );
    path.replaceWith(stringExpression);
  }
}

type NestedStyles = {
  [key: string]:
    | string
    | null
    | boolean
    | { [key: string]: string | null | boolean };
};

function firstValidValue(
  ...values: Array<ClassNameValue | undefined>
): ClassNameValue {
  const [first, ...rest] = values;
  return first !== undefined ? first : firstValidValue(...rest);
}
// Looks for Null or locally defined style namespaces.
// Otherwise it returns the string "other"
// Which is used as an indicator to bail out of this optimization.
function parseNullableStyle(
  node: t.Expression,
  state: StateManager
): null | { [key: string]: string | null | boolean } | 'other' {
  if (
    t.isNullLiteral(node) ||
    (t.isIdentifier(node) && node.name === 'undefined')
  ) {
    return null;
  }
  if (t.isMemberExpression(node)) {
    const { object: obj, property: prop, computed: computed } = node;
    if (
      obj.type !== 'Identifier' ||
      !state.styleMap.has(obj.name) ||
      prop.type !== 'Identifier' ||
      computed
    ) {
      return 'other';
    }

    const namespace1 = state.styleMap.get(obj.name);
    if (namespace1 == null) {
      return 'other';
    }
    const style = namespace1[prop.name];

    if (style == null) {
      return 'other';
    }
    return style;
  } else {
    return 'other';
  }
}

function makeStringExpression(
  values: ReadonlyArray<ClassNameValue>,
  inTernary: boolean = false
): t.Expression {
  // To start let's split the plain strings and everything else.
  let strings = values
    .filter((value) => typeof value === 'string')
    .join(' ')
    .trim();
  if (inTernary && strings !== '') {
    strings = ' ' + strings;
  }

  const nonPrimitive = values.filter(
    (value: ClassNameValue): value is NonStringClassNameValue =>
      typeof value !== 'string' && typeof value !== 'boolean' && value != null
  );

  const groupedByTest = groupBy(
    nonPrimitive,
    ([test, _a, _b]: NonStringClassNameValue) => test
  );

  const eachTernary = [...groupedByTest.entries()].map(
    ([test, value]: [t.Expression, Array<NonStringClassNameValue>]) => {
      const consequents = makeStringExpression(
        value.map(([_a, a, _b]: NonStringClassNameValue) => a),
        true
      );
      const fallbacks = makeStringExpression(
        value.map(([_a, _b, b]: NonStringClassNameValue) => b),
        true
      );

      return t.conditionalExpression(test, consequents, fallbacks);
    }
  );

  return addAll([t.stringLiteral(strings), ...eachTernary]);
}

function addAll([first, ...nodes]: ReadonlyArray<t.Expression>): t.Expression {
  if (nodes.length === 0) {
    return first;
  }
  return t.binaryExpression('+', first, addAll(nodes));
}

// Array groupBy function
function groupBy<T, K>(
  array: ReadonlyArray<T>,
  key: (item: T) => K
): Map<K, Array<T>> {
  const result: Map<K, Array<T>> = new Map();
  for (const item of array) {
    const k = key(item);
    const array = result.get(k) ?? [];
    array.push(item);
    result.set(k, array);
  }
  return result;
}
