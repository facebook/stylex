/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

export class EasingFunction {
  static get parse(): Parser<EasingFunction> {
    return Parser.oneOf(
      LinearEasingFunction.parse,
      CubicBezierEasingFunction.parse,
      CubicBezierKeyword.parse,
      StepsEasingFunction.parse,
      StepsKeyword.parse,
    );
  }
}

export class LinearEasingFunction extends EasingFunction {
  +points: $ReadOnlyArray<number>;
  constructor(points: $ReadOnlyArray<number>) {
    super();
    this.points = points;
  }
  toString(): string {
    return `linear(${this.points.join(', ')})`;
  }
  static get parse(): Parser<LinearEasingFunction> {
    return Parser.sequence(
      Parser.string('linear('),
      Parser.oneOrMore(Parser.float)
        .separatedBy(
          Parser.string(',').surroundedBy(Parser.whitespace.optional),
        )
        .surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_linear, points, _end]) => new LinearEasingFunction(points));
  }
}

export class CubicBezierEasingFunction extends EasingFunction {
  +points: [number, number, number, number];
  constructor(points: [number, number, number, number]) {
    super();
    this.points = points;
  }
  toString(): string {
    return `cubic-bezier(${this.points.join(', ')})`;
  }
  static get parse(): Parser<CubicBezierEasingFunction> {
    return Parser.sequence(
      Parser.string('cubic-bezier('),
      Parser.oneOrMore(Parser.float)
        .separatedBy(
          Parser.string(',').surroundedBy(Parser.whitespace.optional),
        )
        .surroundedBy(Parser.whitespace.optional)
        .where((points) => points.length === 4),
      Parser.string(')'),
    ).map(
      ([_linear, [x1, y1, x2, y2], _end]) =>
        new CubicBezierEasingFunction([x1, y1, x2, y2]),
    );
  }
}

type TCubicBezierKeyword = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
export class CubicBezierKeyword extends EasingFunction {
  +keyword: TCubicBezierKeyword;
  constructor(keyword: TCubicBezierKeyword) {
    super();
    this.keyword = keyword;
  }
  toString(): string {
    return this.keyword;
  }
  static get parse(): Parser<CubicBezierKeyword> {
    return Parser.oneOf<TCubicBezierKeyword>(
      Parser.string('ease-in-out'),
      Parser.string('ease-in'),
      Parser.string('ease-out'),
      Parser.string('ease'),
    ).map((keyword) => new CubicBezierKeyword(keyword));
  }
}

export class StepsEasingFunction extends EasingFunction {
  +steps: number;
  +start: 'start' | 'end';
  constructor(steps: number, start: 'start' | 'end') {
    super();
    this.steps = steps;
    this.start = start;
  }
  toString(): string {
    return `steps(${this.steps}, ${this.start})`;
  }
  static get parse(): Parser<StepsEasingFunction> {
    return Parser.sequence(
      Parser.string('steps('),
      Parser.sequence(
        Parser.natural,
        Parser.oneOf(Parser.string('start'), Parser.string('end')),
      )
        .separatedBy(
          Parser.string(',').surroundedBy(Parser.whitespace.optional),
        )
        .surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, [steps, start], _2]) => new StepsEasingFunction(steps, start));
  }
}

export class StepsKeyword extends EasingFunction {
  +keyword: 'step-start' | 'step-end';
  constructor(keyword: 'step-start' | 'step-end') {
    super();
    this.keyword = keyword;
  }
  toString(): string {
    return this.keyword;
  }
  static get parse(): Parser<StepsKeyword> {
    return Parser.oneOf(
      Parser.string('step-start'),
      Parser.string('step-end'),
    ).map((keyword) => new StepsKeyword(keyword));
  }
}
