/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import createHash from './hash';
import type { TRawValue, StyleRule } from './common-types';
import dashify from './utils/dashify';
import transformValue from './transform-value';
import generateCSSRule from './generate-css-rule';

// This function takes a single style rule and transforms it into a CSS rule.
// [color: 'red'] => ['color', 'classname-for-color-red', CSSRULE{ltr, rtl, priority}]
//
// It converts the camelCased style key to a dash-separated key.
// Handles RTL-flipping
// Hashes to get a className
// Returns the final key, className a CSS Rule
export default function convertToClassName(
  objEntry: [string, TRawValue],
  pseudo?: string,
  stylexSheetName?: string = '<>',
  prefix?: string = 'x'
): StyleRule {
  const [key, rawValue] = objEntry;
  const dashedKey = dashify(key);

  const value = Array.isArray(rawValue)
    ? rawValue.map((eachValue) => transformValue(key, eachValue))
    : transformValue(key, rawValue);

  const stringToHash = Array.isArray(value)
    ? dashedKey + value.join(', ') + (pseudo ?? 'null')
    : dashedKey + value + (pseudo ?? 'null');

  const className = prefix + createHash(stylexSheetName + stringToHash);

  const cssRules = generateCSSRule(className, dashedKey, value, pseudo);

  return [key, className, cssRules];
}
