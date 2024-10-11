/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { Length, Px } from '../css-types/length';
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

  static get parse(): Parser<BoxShadow> {
    const outerShadow = Parser.sequence(
      Length.parse,
      Length.parse,
      Length.parse.optional,
      Length.parse.optional,
      Color.parse,
    )
      .separatedBy(Parser.whitespace)
      .map(
        ([offsetX, offsetY, blurRadius, spreadRadius, color]) =>
          new BoxShadow(
            offsetX,
            offsetY,
            blurRadius ?? new Px(0),
            spreadRadius ?? new Px(0),
            color,
          ),
      );

    const insetShadow = Parser.setOf(outerShadow, Parser.string('inset'))
      .separatedBy(Parser.whitespace)
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

    return Parser.oneOf(outerShadow, insetShadow);
  }
}

export class BoxShadowList {
  +shadows: $ReadOnlyArray<BoxShadow>;

  constructor(shadows: $ReadOnlyArray<BoxShadow>) {
    this.shadows = shadows;
  }

  static get parse(): Parser<BoxShadowList> {
    return Parser.oneOrMore(BoxShadow.parse)
      .separatedBy(Parser.string(',').surroundedBy(Parser.whitespace.optional))
      .map((shadows) => new BoxShadowList(shadows));
  }
}
