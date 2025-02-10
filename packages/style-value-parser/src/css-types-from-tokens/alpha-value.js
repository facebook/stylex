/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TokenPercentage, TokenNumber } from '@csstools/css-tokenizer';

import { TokenParser } from '../core2';
import { TokenType } from '@csstools/css-tokenizer';

export class AlphaValue {
  +value: number;
  constructor(value: number) {
    this.value = value;
  }
  toString(): string {
    return this.value.toString();
  }
  static parse: TokenParser<AlphaValue> = TokenParser.oneOf(
    TokenParser.token<TokenPercentage>(TokenType.Percentage).map(
      (v) =>
        new AlphaValue(
          ((v[4].signCharacter === '-' ? -1 : 1) * v[4].value) / 100,
        ),
    ),
    TokenParser.token<TokenNumber>(TokenType.Number).map(
      (v) => new AlphaValue((v[4].signCharacter === '-' ? -1 : 1) * v[4].value),
    ),
  );
}
