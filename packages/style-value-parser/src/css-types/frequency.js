/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { number } from './number';

export class Frequency {
  +value: number;
  +unit: 'Hz' | 'KHz';
  constructor(value: number, unit: 'Hz' | 'KHz') {
    this.value = value;
    this.unit = unit;
  }
  toString(): string {
    // Always use the shortest representation
    if (this.unit === 'KHz') {
      return `${this.value / 1000}s`;
    }
    return `${this.value}${this.unit}`;
  }
  static parse: Parser<Frequency> = Parser.sequence(
    number,
    Parser.oneOf(Parser.string<'Hz'>('Hz'), Parser.string<'KHz'>('KHz')),
  ).map(([value, unit]) => new Frequency(value, unit));
}
