/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

const THUMB_VARIANTS = [
  '::-webkit-slider-thumb',
  '::-moz-range-thumb',
  '::-ms-thumb',
];

export function genCSSRule(
  className: string,
  decls: string,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  constRules: $ReadOnlyArray<string>,
): string {
  const allRules = [...atRules, ...constRules];
  const pseudo = pseudos.filter((p) => p !== '::thumb').join('');

  const repeatedSelector =
    `.${className}` + allRules.map(() => `.${className}`).join('') + pseudo;

  let selectorForAtRules = repeatedSelector;

  if (pseudos.includes('::thumb')) {
    selectorForAtRules = THUMB_VARIANTS.map(
      (suffix) => selectorForAtRules + suffix,
    ).join(', ');
  }

  return allRules.reduce(
    (acc, rule) => `${rule}{${acc}}`,
    `${selectorForAtRules}{${decls}}`,
  );
}
