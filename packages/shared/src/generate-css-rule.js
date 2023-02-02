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
import getPriority from './utils/property-priorities';

export default function generateCSSRule(
  className: string,
  key: string, // pre-dashed
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

  const priority = getPriority(key) + (pseudo ? getPriority(pseudo) : 0);

  return { priority, ltr: ltrRule, rtl: rtlRule };
}
