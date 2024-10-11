/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

type Unit = 'dpi' | 'dpcm' | 'dppx';
export class Resolution {
  +value: number;
  +unit: Unit;
  constructor(value: number, unit: Unit) {
    this.value = value;
    this.unit = unit;
  }
  toString(): string {
    return `${this.value}${this.unit}`;
  }
  static get parse(): Parser<Resolution> {
    return Parser.oneOf(Dpi.parse, Dpcm.parse, Dppx.parse);
  }
}

export class Dpi extends Resolution {
  +unit: Unit = 'dpi';
  static parse: Parser<Dpi> = Parser.float
    .skip(Parser.string('dpi'))
    .map((v) => new Dpi(v, 'dpi'));
}

export class Dpcm extends Resolution {
  +unit: Unit = 'dpcm';
  static parse: Parser<Dpcm> = Parser.float
    .skip(Parser.string('dpcm'))
    .map((v) => new Dpcm(v, 'dpcm'));
}

export class Dppx extends Resolution {
  +unit: Unit = 'dppx';
  static parse: Parser<Dppx> = Parser.float
    .skip(Parser.oneOf(Parser.string('dppx'), Parser.string('x')))
    .map((v) => new Dppx(v, 'dppx'));
}
