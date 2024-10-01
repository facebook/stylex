/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import flatMapExpandedShorthands from './index';
import type { RawStyles, StyleXOptions, TStyleValue } from '../common-types';

import {
  NullPreRule,
  PreRule,
  PreRuleSet,
  type AnyPreRule,
  type IPreRule,
  PreIncludedStylesRule,
} from './PreRule';
import { IncludedStyles } from '../stylex-include';

export function flattenRawStyleObject(
  style: RawStyles,
  options: StyleXOptions,
): $ReadOnlyArray<$ReadOnly<[string, IPreRule]>> {
  return _flattenRawStyleObject(style, [], [], options);
}

export function _flattenRawStyleObject(
  style: RawStyles,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  options: StyleXOptions,
): Array<$ReadOnly<[string, AnyPreRule | PreIncludedStylesRule]>> {
  const flattened: Array<
    $ReadOnly<[string, AnyPreRule | PreIncludedStylesRule]>,
  > = [];
  for (const _key in style) {
    const value = style[_key];
    const key: string = _key.match(/var\(--[a-z0-9]+\)/)
      ? _key.slice(4, -1)
      : _key;

    // Included Styles
    if (typeof value === 'object' && value instanceof IncludedStyles) {
      flattened.push([key, new PreIncludedStylesRule(value)]);
      continue;
    }

    // Default styles
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      const pairs: $ReadOnlyArray<[string, TStyleValue]> =
        flatMapExpandedShorthands([key, value], options);
      for (const [property, value] of pairs) {
        if (value === null) {
          flattened.push([property, new NullPreRule()]);
        } else {
          flattened.push([
            property,
            new PreRule(property, value, pseudos, atRules),
          ]);
        }
      }
      continue;
    }

    // Fallback Styles
    if (Array.isArray(value)) {
      const equivalentPairs: {
        [string]: Array<null | string | number>,
      } = {};
      for (const eachVal of value) {
        const pairs = flatMapExpandedShorthands([key, eachVal], options);
        for (const [property, val] of pairs) {
          if (Array.isArray(val)) {
            if (equivalentPairs[property] == null) {
              equivalentPairs[property] = [...val];
            } else {
              equivalentPairs[property].push(...val);
            }
          } else if (equivalentPairs[property] == null) {
            equivalentPairs[property] = [val];
          } else {
            equivalentPairs[property].push(val);
          }
        }
      }
      // Deduplicate
      Object.entries(equivalentPairs)
        // Remove Nulls
        .map(([property, values]) => [
          property,
          [...new Set(values.filter(Boolean))],
        ])
        // Deduplicate and default to null when no values are found
        .map(([property, values]) => [
          property,
          values.length === 0 ? null : values.length === 1 ? values[0] : values,
        ])
        // Push to flattened
        .forEach(([property, value]) => {
          if (value === null) {
            flattened.push([property, new NullPreRule()]);
          } else {
            flattened.push([
              property,
              new PreRule(property, value, pseudos, atRules),
            ]);
          }
        });
      continue;
    }

    // Object Values for properties. e.g. { color: { hover: 'red', default: 'blue' } }
    if (
      typeof value === 'object' &&
      !key.startsWith(':') &&
      !key.startsWith('@')
    ) {
      const equivalentPairs: { [string]: { [string]: AnyPreRule } } = {};
      for (const condition in value) {
        const innerValue = value[condition];

        const pseudosToPassDown = [...pseudos];
        const atRulesToPassDown = [...atRules];
        if (condition.startsWith(':')) {
          pseudosToPassDown.push(condition);
        } else if (condition.startsWith('@')) {
          atRulesToPassDown.push(condition);
        }

        const pairs = _flattenRawStyleObject(
          { [key]: innerValue },
          pseudosToPassDown,
          atRulesToPassDown,
          options,
        );
        for (const [property, preRule] of pairs) {
          if (preRule instanceof PreIncludedStylesRule) {
            // NOT POSSIBLE, but needed for Flow
            throw new Error('stylex.include can only be used at the top-level');
          }
          if (equivalentPairs[property] == null) {
            equivalentPairs[property] = { [condition]: preRule };
          } else {
            equivalentPairs[property][condition] = preRule;
          }
        }
      }
      for (const [property, obj] of Object.entries(equivalentPairs)) {
        const sortedKeys = Object.keys(obj); //.sort();
        const rules: Array<AnyPreRule> = [];
        for (const condition of sortedKeys) {
          rules.push(obj[condition]);
        }
        // If there are many conditions with `null` values, we will collapse them into a single `null` value.
        // `PreRuleSet.create` takes care of that for us.
        flattened.push([property, PreRuleSet.create(rules)]);
      }
    }

    // Object Values for pseudos and at-rules. e.g. { ':hover': { color: 'red' } }
    if (
      typeof value === 'object' &&
      (key.startsWith(':') || key.startsWith('@'))
    ) {
      const pseudosToPassDown = [...pseudos];
      const atRulesToPassDown = [...atRules];
      if (key.startsWith(':')) {
        pseudosToPassDown.push(key);
      } else if (key.startsWith('@')) {
        atRulesToPassDown.push(key);
      }
      const pairs = _flattenRawStyleObject(
        value,
        pseudosToPassDown,
        atRulesToPassDown,
        options,
      );
      for (const [property, preRule] of pairs) {
        flattened.push([key + '_' + property, preRule]);
      }
    }
  }
  return flattened;
}
