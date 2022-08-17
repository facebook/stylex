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

export default function generateCSSRule(
  className: string,
  decls: string,
  pseudo: ?string
): string {
  if (pseudo === '::thumb') {
    const selector = THUMB_VARIANTS.map(
      (suffix) => '.' + className + suffix
    ).join(', ');
    return `${selector}{${decls}}`;
  }

  return pseudo != null && pseudo[0] === '@'
    ? `${pseudo}{.${className}.${className}{${decls}}}`
    : pseudo != null && pseudo[0] === ':'
    ? `.${className}${pseudo}{${decls}}`
    : `.${className}{${decls}}`;
}

const THUMB_VARIANTS = [
  '::-webkit-slider-thumb',
  '::-moz-range-thumb',
  '::-ms-thumb',
];
