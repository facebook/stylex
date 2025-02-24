/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length } from './length';

import { Parser } from '../core';
import { number } from './number';
import { Angle } from './angle';
import { type Percentage, numberOrPercentage } from './common-types';
import { lengthPercentage } from './length-percentage';
import type { LengthPercentage } from './length-percentage';

export class TransformFunction {
  static get parse(): Parser<TransformFunction> {
    return Parser.oneOf<TransformFunction>(
      Matrix.parse,
      Matrix3d.parse,
      Perspective.parse,
      Rotate.parse,
      Rotate3d.parse,
      RotateAxis.parse,
      Scale.parse,
      Scale3d.parse,
      ScaleAxis.parse,
      Skew.parse,
      SkewAxis.parse,
      Translate3d.parse,
      Translate.parse,
      TranslateX.parse,
      TranslateY.parse,
      TranslateZ.parse,
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
  static get parse(): Parser<Matrix> {
    return Parser.sequence(number, number, number, number, number, number)
      .separatedBy(Parser.string(',').skip(Parser.whitespace.optional))
      .surroundedBy(Parser.whitespace.optional)
      .surroundedBy(Parser.string('matrix('), Parser.string(')'))
      .map(([a, b, c, d, tx, ty]) => new Matrix(a, b, c, d, tx, ty));
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
  static get parse(): Parser<Matrix3d> {
    return Parser.sequence(
      Parser.string('matrix3d('),
      Parser.oneOrMore(number)
        .separatedBy(Parser.string(',').skip(Parser.whitespace.optional))
        .where((args) => args.length === 16),
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
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

  static get parse(): Parser<Perspective> {
    return Parser.sequence(
      Parser.string('perspective('),
      Length.parse,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
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
  static get parse(): Parser<Rotate> {
    return Parser.sequence(
      Parser.string('rotate('),
      Angle.parse,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, angle]) => new Rotate(angle));
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
  static get parse(): Parser<Rotate3d> {
    return Parser.sequence(
      Parser.string('rotate3d('),
      Parser.sequence(number, number, number, Angle.parse).separatedBy(
        Parser.string(',').skip(Parser.whitespace.optional),
      ),
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
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
  static get parse(): Parser<RotateAxis> {
    return Parser.sequence(
      Parser.sequence(
        Parser.string('rotate'),
        Parser.oneOf<'X' | 'Y' | 'Z'>(
          Parser.string('X'),
          Parser.string('Y'),
          Parser.string('Z'),
        ),
        Parser.string('('),
      ).map(([_, axis, _1]) => axis),
      Angle.parse,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([axis, angle]) => new RotateAxis(angle, axis));
  }
}

export class Scale extends TransformFunction {
  +sx: number | Percentage;
  +sy: void | number | Percentage;
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
  static get parse(): Parser<Scale> {
    const args = Parser.oneOf<
      number | Percentage | [number | Percentage, number | Percentage],
    >(
      Parser.sequence(numberOrPercentage, numberOrPercentage).separatedBy(
        Parser.string(',').skip(Parser.whitespace.optional),
      ),
      numberOrPercentage,
    ).map((arg) => {
      if (Array.isArray(arg)) {
        return arg;
      }
      return [arg, null];
    });

    return Parser.sequence(Parser.string('scale('), args, Parser.string(')'))
      .separatedBy(Parser.whitespace.optional)
      .map(([_, [sx, sy]]) => new Scale(sx, sy));
  }
}

export class Scale3d extends TransformFunction {
  +sx: number | Percentage;
  +sy: number | Percentage;
  +sz: number | Percentage;
  constructor(sx: this['sx'], sy: this['sy'], sz: this['sz']) {
    super();
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
  }
  toString(): string {
    return `scale3d(${this.sx.toString()}, ${this.sy.toString()}, ${this.sz.toString()})`;
  }
  static get parse(): Parser<Scale3d> {
    return Parser.sequence(
      Parser.string('scale3d('),
      Parser.sequence(
        numberOrPercentage,
        numberOrPercentage,
        numberOrPercentage,
      ).separatedBy(Parser.string(',').skip(Parser.whitespace.optional)),
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, [sx, sy, sz]]) => new Scale3d(sx, sy, sz));
  }
}

export class ScaleAxis extends TransformFunction {
  +s: number | Percentage;
  +axis: 'X' | 'Y' | 'Z';
  constructor(s: this['s'], axis: this['axis']) {
    super();
    this.s = s;
    this.axis = axis;
  }
  toString(): string {
    return `scale${this.axis}(${this.s.toString()})`;
  }
  static get parse(): Parser<ScaleAxis> {
    return Parser.sequence(
      Parser.sequence(
        Parser.string('scale'),
        Parser.oneOf<'X' | 'Y' | 'Z'>(
          Parser.string('X'),
          Parser.string('Y'),
          Parser.string('Z'),
        ),
        Parser.string('('),
      ).map(([_, axis, _1]) => axis),
      numberOrPercentage,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
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
  static get parse(): Parser<Skew> {
    const args = Parser.oneOf<Angle | [Angle, Angle]>(
      Parser.sequence(Angle.parse, Angle.parse).separatedBy(
        Parser.string(',').skip(Parser.whitespace.optional),
      ),
      Angle.parse,
    ).map((arg) => {
      if (Array.isArray(arg)) {
        return arg;
      }
      return [arg, null];
    });

    return Parser.sequence(Parser.string('skew('), args, Parser.string(')'))
      .separatedBy(Parser.whitespace.optional)
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
  static get parse(): Parser<SkewAxis> {
    return Parser.sequence(
      Parser.sequence(
        Parser.string('skew'),
        Parser.oneOf<'X' | 'Y'>(Parser.string('X'), Parser.string('Y')),
        Parser.string('('),
      ).map(([_, axis, _1]) => axis),
      Angle.parse,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
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
  static get parse(): Parser<Translate> {
    const oneArg = lengthPercentage;
    const twoArgs = Parser.sequence(
      lengthPercentage,
      lengthPercentage,
    ).separatedBy(Parser.string(',').skip(Parser.whitespace.optional));
    const args = Parser.oneOf<
      LengthPercentage | [LengthPercentage, LengthPercentage],
    >(twoArgs, oneArg).map((arg) => {
      if (Array.isArray(arg)) {
        return arg;
      }
      return [arg, null];
    });

    return Parser.sequence(
      Parser.string('translate('),
      args,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
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
  static get parse(): Parser<Translate3d> {
    return Parser.sequence(
      Parser.string('translate3d('),
      Parser.sequence(
        lengthPercentage,
        lengthPercentage,
        Length.parse,
      ).separatedBy(Parser.string(',').skip(Parser.whitespace.optional)),
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, [tx, ty, tz]]) => new Translate3d(tx, ty, tz));
  }
}

export class TranslateX extends TransformFunction {
  +tx: LengthPercentage;
  constructor(tx: LengthPercentage) {
    super();
    this.tx = tx;
  }
  toString(): string {
    return `translateX(${this.tx.toString()})`;
  }
  static get parse(): Parser<TranslateX> {
    return Parser.sequence(
      Parser.string('translateX('),
      lengthPercentage,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, tx]) => new TranslateX(tx));
  }
}

export class TranslateY extends TransformFunction {
  +ty: LengthPercentage;
  constructor(ty: LengthPercentage) {
    super();
    this.ty = ty;
  }
  toString(): string {
    return `translateY(${this.ty.toString()})`;
  }
  static get parse(): Parser<TranslateY> {
    return Parser.sequence(
      Parser.string('translateY('),
      lengthPercentage,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, ty]) => new TranslateY(ty));
  }
}

export class TranslateZ extends TransformFunction {
  +tz: Length;
  constructor(tz: Length) {
    super();
    this.tz = tz;
  }
  toString(): string {
    return `translateZ(${this.tz.toString()})`;
  }
  static get parse(): Parser<TranslateZ> {
    return Parser.sequence(
      Parser.string('translateZ('),
      Length.parse,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, tz]) => new TranslateZ(tz));
  }
}
