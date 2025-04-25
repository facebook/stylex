/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';
import { Length } from '../css-types/length';
import { Color } from '../css-types/color';

export class BoxShadow {
  +offsetX: Length;
  +offsetY: Length;
  +blurRadius: Length;
  +spreadRadius: Length;
  +color: Color;
  +inset: boolean;

  constructor(
    offsetX: Length,
    offsetY: Length,
    blurRadius: Length,
    spreadRadius: Length,
    color: Color,
    inset: boolean = false,
  ) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.blurRadius = blurRadius;
    this.spreadRadius = spreadRadius;
    this.color = color;
    this.inset = inset;
  }

  static get parse(): TokenParser<BoxShadow> {
    const outerShadow = TokenParser.sequence(
      Length.parser,
      Length.parser,
      Length.parser.optional,
      Length.parser.optional,
      Color.parser,
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(
        ([offsetX, offsetY, blurRadius, spreadRadius, color]) =>
          new BoxShadow(
            offsetX,
            offsetY,
            blurRadius ?? new Length(0, 'px'),
            spreadRadius ?? new Length(0, 'px'),
            color,
          ),
      );

    const insetShadow = TokenParser.sequence(
      outerShadow,
      TokenParser.string('inset'),
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(
        ([shadow, _inset]) =>
          new BoxShadow(
            shadow.offsetX,
            shadow.offsetY,
            shadow.blurRadius,
            shadow.spreadRadius,
            shadow.color,
            true,
          ),
      );

    return TokenParser.oneOf(insetShadow, outerShadow);
  }
}

export class BoxShadowList {
  +shadows: $ReadOnlyArray<BoxShadow>;

  constructor(shadows: $ReadOnlyArray<BoxShadow>) {
    this.shadows = shadows;
  }

  static get parse(): TokenParser<BoxShadowList> {
    return TokenParser.oneOrMore(BoxShadow.parse)
      .separatedBy(
        TokenParser.tokens.Comma.surroundedBy(
          TokenParser.tokens.Whitespace.optional,
        ),
      )
      .map((shadows) => new BoxShadowList(shadows));
  }
}
