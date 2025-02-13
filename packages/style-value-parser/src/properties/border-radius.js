/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { LengthPercentage } from '../css-types/length-percentage';

import { Parser } from '../core';
import { lengthPercentage } from '../css-types/length-percentage';

export class BorderRadiusIndividual {
  horizontal: LengthPercentage;
  vertical: LengthPercentage;

  constructor(horizontal: LengthPercentage, vertical?: LengthPercentage) {
    this.horizontal = horizontal;
    this.vertical = vertical ?? horizontal;
  }

  toString(): string {
    const horizontal = this.horizontal.toString();
    const vertical = this.vertical.toString();
    if (horizontal === vertical) {
      return horizontal;
    }
    return `${horizontal} ${vertical}`;
  }

  static get parse(): Parser<BorderRadiusIndividual> {
    return Parser.oneOf(
      Parser.sequence(lengthPercentage, lengthPercentage).separatedBy(
        Parser.whitespace,
      ),
      lengthPercentage.map((p) => [p, p]),
    ).map(
      ([horizontal, vertical]) =>
        new BorderRadiusIndividual(horizontal, vertical),
    );
  }
}

export class BorderRadiusShorthand {
  horizontalTopLeft: LengthPercentage;
  horizontalTopRight: LengthPercentage;
  horizontalBottomRight: LengthPercentage;
  horizontalBottomLeft: LengthPercentage;

  verticalTopLeft: LengthPercentage;
  verticalTopRight: LengthPercentage;
  verticalBottomRight: LengthPercentage;
  verticalBottomLeft: LengthPercentage;

  constructor(
    horizontalTopLeft: LengthPercentage,
    horizontalTopRight: LengthPercentage = horizontalTopLeft,
    horizontalBottomRight: LengthPercentage = horizontalTopLeft,
    horizontalBottomLeft: LengthPercentage = horizontalTopRight,
    verticalTopLeft: LengthPercentage = horizontalTopLeft,
    verticalTopRight: LengthPercentage = verticalTopLeft,
    verticalBottomRight: LengthPercentage = verticalTopLeft,
    verticalBottomLeft: LengthPercentage = verticalTopRight,
  ) {
    this.horizontalTopLeft = horizontalTopLeft;
    this.horizontalTopRight = horizontalTopRight;
    this.horizontalBottomRight = horizontalBottomRight;
    this.horizontalBottomLeft = horizontalBottomLeft;
    this.verticalTopLeft = verticalTopLeft;
    this.verticalTopRight = verticalTopRight;
    this.verticalBottomRight = verticalBottomRight;
    this.verticalBottomLeft = verticalBottomLeft;
  }

  // The shortest possible version of the border-radius
  toString(): string {
    const horizontalTopLeft = this.horizontalTopLeft.toString();
    const horizontalTopRight = this.horizontalTopRight.toString();
    const horizontalBottomRight = this.horizontalBottomRight.toString();
    const horizontalBottomLeft = this.horizontalBottomLeft.toString();

    let pStr = `${horizontalTopLeft} ${horizontalTopRight} ${horizontalBottomRight} ${horizontalBottomLeft}`;

    // All four are the same
    if (
      horizontalTopLeft === horizontalTopRight &&
      horizontalTopRight === horizontalBottomRight &&
      horizontalBottomRight === horizontalBottomLeft
    ) {
      pStr = horizontalTopLeft;
      // TopLeft === BottomRight && TopRight === BottomLeft
    } else if (
      horizontalTopLeft === horizontalBottomRight &&
      horizontalTopRight === horizontalBottomLeft
    ) {
      pStr = `${horizontalTopLeft} ${horizontalTopRight}`;
      // TopRight === BottomLeft
    } else if (horizontalTopRight === horizontalBottomLeft) {
      pStr = `${horizontalTopLeft} ${horizontalTopRight} ${horizontalBottomRight}`;
    }

    const verticalTopLeft = this.verticalTopLeft.toString();
    const verticalTopRight = this.verticalTopRight.toString();
    const verticalBottomRight = this.verticalBottomRight.toString();
    const verticalBottomLeft = this.verticalBottomLeft.toString();

    let sStr = `${horizontalTopLeft} ${horizontalTopRight} ${horizontalBottomRight} ${horizontalBottomLeft}`;
    // All three are the same
    if (
      verticalTopLeft === verticalTopRight &&
      verticalTopRight === verticalBottomRight &&
      verticalBottomRight === verticalBottomLeft
    ) {
      sStr = verticalTopLeft;
      // TopLeft === BottomRight && TopRight === BottomLeft
    } else if (
      verticalTopLeft === verticalBottomRight &&
      verticalTopRight === verticalBottomLeft
    ) {
      sStr = `${verticalTopLeft} ${verticalTopRight}`;
      // TopRight === BottomLeft
    } else if (verticalTopRight === verticalBottomLeft) {
      sStr = `${verticalTopLeft} ${verticalTopRight} ${verticalBottomRight}`;
    }

    if (pStr === sStr) {
      return pStr;
    }

    return `${pStr} / ${sStr}`;
  }

  static get parse(): Parser<BorderRadiusShorthand> {
    const spaceSeparatedRadii = Parser.sequence(
      lengthPercentage,
      lengthPercentage.prefix(Parser.whitespace).optional,
      lengthPercentage.prefix(Parser.whitespace).optional,
      lengthPercentage.prefix(Parser.whitespace).optional,
    ).map(
      ([
        topLeft,
        topRight = topLeft,
        bottomRight = topLeft,
        bottomLeft = topRight,
      ]) => [topLeft, topRight, bottomRight, bottomLeft],
    );

    const assymtricBorder = Parser.sequence(
      spaceSeparatedRadii,
      spaceSeparatedRadii,
    )
      .separatedBy(Parser.string('/').surroundedBy(Parser.whitespace))
      .map(
        ([pRadii, sRadii = pRadii]) =>
          new BorderRadiusShorthand(...pRadii, ...sRadii),
      );

    return Parser.oneOf(
      assymtricBorder,
      spaceSeparatedRadii.map(
        (borders) => new BorderRadiusShorthand(...borders),
      ),
    );
  }
}
