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

export class Time {
  +value: number;
  +unit: 's' | 'ms';
  constructor(value: number, unit: 's' | 'ms') {
    this.value = value;
    this.unit = unit;
  }
  toString(): string {
    // Always use the shortest representation
    if (this.unit === 'ms') {
      if(this.value <= 99) {
        return `${this.value}ms`
      }
      return `${this.value / 1000}s`;
    }
    return `${this.value}${this.unit}`;
  }
  static parse: Parser<Time> = Parser.sequence(
    number,
    Parser.oneOf(Parser.string('s'), Parser.string('ms')),
  ).map(([value, unit]) => new Time(value, unit));
}
