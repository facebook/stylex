/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { FromParser } from '../core';

import { Parser } from '../core';
import { cssWideKeywords } from '../css-types/common-types';
import { CSSVariable } from '../css-types/css-variable';

/**
 * MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/appearance
 */
export class Appearance {
  +value:
    | FromParser<typeof cssWideKeywords>
    | 'none'
    | 'auto'
    | 'menulist-button'
    | 'textfield'
    | CSSVariable<Appearance>;

  constructor(value: this['value']) {
    this.value = value;
  }

  toString(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }

    return this.value.toString();
  }

  static get parse(): Parser<Appearance> {
    return Parser.oneOf(
      cssWideKeywords,
      Parser.string('none'),
      Parser.string('auto'),
      Parser.string('menulist-button'),
      Parser.string('textfield'),
      CSSVariable.parse(Appearance.parse),
    ).map((v) => new Appearance(v));
  }
}

export const appearance = Appearance;
