/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NumberType, TokenDimension } from '@csstools/css-tokenizer';

import { TokenParser } from '../core2';
import { TokenType } from '@csstools/css-tokenizer';

export class Angle {
  +value: number;
  +unit: string;
  constructor(value: number, unit: this['unit']) {
    this.value = value;
    this.unit = unit;
  }
  toString(): string {
    return `${this.value}${this.unit}`;
  }
  static get parse(): TokenParser<Angle> {
    return TokenParser.token<TokenDimension>(TokenType.Dimension)
      .map((v) => v[4])
      .where(
        (v: {
          value: number,
          unit: string,
          signCharacter?: '+' | '-',
          type: NumberType,
        }): implies v is {
          value: number,
          unit: string,
          signCharacter?: '+' | '-',
          type: NumberType,
        } =>
          v.unit === 'deg' ||
          v.unit === 'grad' ||
          v.unit === 'rad' ||
          v.unit === 'turn',
      )
      .map((v) => new Angle(v.value, v.unit));
  }
}
