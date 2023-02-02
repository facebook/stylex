/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { RawStyles, TNestableStyleValue } from '../common-types';
import type { Rule } from '../utils/Rule';

import { RawRule, RawRuleList } from '../utils/Rule';

/// This function takes a Raw Style Object and converts into a flat object of rules.
///
/// 1. The object is "flat": There will be no nested objects after this function.
/// 2. The values are "rules": Each value is the representation of a CSS Rule.
export default function preflatten(namespace: RawStyles): {
  [string]: Rule<mixed>,
} {
  const result = {};
  for (const key of Object.keys(namespace)) {
    const value: TNestableStyleValue = namespace[key];
    if (value === null) {
      result[key] = null;
    } else if (Array.isArray(value)) {
      const allRules = getNestedRules(key, value);
      if (allRules.length > 1) {
        result[key] = new RawRuleList(allRules);
      } else if (allRules.length === 1) {
        result[key] = allRules[0];
      } else if (allRules.length === 0) {
        result[key] = null;
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      if (key.startsWith('@') || key.startsWith(':')) {
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (nestedValue != null && typeof nestedValue === 'object') {
            throw new Error('Pseudo and At-Rules cannot be nested.');
          }
          result[`${key}_${nestedKey}`] = new RawRule<mixed>(
            nestedKey,
            nestedValue,
            key.startsWith(':') ? [key] : [],
            key.startsWith('@') ? [key] : []
          );
        }
      } else {
        /*:: (value: RawStyles); */
        const allRules = getNestedRules(key, value);
        if (allRules.length > 1) {
          result[key] = new RawRuleList(allRules);
        } else if (allRules.length === 1) {
          result[key] = allRules[0];
        } else if (allRules.length === 0) {
          result[key] = null;
        }
      }
    } else {
      result[key] = new RawRule<mixed>(key, value, [], []);
    }
  }
  return result;
}

function getNestedRules(
  key: string,
  value: TNestableStyleValue,
  pseudos: Array<string> = [],
  atRules: Array<string> = []
): Array<Rule<mixed>> {
  const result = [];
  if (value === null) {
    return result;
  } else if (Array.isArray(value)) {
    result.push(
      new RawRuleList(
        value.map((val) => new RawRule(key, val, pseudos, atRules))
      )
    );
  } else if (typeof value === 'object') {
    for (const nestedKey of Object.keys(value)) {
      const nestedValue: TNestableStyleValue = value[nestedKey];
      if (nestedKey.startsWith('@')) {
        result.push(
          ...getNestedRules(key, nestedValue, pseudos, [...atRules, nestedKey])
        );
      } else if (nestedKey.startsWith(':')) {
        result.push(
          ...getNestedRules(key, nestedValue, [...pseudos, nestedKey], atRules)
        );
      } else if (nestedKey === 'default') {
        result.push(...getNestedRules(key, nestedValue, pseudos, atRules));
      } else {
        // This can be updated when we support more complex styles, such
        // as applying a style conditionally when a parent is hovered.
        throw new Error(
          'Complex Selectors (combinators) are not supported yet.'
        );
      }
    }
  } else {
    // primitive value
    result.push(new RawRule<mixed>(key, value, pseudos, atRules));
  }

  return result;
}
