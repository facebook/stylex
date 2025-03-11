/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Percentage } from './common-types';
import { Parser } from '../core';

export const alphaNumber: Parser<number> = Parser.float.where(
  (v) => v >= 0 && v <= 1,
);

export class AlphaValue {
  +value: number;
  constructor(value: number) {
    this.value = value;
  }
  toString(): string {
    return this.value.toString();
  }

  static get parse(): Parser<AlphaValue> {
    return Parser.oneOf(
      Percentage.parse.map((v) => v.value / 100),
      alphaNumber,
    ).map((v) => new AlphaValue(v));
  }
}
