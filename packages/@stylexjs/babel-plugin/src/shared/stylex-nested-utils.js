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

// === Internal flatten implementations ===
// These work with { +[string]: mixed } to leverage Flow's built-in typeof/isCSSType
// narrowing, which is more reliable than implies type guards for mixed union types.

function flattenVarsImpl(
  obj: { +[string]: mixed },
  prefix: string,
  result: { [string]: VarsConfigValue | CSSType<string | number> },
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}${SEPARATOR}${key}` : key;

    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (isCSSType(value)) {
      result[fullKey] = value;
    } else if (
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value)
    ) {
      if (value.default !== undefined) {
        // Conditional @-rule value — treat as leaf
        result[fullKey] = toVarsConfigValue(value);
      } else {
        // Namespace object — recurse
        flattenVarsImpl(value, fullKey, result);
      }
    }
  }
}

// Like flattenVarsImpl but extracts .value from CSSType values.
// Used for theme overrides where CSSType is unwrapped before passing to styleXCreateTheme.
function flattenOverridesImpl(
  obj: { +[string]: mixed },
  prefix: string,
  result: { [string]: VarsConfigValue },
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}${SEPARATOR}${key}` : key;

    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (isCSSType(value)) {
      // Extract the inner value from CSSType for theme overrides
      result[fullKey] = toVarsConfigValue(value.value);
    } else if (
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value)
    ) {
      if (value.default !== undefined) {
        result[fullKey] = toVarsConfigValue(value);
      } else {
        flattenOverridesImpl(value, fullKey, result);
      }
    }
  }
}

function flattenStringImpl(
  obj: { +[string]: mixed },
  prefix: string,
  result: { [string]: string },
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}${SEPARATOR}${key}` : key;

    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value)
    ) {
      flattenStringImpl(value, fullKey, result);
    }
  }
}

function flattenConstsImpl(
  obj: { +[string]: mixed },
  prefix: string,
  result: { [string]: string | number },
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}${SEPARATOR}${key}` : key;

    if (typeof value === 'string' || typeof value === 'number') {
      result[fullKey] = value;
    } else if (
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value)
    ) {
      flattenConstsImpl(value, fullKey, result);
    }
  }
}

// === Public flatten functions ===
// These accept specific nested types (for API type safety) and delegate to
// the mixed-based impl functions (for reliable Flow narrowing).

export function flattenNestedVarsConfig(
  obj: $ReadOnly<{ +[string]: NestedVarsValue }>,
  prefix: string = '',
): { [string]: VarsConfigValue | CSSType<string | number> } {
  const result: { [string]: VarsConfigValue | CSSType<string | number> } = {};
  flattenVarsImpl(obj, prefix, result);
  return result;
}

export function flattenNestedOverridesConfig(
  obj: $ReadOnly<{ +[string]: NestedVarsValue }>,
  prefix: string = '',
): { [string]: VarsConfigValue } {
  const result: { [string]: VarsConfigValue } = {};
  flattenOverridesImpl(obj, prefix, result);
  return result;
}

export function flattenNestedStringConfig(
  obj: $ReadOnly<{ +[string]: NestedStringValue }>,
  prefix: string = '',
): { [string]: string } {
  const result: { [string]: string } = {};
  flattenStringImpl(obj, prefix, result);
  return result;
}

export function flattenNestedConstsConfig(
  obj: $ReadOnly<{ +[string]: NestedConstsValue }>,
  prefix: string = '',
): { [string]: string | number } {
  const result: { [string]: string | number } = {};
  flattenConstsImpl(obj, prefix, result);
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
