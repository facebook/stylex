/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import generateLtr from './physical-rtl/generate-ltr';
import generateRtl from './physical-rtl/generate-rtl';
import genCSSRule from './utils/genCSSRule';
import type { InjectableStyle } from './common-types';

export default function generateCSSRule(
  className: string,
  key: string,
  value: string | $ReadOnlyArray<string>,
  pseudo?: string
): InjectableStyle {
  const pairs: $ReadOnlyArray<[string, string]> = Array.isArray(value)
    ? value.map((eachValue) => [key, eachValue])
    : [[key, value]];

  const ltrPairs = pairs.map(generateLtr);
  const ltrDecls = ltrPairs.map((pair) => pair.join(':')).join(';');

  const rtlDecls = pairs
    .map(generateRtl)
    .filter(Boolean)
    .map((pair) => pair.join(':'))
    .join(';');

  const ltrRule = genCSSRule(className, ltrDecls, pseudo);
  const rtlRule = !rtlDecls ? null : genCSSRule(className, rtlDecls, pseudo);

  let priority = 1;
  if (pseudo != null) {
    if (pseudo[0] === '@') {
      priority = 2;
    } else if (pseudo[0] === ':') {
      priority = pseudoPriorities[pseudo] ?? 2;
      if (pseudo.startsWith(':nth-child')) {
        priority = 6;
      }
      if (pseudo.startsWith(':nth-of-type')) {
        priority = 7;
      }
    }
  }
  if (
    key.toLowerCase().includes('left') ||
    key.toLowerCase().includes('right')
  ) {
    // Bump priority for physical left/right values.
    priority += 0.1;
  }

  return { priority, ltr: ltrRule, rtl: rtlRule };
}

const pseudoPriorities: { +[string]: ?number } = {
  // Might become unsupported:
  ':first-child': 3,
  ':last-child': 4,
  ':only-child': 5,
  ':nth-child': 6,
  ':nth-of-type': 7,

  ':hover': 8,
  ':focus': 9,
  ':active': 10,
  ':disabled': 11,
  '::placeholder': 12,
  '::thumb': 13,
};
