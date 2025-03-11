/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { LengthPercentage } from './length-percentage';
import { Position } from './position';

import { BorderRadiusShorthand } from '../properties/border-radius';
import { Parser } from '../core';
import { lengthPercentage } from './length-percentage';

class BasicShape {
  toString(): string {
    throw new Error('Not implemented. Use a sub-class instead.');
  }
}

export class Inset extends BasicShape {
  +top: LengthPercentage;
  +right: LengthPercentage;
  +bottom: LengthPercentage;
  +left: LengthPercentage;
  +round: ?BorderRadiusShorthand;
  constructor(
    top: LengthPercentage,
    right: LengthPercentage,
    bottom: LengthPercentage,
    left: LengthPercentage,
    round: ?BorderRadiusShorthand,
  ) {
    super();
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.round = round;
  }
  // Stringify the shortest possible version of the inset
  toString(): string {
    const { top, right, bottom, left, round } = this;
    const roundStr =
      this.round != null ? ` round ${this.round.toString()}` : '';
    if (
      top === right &&
      right === bottom &&
      bottom === left &&
      left === round
    ) {
      return `inset(${top.toString()}${roundStr})`;
    }
    if (top === bottom && left === right) {
      return `inset(${top.toString()} ${right.toString()}${roundStr})`;
    }
    if (top === bottom) {
      return `inset(${top.toString()} ${right.toString()} ${bottom.toString()}${roundStr})`;
    }
    return `inset(${top.toString()} ${right.toString()} ${bottom.toString()} ${left.toString()} ${roundStr})`;
  }
  static get parse(): Parser<Inset> {
    type Insets = [
      LengthPercentage,
      LengthPercentage,
      LengthPercentage,
      LengthPercentage,
    ];
    const insets: Parser<Insets> = Parser.oneOf(
      lengthPercentage.map((v) => [v, v, v, v]),
      Parser.sequence(lengthPercentage, lengthPercentage)
        .separatedBy(Parser.whitespace)
        .map(([v, h]) => [v, h, v, h]),
      Parser.sequence(lengthPercentage, lengthPercentage, lengthPercentage)
        .separatedBy(Parser.whitespace)
        .map(([t, h, b]) => [t, h, b, h]),
      Parser.sequence(
        lengthPercentage,
        lengthPercentage,
        lengthPercentage,
        lengthPercentage,
      ).separatedBy(Parser.whitespace),
    );

    // $FlowFixMe Need to migrate to TokenParser from Parser here
    const round: Parser<BorderRadiusShorthand> = Parser.sequence(
      Parser.string('round'),
      Parser.whitespace,
      BorderRadiusShorthand.parse,
    // $FlowFixMe annotate props here
    ).map(([, , v]) => v);

    return Parser.sequence(
      Parser.string('inset('),
      insets.prefix(Parser.whitespace.optional),
      round.prefix(Parser.whitespace).optional,
      Parser.string(')').prefix(Parser.whitespace.optional),
    ).map(([_, [t, r, b, l], round]) => new Inset(t, r, b, l, round));
  }
}

export type TCircleRadius = LengthPercentage | 'closest-side' | 'farthest-side';
export class Circle extends BasicShape {
  +radius: TCircleRadius;
  +position: ?Position;
  constructor(radius: TCircleRadius, position: ?Position) {
    super();
    this.radius = radius;
    this.position = position;
  }
  toString(): string {
    const { radius, position } = this;
    const positionStr = position != null ? ` at ${position.toString()}` : '';
    return `circle(${radius.toString()}${positionStr})`;
  }
  static get parse(): Parser<Circle> {
    const radius: Parser<TCircleRadius> = Parser.oneOf(
      lengthPercentage,
      Parser.string('closest-side'),
      Parser.string('farthest-side'),
    );

    const position: Parser<Position> = Parser.sequence(
      Parser.string('at'),
      Position.parse,
    )
      .separatedBy(Parser.whitespace)
      .map(([, v]) => v);

    return Parser.sequence(
      Parser.string('circle('),
      radius.prefix(Parser.whitespace.optional),
      position.prefix(Parser.whitespace).optional,
      Parser.string(')').prefix(Parser.whitespace.optional),
    ).map(([_, radius, position]) => new Circle(radius, position));
  }
}

export class Ellipse extends BasicShape {
  +radiusX: TCircleRadius;
  +radiusY: TCircleRadius;
  +position: ?Position;
  constructor(
    radiusX: TCircleRadius,
    radiusY: TCircleRadius,
    position: ?Position,
  ) {
    super();
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.position = position;
  }
  toString(): string {
    const { radiusX, radiusY, position } = this;
    const positionStr = position != null ? ` at ${position.toString()}` : '';
    return `ellipse(${radiusX.toString()} ${radiusY.toString()}${positionStr})`;
  }

  static get parse(): Parser<Ellipse> {
    const radius: Parser<TCircleRadius> = Parser.oneOf(
      lengthPercentage,
      Parser.string('closest-side'),
      Parser.string('farthest-side'),
    );

    const position: Parser<Position> = Parser.sequence(
      Parser.string('at'),
      Position.parse,
    )
      .separatedBy(Parser.whitespace)
      .map(([_at, v]) => v);

    return Parser.sequence(
      Parser.string('ellipse('),
      radius.prefix(Parser.whitespace.optional),
      radius.prefix(Parser.whitespace),
      position.prefix(Parser.whitespace).optional,
      Parser.string(')').prefix(Parser.whitespace.optional),
    ).map(
      ([_, radiusX, radiusY, position]) =>
        new Ellipse(radiusX, radiusY, position),
    );
  }
}

type FillRule = ?'nonzero' | 'evenodd';
const fillRule: Parser<'nonzero' | 'evenodd'> = Parser.oneOf(
  Parser.string('nonzero'),
  Parser.string('evenodd'),
)
  .surroundedBy(Parser.whitespace.optional)
  .skip(Parser.string(','));

type Points = $ReadOnlyArray<[LengthPercentage, LengthPercentage]>;

export class Polygon extends BasicShape {
  +fillRule: FillRule;
  +points: Points;
  constructor(points: Points, fillRule: FillRule) {
    super();
    this.points = points;
    this.fillRule = fillRule;
  }
  toString(): string {
    const fillRule = this.fillRule != null ? `${this.fillRule}, ` : '';
    return `polygon(${fillRule}${this.points
      .map(([x, y]) => `${x.toString()} ${y.toString()}`)
      .join(', ')})`;
  }
  static get parse(): Parser<Polygon> {
    return Parser.sequence(
      Parser.string('polygon('),
      fillRule.optional,
      Parser.oneOrMore(
        Parser.sequence(lengthPercentage, lengthPercentage).separatedBy(
          Parser.whitespace,
        ),
      ),
      Parser.string(')').prefix(Parser.whitespace.optional),
    ).map(([_, fillRule, points]) => new Polygon(points, fillRule));
  }
}

export class Path extends BasicShape {
  +fillRule: ?FillRule;
  +path: string;
  constructor(path: string, fillRule: FillRule) {
    super();
    this.path = path;
    this.fillRule = fillRule;
  }
  toString(): string {
    const fillRule = this.fillRule != null ? `${this.fillRule}, ` : '';
    return `path(${fillRule}"${this.path}")`;
  }
  static get parse(): Parser<Path> {
    return Parser.sequence(
      Parser.string('path('),
      fillRule.optional,
      Parser.quotedString,
      Parser.string(')').prefix(Parser.whitespace.optional),
    ).map(([_, fillRule, path]) => new Path(path, fillRule));
  }
}
