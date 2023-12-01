/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import createHash from './hash';
import type { TRawValue, StyleRule, StyleXOptions } from './common-types';
import dashify from './utils/dashify';
import transformValue from './transform-value';
import { generateRule } from './generate-css-rule';
import { defaultOptions } from './utils/default-options';
import { arraySort } from './utils/object-utils';

// This function takes a single style rule and transforms it into a CSS rule.
// [color: 'red'] => ['color', 'classname-for-color-red', CSSRULE{ltr, rtl, priority}]
//
// It converts the camelCased style key to a dash-separated key.
// Handles RTL-flipping
// Hashes to get a className
// Returns the final key, className a CSS Rule
export function convertStyleToClassName(
  objEntry: [string, TRawValue],
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  options: StyleXOptions = defaultOptions,
): StyleRule {
  const { classNamePrefix = 'x' } = options;
  const [key, rawValue] = objEntry;
  const dashedKey = dashify(key);

  const value = Array.isArray(rawValue)
    ? rawValue.map((eachValue) => transformValue(key, eachValue, options))
    : transformValue(key, rawValue, options);

  const sortedPseudos = arraySort(pseudos ?? []);
  const sortedAtRules = arraySort(atRules ?? []);

  const atRuleHashString = sortedPseudos.join('');
  const pseudoHashString = sortedAtRules.join('');

  const modifierHashString = atRuleHashString + pseudoHashString || 'null';

  const stringToHash = Array.isArray(value)
    ? dashedKey + value.join(', ') + modifierHashString
    : dashedKey + value + modifierHashString;

  // NOTE: '<>' is used to keep existing hashes stable.
  // This should be removed in a future version.
  const className = classNamePrefix + createHash('<>' + stringToHash);

  const cssRules = generateRule(className, dashedKey, value, pseudos, atRules);

  return [key, className, cssRules];
}
