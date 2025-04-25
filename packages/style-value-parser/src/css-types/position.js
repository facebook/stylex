/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TokenIdent } from '@csstools/css-tokenizer';
import { TokenParser } from '../token-parser';
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
  +horizontal: ?Horizontal;
  +vertical: ?Vertical;
  constructor(horizontal: ?Horizontal, vertical: ?Vertical) {
    this.horizontal = horizontal;
    this.vertical = vertical;
  }

  toString(): string {
    const horizontal = Array.isArray(this.horizontal)
      ? this.horizontal.join(' ')
      : this.horizontal?.toString();
    const vertical = Array.isArray(this.vertical)
      ? this.vertical.join(' ')
      : this.vertical?.toString();
    return [horizontal, vertical].filter(Boolean).join(' ');
  }

  static get parser(): TokenParser<Position> {
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
      lengthPercentage.optional,
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([keyword, length]) => (length ? [keyword, length] : keyword));

    const vertical: TokenParser<Vertical> = TokenParser.sequence(
      verticalKeyword,
      lengthPercentage.optional,
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([keyword, length]) => (length ? [keyword, length] : keyword));

    const bothKeywords = TokenParser.setOf(horizontal, vertical)
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([h, v]) => new Position(h, v));

    const numberPlusVertical = TokenParser.sequence(lengthPercentage, vertical)
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([length, v]) => new Position(length, v));

    const numberPlusHorizontal = TokenParser.sequence(
      lengthPercentage,
      horizontal,
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([length, h]) => new Position(h, length));

    const numbersOnly = TokenParser.sequence(
      lengthPercentage,
      lengthPercentage.optional,
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([length1, length2]) => new Position(length1, length2 ?? length1));

    return TokenParser.oneOf(
      bothKeywords,
      numberPlusVertical,
      numberPlusHorizontal,
      horizontal.map((h) => new Position(h, undefined)),
      vertical.map((v) => new Position(undefined, v)),
      numbersOnly,
    );
  }
}
