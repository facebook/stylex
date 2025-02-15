/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';

export class Frequency {
  +value: number;
  +unit: 'Hz' | 'KHz';
  constructor(value: number, unit: 'Hz' | 'KHz') {
    this.value = value;
    this.unit = unit;
  }
  toString(): string {
    // Always use the shortest representation
    if (this.unit === 'Hz') {
      return `${this.value / 1000}KHz`;
    }
    return `${this.value}${this.unit}`;
  }
  static UNITS: $ReadOnlyArray<'Hz' | 'KHz'> = ['Hz', 'KHz'];
  static get parse(): TokenParser<Frequency> {
    return TokenParser.tokens.Dimension.map((val) =>
      val[4].unit === 'Hz' || val[4].unit === 'KHz'
        ? [val[4].value, val[4].unit]
        : null,
    )
      .where((v) => v !== null)
      .map(([value, unit]) => new Frequency(value, unit));
  }
}
