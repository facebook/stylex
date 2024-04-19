/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import convertFontSizeToRem from './normalizers/font-size-px-to-rem';
import normalizeLeadingZero from './normalizers/leading-zero';
import normalizeQuotes from './normalizers/quotes';
import normalizeTimings from './normalizers/timings';
import normalizeWhitespace from './normalizers/whitespace';

import detectUnclosedFns from './normalizers/detect-unclosed-fns';
import parser from 'postcss-value-parser';
import convertCamelCaseValues from './normalizers/convert-camel-case-values';
import type { StyleXOptions } from '../common-types';

// `Timings` should be before `LeadingZero`, because it
// changes 500ms to 0.5s, then `LeadingZero` makes it .5s
const normalizers = [
  detectUnclosedFns,
  normalizeWhitespace,
  normalizeTimings,
  normalizeLeadingZero,
  normalizeQuotes,
  convertCamelCaseValues,
  // convertFontSizeToRem,
];

export default function normalizeValue(
  value: string,
  key: string,
  { useRemForFontSize }: StyleXOptions,
): string {
  if (value == null) {
    return value;
  }
  const parsedAST = parser(value);
  const relevantNormalizers = useRemForFontSize
    ? [...normalizers, convertFontSizeToRem]
    : normalizers;
  return relevantNormalizers
    .reduce((ast, fn) => fn(ast, key), parsedAST)
    .toString();
}
