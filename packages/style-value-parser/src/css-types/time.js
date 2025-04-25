/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';

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
      return `${this.value / 1000}s`;
    }
    return `${this.value}${this.unit}`;
  }
  static UNITS: $ReadOnlyArray<'s' | 'ms'> = ['s', 'ms'];
  static get parser(): TokenParser<Time> {
    return TokenParser.tokens.Dimension.map((v) =>
      v[4].unit === 's' || v[4].unit === 'ms' ? [v[4].value, v[4].unit] : null,
    )
      .where((v) => v != null)
      .map(([v, unit]) => new Time(v, unit));
  }
}
