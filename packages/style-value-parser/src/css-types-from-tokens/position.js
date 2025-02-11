/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TokenIdent } from '@csstools/css-tokenizer';
import { TokenParser } from '../core2';
import { TokenType } from '@csstools/css-tokenizer';
import { type LengthPercentage, lengthPercentage } from './length-percentage';

export type HorizontalKeyword = 'left' | 'center' | 'right';
export type VerticalKeyword = 'top' | 'center' | 'bottom';

export type Horizontal =
  | LengthPercentage
  | HorizontalKeyword
  | [HorizontalKeyword, LengthPercentage];

export type Vertical =
  | LengthPercentage
  | VerticalKeyword
  | [VerticalKeyword, LengthPercentage];

export class Position {
  +horizontal: Horizontal;
  +vertical: Vertical;
  constructor(horizontal: Horizontal, vertical: Vertical) {
    this.horizontal = horizontal;
    this.vertical = vertical;
  }

  toString(): string {
    const horizontal = Array.isArray(this.horizontal)
      ? this.horizontal.join(' ')
      : this.horizontal.toString();
    const vertical = Array.isArray(this.vertical)
      ? this.vertical.join(' ')
      : this.vertical.toString();
    return `${horizontal} ${vertical}`;
  }

  static get parse(): TokenParser<Position> {
    const horizontalKeyword = TokenParser.token<TokenIdent>(TokenType.Ident)
      .map((token): string => token[4].value)
      .where(
        (str: string): implies str is HorizontalKeyword =>
          str === 'left' || str === 'center' || str === 'right',
      );

    const verticalKeyword = TokenParser.token<TokenIdent>(TokenType.Ident)
      .map((token): string => token[4].value)
      .where(
        (str: string): implies str is VerticalKeyword =>
          str === 'top' || str === 'center' || str === 'bottom',
      );

    const horizontal: TokenParser<Horizontal> = TokenParser.sequence(
      horizontalKeyword,
      lengthPercentage.prefix(TokenParser.tokens.Whitespace).optional,
    ).map(([keyword, length]) => (length ? [keyword, length] : keyword));

    const vertical: TokenParser<Vertical> = TokenParser.sequence(
      verticalKeyword,
      lengthPercentage.prefix(TokenParser.tokens.Whitespace).optional,
    ).map(([keyword, length]) => (length ? [keyword, length] : keyword));

    return TokenParser.oneOf(
      TokenParser.setOf(horizontal, vertical).separatedBy(
        TokenParser.tokens.Whitespace,
      ),
      TokenParser.setOf(horizontal, lengthPercentage).separatedBy(
        TokenParser.tokens.Whitespace,
      ),
      TokenParser.setOf(lengthPercentage, vertical).separatedBy(
        TokenParser.tokens.Whitespace,
      ),
      TokenParser.sequence(lengthPercentage, lengthPercentage).separatedBy(
        TokenParser.tokens.Whitespace,
      ),
    ).map(([h, v]) => new Position(h, v));
  }
}
