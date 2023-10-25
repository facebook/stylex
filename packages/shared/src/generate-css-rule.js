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
import { genCSSRule } from './utils/genCSSRule';
import type { InjectableStyle } from './common-types';
import getPriority from './utils/property-priorities';

export function generateRule(
  className: string,
  key: string, // pre-dashed
  value: string | $ReadOnlyArray<string>,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
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

  const ltrRule = genCSSRule(className, ltrDecls, pseudos, atRules);
  const rtlRule = !rtlDecls
    ? null
    : genCSSRule(className, rtlDecls, pseudos, atRules);

  const priority =
    getPriority(key) +
    pseudos.map(getPriority).reduce((a, b) => a + b, 0) +
    atRules.map(getPriority).reduce((a, b) => a + b, 0);

  return { priority, ltr: ltrRule, rtl: rtlRule };
}
