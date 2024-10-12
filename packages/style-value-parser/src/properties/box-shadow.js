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

/**
 * MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
 */
export class BoxShadowSingle {
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

  toString(): string {
    return [
      this.offsetX.toString(),
      this.offsetY.toString(),
      this.blurRadius.value === 0 ? null : this.blurRadius.toString(),
      this.spreadRadius.value === 0 ? null : this.spreadRadius.toString(),
      this.color.toString(),
      this.inset ? 'inset' : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  static get parse(): Parser<BoxShadowSingle> {
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
          new BoxShadowSingle(
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
          new BoxShadowSingle(
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

export class BoxShadow {
  +shadows: $ReadOnlyArray<BoxShadowSingle>;

  constructor(shadows: $ReadOnlyArray<BoxShadowSingle>) {
    this.shadows = shadows;
  }

  toString(): string {
    return this.shadows.map((shadow) => shadow.toString()).join(', ');
  }

  static get parse(): Parser<BoxShadow> {
    return Parser.oneOrMore(BoxShadowSingle.parse)
      .separatedBy(Parser.string(',').surroundedBy(Parser.whitespace.optional))
      .map((shadows) => new BoxShadow(shadows));
  }
}

export const boxShadow = BoxShadow;
