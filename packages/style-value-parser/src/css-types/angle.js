/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

export class Angle {
  +value: number;
  +unit: string = '';
  constructor(value: number) {
    this.value = value;
  }
  toString(): string {
    return `${this.value}${this.unit}`;
  }
  static get parse(): Parser<Angle> {
    return Parser.oneOf(
      Deg.parse,
      Grad.parse,
      Rad.parse,
      Turn.parse,
      Parser.string('0').map(() => new Angle(0)),
    );
  }
}

export class Deg extends Angle {
  +unit: string = 'deg';
  static parse: Parser<Deg> = Parser.float
    .skip(Parser.string('deg'))
    .map((v) => new Deg(v));
}

export class Grad extends Angle {
  +unit: string = 'grad';
  static parse: Parser<Grad> = Parser.float
    .skip(Parser.string('grad'))
    .map((v) => new Grad(v));
}

export class Rad extends Angle {
  +unit: string = 'rad';
  static parse: Parser<Rad> = Parser.float
    .skip(Parser.string('rad'))
    .map((v) => new Rad(v));
}

export class Turn extends Angle {
  +unit: string = 'turn';
  static parse: Parser<Turn> = Parser.float
    .skip(Parser.string('turn'))
    .map((v) => new Turn(v));
}
