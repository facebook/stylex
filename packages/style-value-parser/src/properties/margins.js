/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { FromParser } from '../core';
import type { LengthPercentage } from '../css-types/length-percentage';

import { Parser } from '../core';
import { cssWideKeywords } from '../css-types/common-types';
// import { CSSVariable } from '../css-types/css-variable';
import { lengthPercentage } from '../css-types/length-percentage';

export class MarginDir {
  +value:
    | LengthPercentage
    // | CSSVariable<MarginDir>
    | FromParser<typeof cssWideKeywords>;

  constructor(value: this['value']) {
    this.value = value;
  }

  toString(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }

    return this.value.toString();
  }

  static get parse(): Parser<MarginDir> {
    return Parser.oneOf(
      cssWideKeywords,
      lengthPercentage,
      // CSSVariable.parse(MarginDir.parse),
    ).map((v) => new MarginDir(v));
  }
}

export const marginBlock = MarginDir;
export const marginBlockEnd = MarginDir;
export const marginBlockStart = MarginDir;
export const marginBottom = MarginDir;
export const marginInline = MarginDir;
export const marginInlineEnd = MarginDir;
export const marginInlineStart = MarginDir;
export const marginLeft = MarginDir;
export const marginRight = MarginDir;
export const marginTop = MarginDir;
