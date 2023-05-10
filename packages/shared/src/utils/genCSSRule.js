/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
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
  atRules: $ReadOnlyArray<string>
): string {
  const pseudo = pseudos.filter((p) => p !== '::thumb').join('');
  let selectorForAtRules =
    `.${className}` + atRules.map(() => `.${className}`).join('') + pseudo;

  if (pseudos.includes('::thumb')) {
    selectorForAtRules = THUMB_VARIANTS.map(
      (suffix) => selectorForAtRules + suffix
    ).join(', ');
  }

  return atRules.reduce(
    (acc, atRule) => `${atRule}{${acc}}`,
    `${selectorForAtRules}{${decls}}`
  );
}
