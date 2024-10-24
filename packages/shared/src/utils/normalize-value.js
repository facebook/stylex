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
import normalizeZeroDimensions from './normalizers/zero-dimensions';

import detectUnclosedFns from './normalizers/detect-unclosed-fns';
import parser from 'postcss-value-parser';
import convertCamelCaseValues from './normalizers/convert-camel-case-values';
import type { StyleXOptions } from '../common-types';
import * as styleParsers from '@stylexjs/style-value-parser';

// `Timings` should be before `LeadingZero`, because it
// changes 500ms to 0.5s, then `LeadingZero` makes it .5s
const normalizers = [
  detectUnclosedFns,
  normalizeWhitespace,
  normalizeTimings,
  normalizeZeroDimensions,
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
  if (key in styleParsers.properties) {
    const propName: $Keys<typeof styleParsers.properties> = key as $FlowFixMe;
    try {
      // Can throw an error
      const parsedVal =
        styleParsers.properties[propName].parse.parseToEnd(value);
      return parsedVal.toString();
    } catch (err) {
      // UPDATE THIS TO DO BETTER LOGGING by improving error message.
      /**
       * The value for given property might be invalid
       * Log both key and value
       * Log the error
       */
      // console.error(err);
    }
  }

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
