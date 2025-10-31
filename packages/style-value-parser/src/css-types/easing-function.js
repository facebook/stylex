/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';

export class EasingFunction {
  static get parser(): TokenParser<EasingFunction> {
    return TokenParser.oneOf(
      LinearEasingFunction.parser,
      CubicBezierEasingFunction.parser,
      CubicBezierKeyword.parser,
      StepsEasingFunction.parser,
      StepsKeyword.parser,
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
  static get parser(): TokenParser<LinearEasingFunction> {
    const pointsParser = TokenParser.oneOrMore(
      TokenParser.tokens.Number.map((v) => v[4].value),
    )
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional);

    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'linear',
      ),
      pointsParser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_linear, points, _end]) => new LinearEasingFunction(points));
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
  static get parser(): TokenParser<CubicBezierEasingFunction> {
    const numbers = TokenParser.sequence(
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
    )
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional);

    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'cubic-bezier',
      ),
      numbers,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_linear, points, _end]) => new CubicBezierEasingFunction(points));
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
  static get parser(): TokenParser<CubicBezierKeyword> {
    return TokenParser.oneOf<TCubicBezierKeyword>(
      TokenParser.tokens.Ident.map((v) => v[4].value).where(
        (v) => v === 'ease-in-out',
      ),
      TokenParser.tokens.Ident.map((v) => v[4].value).where(
        (v) => v === 'ease-in',
      ),
      TokenParser.tokens.Ident.map((v) => v[4].value).where(
        (v) => v === 'ease-out',
      ),
      TokenParser.tokens.Ident.map((v) => v[4].value).where(
        (v) => v === 'ease',
      ),
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
  static get parser(): TokenParser<StepsEasingFunction> {
    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'steps',
      ),
      TokenParser.sequence(
        TokenParser.tokens.Number.map((v) => v[4].value),
        TokenParser.oneOf(
          TokenParser.tokens.Ident.map((v) => v[4].value).where(
            (v) => v === 'start',
          ),
          TokenParser.tokens.Ident.map((v) => v[4].value).where(
            (v) => v === 'end',
          ),
        ),
      )
        .separatedBy(
          TokenParser.tokens.Comma.surroundedBy(
            TokenParser.tokens.Whitespace.optional,
          ),
        )
        .surroundedBy(TokenParser.tokens.Whitespace.optional),
      TokenParser.tokens.CloseParen,
    ).map(
      ([_fn, [steps, start], _end]) => new StepsEasingFunction(steps, start),
    );
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
  static get parser(): TokenParser<StepsKeyword> {
    return TokenParser.oneOf(
      TokenParser.tokens.Ident.map((v) => v[4].value).where(
        (v) => v === 'step-start',
      ),
      TokenParser.tokens.Ident.map((v) => v[4].value).where(
        (v) => v === 'step-end',
      ),
    ).map((keyword) => new StepsKeyword(keyword));
  }
}
