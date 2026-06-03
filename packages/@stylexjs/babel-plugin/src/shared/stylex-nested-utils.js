/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 * Utilities for flattening nested design token objects into dot-separated
 * flat keys, and unflattening them back. This is the core algorithm that
 * enables the unstable_defineVarsNested / unstable_defineConstsNested /
 * unstable_createThemeNested APIs.
 *
 * Architecture:
 *   Nested input → flattenImpl() → existing flat transforms → unflattenObject() → nested output
 *
 * A single generic flattenImpl<T> accepts isLeaf/transformLeaf callbacks,
 * enabling 4 flatten variants (vars, overrides, strings, consts) without
 * code duplication.
 */

import type { VarsConfigValue } from './stylex-vars-utils';
import { type CSSType, isCSSType } from './types';

// The "." separator is used to build flat key paths (e.g., "button.primary.bg").
// This aligns with the W3C Design Tokens spec, which forbids "." in token names
// because "." is used as the path separator in token alias references.
// See: https://www.designtokens.org/tr/drafts/format/#character-restrictions
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

/**
 * Converts a runtime-evaluated value into a properly-typed VarsConfigValue.
 * Used when the evaluator returns a conditional @-rule object (with `default`
 * key) as a plain JS object that needs to be reconstructed with correct types.
 *
 * Example:
 *   Input:  { default: 'blue', '@media (prefers-color-scheme: dark)': 'lightblue' }
 *   Output: same structure, but with VarsConfigValue typing on all values
 */
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

/**
 * Core flatten algorithm shared by all 4 public flatten functions.
 * Recursively walks a nested object, building dot-separated key paths.
 * Stops recursing when isLeaf(value) returns true.
 *
 * Example (with isVarsLeaf):
 *   Input:  { button: { primary: { background: '#00FF00' } } }
 *   Output: { 'button.primary.background': '#00FF00' }
 *
 * Example (conditional value is a leaf, not recursed into):
 *   Input:  { color: { default: 'blue', '@media (...)': 'dark' } }
 *   Output: { 'color': { default: 'blue', '@media (...)': 'dark' } }
 *
 * @param obj           - The nested object to flatten
 * @param prefix        - Current dot-separated path prefix ('' for root)
 * @param result        - Accumulator object for the flat output
 * @param isLeaf        - Predicate: should this value be stored as-is (true) or recursed into (false)?
 * @param transformLeaf - Optional: transform the leaf value before storing (e.g., type coercion)
 */
function flattenImpl<T>(
  obj: { +[string]: mixed },
  prefix: string,
  result: { [string]: T },
  isLeaf: (value: mixed) => boolean,
  transformLeaf?: (value: mixed) => T,
): void {
  for (const key of Object.keys(obj)) {
    if (key.includes(SEPARATOR)) {
      throw new Error(
        `Key "${key}" must not contain the "${SEPARATOR}" character. ` +
          'Use nested objects instead of dots in key names. ' +
          'See: https://www.designtokens.org/tr/drafts/format/#character-restrictions',
      );
    }
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
// Each flatten variant has its own rule for when to stop recursing.
// This is the key design decision: for vars, objects with a `default` key
// are conditional @-rule values (leaves). For consts, ALL objects are
// namespaces because consts don't support @-rule conditionals.

/**
 * Leaf detector for defineVarsNested.
 * - Strings → leaf (simple CSS value like 'red')
 * - CSSType → leaf (typed value like stylex.types.color(...))
 * - Object with `default` key → leaf (conditional: { default: 'blue', '@media ...': 'dark' })
 * - Object without `default` key → namespace, keep recursing
 */
function isVarsLeaf(value: mixed): boolean {
  if (typeof value === 'string') return true;
  if (isCSSType(value)) return true;
  if (typeof value === 'object' && value != null && !Array.isArray(value)) {
    // A conditional @-rule value has a 'default' key AND all other keys start with '@'.
    // e.g., { default: 'blue', '@media (...)': 'dark' } → conditional leaf
    // An object like { default: cond(...), hovered: cond(...) } has non-@ keys
    // → it's a namespace, not a conditional.
    if (value.default === undefined) return false;
    const keys = Object.keys(value);
    return keys.every((k) => k === 'default' || k.startsWith('@'));
  }
  return false;
}

/**
 * Leaf detector for flattenNestedStringConfig (used by createThemeNested
 * to flatten the themeVars object which contains only var(--hash) strings).
 */
function isStringLeaf(value: mixed): boolean {
  return typeof value === 'string';
}

/**
 * Leaf detector for defineConstsNested.
 * Only strings and numbers are leaves — ALL objects are namespaces.
 * This differs from isVarsLeaf because consts don't support conditional
 * @-rule values. An object like { default: '#00FF00', hovered: '#0000FF' }
 * represents component state names, not CSS conditions.
 */
function isConstsLeaf(value: mixed): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

// === Leaf transformers ===
// When a leaf is detected, these functions coerce it into the correct output type.
// For example, a conditional object { default: 'blue', '@media ...': 'dark' }
// needs to be reconstructed as a typed VarsConfigValue.

/**
 * Transforms a vars leaf into VarsConfigValue | CSSType.
 * - Strings pass through as-is
 * - CSSType values (stylex.types.color(...)) pass through
 * - Conditional objects get typed via toVarsConfigValue()
 */
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
// Each is a thin wrapper around flattenImpl with a specific isLeaf/transformLeaf pair.
// Adding a new flatten variant requires only: 1 isLeaf function + 1 public wrapper.

/**
 * Flattens a nested token object for unstable_defineVarsNested.
 * Stops at strings, CSSType values, and conditional @-rule objects (with `default` key).
 *
 * Example:
 *   Input:  { button: { bg: 'red', color: { default: 'blue', '@media ...': 'dark' } } }
 *   Output: { 'button.bg': 'red', 'button.color': { default: 'blue', '@media ...': 'dark' } }
 */
export function flattenNestedVarsConfig(
  obj: $ReadOnly<{ +[string]: NestedVarsValue }>,
  prefix: string = '',
): { [string]: VarsConfigValue | CSSType<string | number> } {
  const result: { [string]: VarsConfigValue | CSSType<string | number> } = {};
  flattenImpl(obj, prefix, result, isVarsLeaf, transformVarsLeaf);
  return result;
}

/**
 * Flattens override values for unstable_createThemeNested.
 * Same leaf detection as vars, but CSSType values are unwrapped
 * (extracts .value) because createTheme expects plain VarsConfigValue.
 */
export function flattenNestedOverridesConfig(
  obj: $ReadOnly<{ +[string]: NestedVarsValue }>,
  prefix: string = '',
): { [string]: VarsConfigValue } {
  const result: { [string]: VarsConfigValue } = {};
  flattenImpl(obj, prefix, result, isVarsLeaf, transformOverridesLeaf);
  return result;
}

/**
 * Flattens the compiled themeVars object (from defineVarsNested output)
 * which only contains var(--hash) strings at the leaves.
 * Used by createThemeNested to flatten the first argument.
 */
export function flattenNestedStringConfig(
  obj: $ReadOnly<{ +[string]: NestedStringValue }>,
  prefix: string = '',
): { [string]: string } {
  const result: { [string]: string } = {};
  flattenImpl(obj, prefix, result, isStringLeaf);
  return result;
}

/**
 * Flattens a nested token object for unstable_defineConstsNested.
 * Only strings and numbers are leaves — ALL objects are recursed into.
 * This means { default: '#00FF00', hovered: '#0000FF' } becomes two
 * separate flat keys, NOT a conditional value.
 *
 * Example:
 *   Input:  { button: { background: { default: '#00FF00', hovered: '#0000FF' } } }
 *   Output: { 'button.background.default': '#00FF00', 'button.background.hovered': '#0000FF' }
 */
export function flattenNestedConstsConfig(
  obj: $ReadOnly<{ +[string]: NestedConstsValue }>,
  prefix: string = '',
): { [string]: string | number } {
  const result: { [string]: string | number } = {};
  flattenImpl(obj, prefix, result, isConstsLeaf);
  return result;
}

// === Unflatten ===

// Recursive unflattened value: either a leaf V or a nested object of more Unflattened<V>.
export type Unflattened<V> = V | { [string]: Unflattened<V> };

/**
 * Rebuilds a nested object from dot-separated flat keys.
 * This is the reverse of flattenImpl — used to convert the flat output
 * of styleXDefineVars back into a nested JS object for consumer access.
 *
 * Special keys (__varGroupHash__, $$css) are preserved at the top level
 * without splitting on dots.
 *
 * Example:
 *   Input:  { 'button.primary.bg': 'var(--x1)', 'button.secondary.bg': 'var(--x2)', __varGroupHash__: 'xHash' }
 *   Output: { button: { primary: { bg: 'var(--x1)' }, secondary: { bg: 'var(--x2)' } }, __varGroupHash__: 'xHash' }
 */
const SPECIAL_KEYS = new Set(['__varGroupHash__', '$$css']);

export function unflattenObject<V>(flatObj: { +[string]: V }): {
  [string]: Unflattened<V>,
} {
  const result: { [string]: Unflattened<V> } = {};
  // Track intermediate objects by their dot-path for type-safe traversal
  const intermediates: Map<string, { [string]: Unflattened<V> }> = new Map();
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
    let current: { [string]: Unflattened<V> } = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPath = pathSoFar ? `${pathSoFar}${SEPARATOR}${part}` : part;

      const existing = intermediates.get(nextPath);
      if (existing != null) {
        current = existing;
      } else {
        const newObj: { [string]: Unflattened<V> } = {};
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
