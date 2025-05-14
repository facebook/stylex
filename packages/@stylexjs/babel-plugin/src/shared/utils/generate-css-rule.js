/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { InjectableStyle } from '../common-types';

import generateLtr from '../physical-rtl/generate-ltr';
import generateRtl from '../physical-rtl/generate-rtl';
import getPriority from './property-priorities';

const THUMB_VARIANTS = [
  '::-webkit-slider-thumb',
  '::-moz-range-thumb',
  '::-ms-thumb',
];

function buildNestedCSSRule(
  className: string,
  decls: string,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  constRules: $ReadOnlyArray<string>,
): string {
  const pseudo = pseudos.filter((p) => p !== '::thumb').join('');
  const combinedAtRules = atRules.concat(constRules);

  let selectorForAtRules =
    `.${className}` +
    combinedAtRules.map(() => `.${className}`).join('') +
    pseudo;

  if (pseudos.includes('::thumb')) {
    selectorForAtRules = THUMB_VARIANTS.map(
      (suffix) => selectorForAtRules + suffix,
    ).join(', ');
  }

  return combinedAtRules.reduce(
    (acc, combinedAtRules) => `${combinedAtRules}{${acc}}`,
    `${selectorForAtRules}{${decls}}`,
  );
}

export function generateCSSRule(
  className: string,
  key: string,
  value: string | $ReadOnlyArray<string>,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  constRules: $ReadOnlyArray<string>,
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

  const ltrRule = buildNestedCSSRule(
    className,
    ltrDecls,
    pseudos,
    atRules,
    constRules,
  );
  const rtlRule = !rtlDecls
    ? null
    : buildNestedCSSRule(className, rtlDecls, pseudos, atRules, constRules);

  const priority =
    getPriority(key) +
    pseudos.map(getPriority).reduce((a, b) => a + b, 0) +
    atRules.map(getPriority).reduce((a, b) => a + b, 0) +
    constRules.map(getPriority).reduce((a, b) => a + b, 0);

  return { priority, ltr: ltrRule, rtl: rtlRule };
}
