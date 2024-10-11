/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { type LengthPercentage, lengthPercentage } from './length-percentage';

type HorizonalKeyword = 'left' | 'center' | 'right';
type VerticalKeyword = 'top' | 'center' | 'bottom';

type Horizontal =
  | LengthPercentage
  | HorizonalKeyword
  | [HorizonalKeyword, LengthPercentage];
type Vertical =
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

  static get parse(): Parser<Position> {
    const horizontalKeyword = Parser.oneOf(
      Parser.string('left'),
      Parser.string('center'),
      Parser.string('right'),
    );
    const verticalKeyword = Parser.oneOf(
      Parser.string('top'),
      Parser.string('center'),
      Parser.string('bottom'),
    );

    const horizontal: Parser<Horizontal> = Parser.sequence(
      horizontalKeyword,
      lengthPercentage.prefix(Parser.whitespace).optional,
    ).map(([keyword, length]) => (length ? [keyword, length] : keyword));

    const vertical: Parser<Vertical> = Parser.sequence(
      verticalKeyword,
      lengthPercentage.prefix(Parser.whitespace).optional,
    ).map(([keyword, length]) => (length ? [keyword, length] : keyword));
    return Parser.oneOf(
      Parser.setOf(horizontal, vertical).separatedBy(Parser.whitespace),
      Parser.setOf(horizontal, lengthPercentage).separatedBy(Parser.whitespace),
      Parser.setOf(lengthPercentage, vertical).separatedBy(Parser.whitespace),
      Parser.sequence(lengthPercentage, lengthPercentage).separatedBy(
        Parser.whitespace,
      ),
    ).map(([h, v]) => new Position(h, v));
  }
}
