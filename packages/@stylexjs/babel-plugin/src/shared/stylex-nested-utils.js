/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarsConfigValue } from './stylex-vars-utils';
import { type CSSType, isCSSType } from './types';

const SEPARATOR = '.';

// === Nested value types ===

// A nested vars value is a string, CSSType, or namespace containing more nested values.
// Conditional objects (with 'default' key) are structurally compatible with the namespace type.
export type NestedVarsValue =
  | string
  | CSSType<string | number>
  | $ReadOnly<{ +[string]: NestedVarsValue }>;

// A nested string value is either a string or a namespace of strings (for themeVars)
export type NestedStringValue =
  | string
  | $ReadOnly<{ +[string]: NestedStringValue }>;

// A nested consts value is either string/number or a namespace
export type NestedConstsValue =
  | string
  | number
  | $ReadOnly<{ +[string]: NestedConstsValue }>;

// === Helpers ===

// Convert a mixed value (known to be a conditional @-rule object) into VarsConfigValue.
// Conditional objects have a 'default' key and @-rule keys, all with string or nested
// conditional values. This reconstructs a properly-typed VarsConfigValue.
function toVarsConfigValue(value: mixed): VarsConfigValue {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value != null && !Array.isArray(value)) {
    const result: { default: VarsConfigValue, [string]: VarsConfigValue } = {
      default: '',
    };
    for (const key of Object.keys(value)) {
      result[key] = toVarsConfigValue(value[key]);
    }
    return result;
  }
  return String(value ?? '');
}

// === Generic flatten implementation ===
// Walks a nested object, building dot-separated keys.
// Stops at values where isLeaf returns true.
// Optionally transforms leaf values before storing.

function flattenImpl<T>(
  obj: { +[string]: mixed },
  prefix: string,
  result: { [string]: T },
  isLeaf: (value: mixed) => boolean,
  transformLeaf?: (value: mixed) => T,
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}${SEPARATOR}${key}` : key;

    if (isLeaf(value)) {
      result[fullKey] = transformLeaf ? transformLeaf(value) : (value as any);
    } else if (
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value)
    ) {
      flattenImpl(value, fullKey, result, isLeaf, transformLeaf);
    }
  }
}

// === Leaf detectors ===
// Each flatten variant has its own leaf detection logic.

function isVarsLeaf(value: mixed): boolean {
  if (typeof value === 'string') return true;
  if (isCSSType(value)) return true;
  if (typeof value === 'object' && value != null && !Array.isArray(value)) {
    return value.default !== undefined; // conditional @-rule value
  }
  return false;
}

function isStringLeaf(value: mixed): boolean {
  return typeof value === 'string';
}

function isConstsLeaf(value: mixed): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

// === Leaf transformers ===
// Transform leaf values into the correct output type.

function transformVarsLeaf(
  value: mixed,
): VarsConfigValue | CSSType<string | number> {
  if (typeof value === 'string') return value;
  if (isCSSType(value)) return value;
  return toVarsConfigValue(value);
}

function transformOverridesLeaf(value: mixed): VarsConfigValue {
  if (typeof value === 'string') return value;
  if (isCSSType(value)) return toVarsConfigValue(value.value);
  return toVarsConfigValue(value);
}

// === Public flatten functions ===
// These accept specific nested types (for API type safety) and delegate to
// the generic flattenImpl (for code reuse).

export function flattenNestedVarsConfig(
  obj: $ReadOnly<{ +[string]: NestedVarsValue }>,
  prefix: string = '',
): { [string]: VarsConfigValue | CSSType<string | number> } {
  const result: { [string]: VarsConfigValue | CSSType<string | number> } = {};
  flattenImpl(obj, prefix, result, isVarsLeaf, transformVarsLeaf);
  return result;
}

export function flattenNestedOverridesConfig(
  obj: $ReadOnly<{ +[string]: NestedVarsValue }>,
  prefix: string = '',
): { [string]: VarsConfigValue } {
  const result: { [string]: VarsConfigValue } = {};
  flattenImpl(obj, prefix, result, isVarsLeaf, transformOverridesLeaf);
  return result;
}

export function flattenNestedStringConfig(
  obj: $ReadOnly<{ +[string]: NestedStringValue }>,
  prefix: string = '',
): { [string]: string } {
  const result: { [string]: string } = {};
  flattenImpl(obj, prefix, result, isStringLeaf);
  return result;
}

export function flattenNestedConstsConfig(
  obj: $ReadOnly<{ +[string]: NestedConstsValue }>,
  prefix: string = '',
): { [string]: string | number } {
  const result: { [string]: string | number } = {};
  flattenImpl(obj, prefix, result, isConstsLeaf);
  return result;
}

// === Unflatten ===

// Unflatten { 'button.primary.bg': 'var(--xHash)' }
//        → { button: { primary: { bg: 'var(--xHash)' } } }
// Preserves special keys like __varGroupHash__ at top level.
const SPECIAL_KEYS = new Set(['__varGroupHash__', '$$css']);

export function unflattenObject(
  flatObj: { +[string]: mixed },
): { [string]: mixed } {
  const result: { [string]: mixed } = {};
  // Track intermediate objects by their dot-path for type-safe traversal
  const intermediates: Map<string, { [string]: mixed }> = new Map();
  intermediates.set('', result);

  for (const key of Object.keys(flatObj)) {
    // Don't split special keys — keep at top level as-is
    if (SPECIAL_KEYS.has(key) || !key.includes(SEPARATOR)) {
      result[key] = flatObj[key];
      continue;
    }

    const parts = key.split(SEPARATOR);

    // Walk/create intermediate namespace objects
    let pathSoFar = '';
    let current: { [string]: mixed } = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPath = pathSoFar ? `${pathSoFar}${SEPARATOR}${part}` : part;

      const existing = intermediates.get(nextPath);
      if (existing != null) {
        current = existing;
      } else {
        const newObj: { [string]: mixed } = {};
        current[part] = newObj;
        intermediates.set(nextPath, newObj);
        current = newObj;
      }
      pathSoFar = nextPath;
    }

    // Set the value at the leaf
    current[parts[parts.length - 1]] = flatObj[key];
  }

  return result;
}
