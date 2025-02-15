/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length } from './length';

import { TokenParser } from '../core2';
import { Angle } from './angle';
import { Percentage, numberOrPercentage } from './common-types';
import { lengthPercentage } from './length-percentage';
import type { LengthPercentage } from './length-percentage';

export class TransformFunction {
  static get parser(): TokenParser<TransformFunction> {
    return TokenParser.oneOf<TransformFunction>(
      Matrix.parser,
      Matrix3d.parser,
      Perspective.parser,
      Rotate.parser,
      RotateXYZ.parser,
      Rotate3d.parser,
      RotateAxis.parser,
      Scale.parser,
      Scale3d.parser,
      ScaleAxis.parser,
      Skew.parser,
      SkewAxis.parser,
      Translate3d.parser,
      Translate.parser,
      TranslateAxis.parser,
    );
  }
}

export class Matrix extends TransformFunction {
  +a: number;
  +b: number;
  +c: number;
  +d: number;
  +tx: number;
  +ty: number;
  constructor(
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number,
  ) {
    super();
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }
  toString(): string {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`;
  }
  static get parser(): TokenParser<Matrix> {
    const sixNumbers: TokenParser<
      [number, number, number, number, number, number],
    > = TokenParser.sequence(
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
      TokenParser.tokens.Number.map((v) => v[4].value),
    )
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional);

    return TokenParser.sequence(
      TokenParser.fn('matrix'),
      sixNumbers,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(
        ([_fn, [a, b, c, d, tx, ty], _closeParen]) =>
          new Matrix(a, b, c, d, tx, ty),
      );
  }
}

export class Matrix3d extends TransformFunction {
  // prettier-ignore
  +args: $ReadOnly<[
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
  ]>;
  constructor(args: this['args']) {
    super();
    this.args = args;
  }
  toString(): string {
    return `matrix3d(${this.args.join(', ')})`;
  }
  static get parser(): TokenParser<Matrix3d> {
    const number = TokenParser.tokens.Number.map((v) => v[4].value);

    const fourNumbers = TokenParser.sequence(number, number, number, number)
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional);

    const sixteenNumbers = TokenParser.sequence(
      fourNumbers,
      fourNumbers,
      fourNumbers,
      fourNumbers,
    )
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([f1, f2, f3, f4]) => [...f1, ...f2, ...f3, ...f4]);

    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'matrix3d',
      ),
      sixteenNumbers,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, args]) => new Matrix3d(args as $FlowFixMe));
  }
}

export class Perspective extends TransformFunction {
  +length: Length;
  constructor(length: Length) {
    super();
    this.length = length;
  }
  toString(): string {
    return `perspective(${this.length.toString()})`;
  }

  static get parser(): TokenParser<Perspective> {
    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'perspective',
      ),
      Length.parser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, length]) => new Perspective(length));
  }
}

export class Rotate extends TransformFunction {
  +angle: Angle;
  constructor(angle: Angle) {
    super();
    this.angle = angle;
  }
  toString(): string {
    return `rotate(${this.angle.toString()})`;
  }
  static get parser(): TokenParser<Rotate> {
    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'rotate',
      ),
      Angle.parser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, angle]) => new Rotate(angle));
  }
}

export class RotateXYZ extends TransformFunction {
  +x: Angle;
  +axis: 'X' | 'Y' | 'Z';
  constructor(x: this['x'], axis: this['axis']) {
    super();
    this.x = x;
    this.axis = axis;
  }
  toString(): string {
    return `rotate${this.axis}(${this.x.toString()})`;
  }
  static get parser(): TokenParser<RotateXYZ> {
    return TokenParser.sequence(
      TokenParser.oneOf(
        TokenParser.fn('rotateX').map(() => 'X'),
        TokenParser.fn('rotateY').map(() => 'Y'),
        TokenParser.fn('rotateZ').map(() => 'Z'),
      ),
      Angle.parser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([axis, x]) => new RotateXYZ(x, axis));
  }
}

export class Rotate3d extends TransformFunction {
  +x: number;
  +y: number;
  +z: number;
  +angle: Angle;
  constructor(x: number, y: number, z: number, angle: Angle) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
    this.angle = angle;
  }
  toString(): string {
    const { x, y, z } = this;
    switch (true) {
      case x === 1 && y === 0 && z === 0:
        return `rotateX(${this.angle.toString()})`;
      case x === 0 && y === 1 && z === 0:
        return `rotateY(${this.angle.toString()})`;
      case x === 0 && y === 0 && z === 1:
        return `rotateZ(${this.angle.toString()})`;
      default:
        return `rotate3d(${this.x}, ${this.y}, ${
          this.z
        }, ${this.angle.toString()})`;
    }
  }
  static get parser(): TokenParser<Rotate3d> {
    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'rotate3d',
      ),
      TokenParser.sequence(
        TokenParser.tokens.Number.map((v) => v[4].value),
        TokenParser.tokens.Number.map((v) => v[4].value),
        TokenParser.tokens.Number.map((v) => v[4].value),
        Angle.parser,
      ).separatedBy(
        TokenParser.tokens.Comma.skip(TokenParser.tokens.Whitespace.optional),
      ),
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, [x, y, z, angle]]) => new Rotate3d(x, y, z, angle));
  }
}

export class RotateAxis extends TransformFunction {
  +angle: Angle;
  +axis: 'X' | 'Y' | 'Z';
  constructor(angle: Angle, axis: 'X' | 'Y' | 'Z') {
    super();
    this.angle = angle;
    this.axis = axis;
  }
  toString(): string {
    return `rotate${this.axis}(${this.angle.toString()})`;
  }
  static get parser(): TokenParser<RotateAxis> {
    return TokenParser.sequence(
      TokenParser.sequence(
        TokenParser.tokens.Function.map((v) => v[4].value).where(
          (v) => v === 'rotate',
        ),
        TokenParser.oneOf<'X' | 'Y' | 'Z'>(
          TokenParser.tokens.Ident.map((v) => v[4].value).where(
            (v) => v === 'X',
          ),
          TokenParser.tokens.Ident.map((v) => v[4].value).where(
            (v) => v === 'Y',
          ),
          TokenParser.tokens.Ident.map((v) => v[4].value).where(
            (v) => v === 'Z',
          ),
        ),
        TokenParser.tokens.OpenParen,
      ).map(([_, axis, _1]) => axis),
      Angle.parser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([axis, angle]) => new RotateAxis(angle, axis));
  }
}

export class Scale extends TransformFunction {
  +sx: number;
  +sy: void | number;
  constructor(sx: this['sx'], sy?: ?this['sy']) {
    super();
    this.sx = sx;
    this.sy = sy ?? undefined;
  }
  toString(): string {
    const { sx, sy } = this;
    if (sy == null) {
      return `scale(${sx.toString()})`;
    }
    return `scale(${sx.toString()}, ${sy.toString()})`;
  }
  static get parser(): TokenParser<Scale> {
    // TokenParser.oneOf<
    //   number | [number, number],
    // >(
    //   TokenParser.sequence(numberOrPercentage, numberOrPercentage).separatedBy(
    //     TokenParser.tokens.Comma.skip(TokenParser.tokens.Whitespace.optional),
    //   ),
    //   numberOrPercentage,
    // ).map((arg) => {
    //   if (Array.isArray(arg)) {
    //     return arg;
    //   }
    //   return [arg, null];
    // });

    const scalesXY = TokenParser.sequence(
      numberOrPercentage.map((v) =>
        v instanceof Percentage ? v.value / 100 : v,
      ),
      numberOrPercentage.map((v) =>
        v instanceof Percentage ? v.value / 100 : v,
      ).optional,
    )
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional);

    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'scale',
      ),
      scalesXY,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, [sx, sy]]) => new Scale(sx, sy));
  }
}

export class Scale3d extends TransformFunction {
  +sx: number;
  +sy: number;
  +sz: number;
  constructor(sx: this['sx'], sy: this['sy'], sz: this['sz']) {
    super();
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
  }
  toString(): string {
    return `scale3d(${this.sx.toString()}, ${this.sy.toString()}, ${this.sz.toString()})`;
  }
  static get parser(): TokenParser<Scale3d> {
    const numberOrPercentageAsNumber = numberOrPercentage.map((v) =>
      v instanceof Percentage ? v.value / 100 : v,
    );

    const args = TokenParser.sequence(
      numberOrPercentageAsNumber,
      numberOrPercentageAsNumber,
      numberOrPercentageAsNumber,
    )
      .separatedBy(TokenParser.tokens.Comma)
      .separatedBy(TokenParser.tokens.Whitespace.optional);

    return TokenParser.sequence(
      TokenParser.fn('scale3d'),
      args,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, [sx, sy, sz]]) => new Scale3d(sx, sy, sz));
  }
}

export class ScaleAxis extends TransformFunction {
  +s: number;
  +axis: 'X' | 'Y' | 'Z';
  constructor(s: this['s'], axis: this['axis']) {
    super();
    this.s = s;
    this.axis = axis;
  }
  toString(): string {
    return `scale${this.axis}(${this.s.toString()})`;
  }
  static get parser(): TokenParser<ScaleAxis> {
    return TokenParser.sequence(
      TokenParser.oneOf(
        TokenParser.fn('scaleX').map(() => 'X'),
        TokenParser.fn('scaleY').map(() => 'Y'),
        TokenParser.fn('scaleZ').map(() => 'Z'),
      ),
      numberOrPercentage.map((v) =>
        v instanceof Percentage ? v.value / 100 : v,
      ),
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([axis, s]) => new ScaleAxis(s, axis));
  }
}

export class Skew extends TransformFunction {
  +ax: Angle;
  +ay: void | Angle;
  constructor(ax: this['ax'], ay?: ?this['ay']) {
    super();
    this.ax = ax;
    this.ay = ay ?? undefined;
  }
  toString(): string {
    const { ax, ay } = this;
    if (ay == null) {
      return `skew(${ax.toString()})`;
    }
    return `skew(${ax.toString()}, ${ay.toString()})`;
  }
  static get parser(): TokenParser<Skew> {
    const args = TokenParser.oneOf<Angle | [Angle, Angle]>(
      TokenParser.sequence(Angle.parser, Angle.parser).separatedBy(
        TokenParser.tokens.Comma.skip(TokenParser.tokens.Whitespace.optional),
      ),
      Angle.parser,
    ).map((arg) => {
      if (Array.isArray(arg)) {
        return arg;
      }
      return [arg, null];
    });

    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'skew',
      ),
      args,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, [ax, ay]]) => new Skew(ax, ay));
  }
}

export class SkewAxis extends TransformFunction {
  +a: Angle;
  +axis: 'X' | 'Y';
  constructor(a: this['a'], axis: this['axis']) {
    super();
    this.a = a;
    this.axis = axis;
  }
  toString(): string {
    return `skew${this.axis}(${this.a.toString()})`;
  }
  static get parser(): TokenParser<SkewAxis> {
    return TokenParser.sequence(
      TokenParser.oneOf(
        TokenParser.fn('skewX').map(() => 'X'),
        TokenParser.fn('skewY').map(() => 'Y'),
      ),
      Angle.parser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([axis, a]) => new SkewAxis(a, axis));
  }
}

export class Translate extends TransformFunction {
  +tx: LengthPercentage;
  +ty: void | LengthPercentage;
  constructor(tx: this['tx'], ty?: ?this['ty']) {
    super();
    this.tx = tx;
    this.ty = ty ?? undefined;
  }
  toString(): string {
    const { tx, ty } = this;
    if (ty == null) {
      return `translate(${tx.toString()})`;
    }
    return `translate(${tx.toString()}, ${ty.toString()})`;
  }
  static get parser(): TokenParser<Translate> {
    const oneArg = lengthPercentage;
    const twoArgs = TokenParser.sequence(
      lengthPercentage,
      lengthPercentage,
    ).separatedBy(
      TokenParser.tokens.Comma.skip(TokenParser.tokens.Whitespace.optional),
    );
    const args = TokenParser.oneOf<
      LengthPercentage | [LengthPercentage, LengthPercentage],
    >(twoArgs, oneArg).map((arg) => {
      if (Array.isArray(arg)) {
        return arg;
      }
      return [arg, null];
    });

    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'translate',
      ),
      args,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, [tx, ty]]) => new Translate(tx, ty));
  }
}

export class Translate3d extends TransformFunction {
  +tx: LengthPercentage;
  +ty: LengthPercentage;
  +tz: Length;
  constructor(tx: LengthPercentage, ty: LengthPercentage, tz: Length) {
    super();
    this.tx = tx;
    this.ty = ty;
    this.tz = tz;
  }
  toString(): string {
    return `translate3d(${this.tx.toString()}, ${this.ty.toString()}, ${this.tz.toString()})`;
  }
  static get parser(): TokenParser<Translate3d> {
    return TokenParser.sequence(
      TokenParser.tokens.Function.map((v) => v[4].value).where(
        (v) => v === 'translate3d',
      ),
      TokenParser.sequence(
        lengthPercentage,
        lengthPercentage,
        Length.parser,
      ).separatedBy(
        TokenParser.tokens.Comma.skip(TokenParser.tokens.Whitespace.optional),
      ),
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, [tx, ty, tz]]) => new Translate3d(tx, ty, tz));
  }
}

export class TranslateAxis extends TransformFunction {
  +t: LengthPercentage;
  +axis: 'X' | 'Y' | 'Z';
  constructor(t: LengthPercentage, axis: 'X' | 'Y' | 'Z') {
    super();
    this.t = t;
    this.axis = axis;
  }
  toString(): string {
    return `translate${this.axis}(${this.t.toString()})`;
  }
  static get parser(): TokenParser<TranslateAxis> {
    return TokenParser.sequence(
      TokenParser.oneOf(
        TokenParser.fn('translateX').map(() => 'X'),
        TokenParser.fn('translateY').map(() => 'Y'),
        TokenParser.fn('translateZ').map(() => 'Z'),
      ),
      lengthPercentage,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([axis, t]) => new TranslateAxis(t, axis));
  }
}
