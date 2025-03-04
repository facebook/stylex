/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

// e.g. 1fr
export class Flex {
  +fraction: number;
  constructor(fraction: number) {
    this.fraction = fraction;
  }
  toString(): string {
    return `${this.fraction}fr`;
  }
  static get parse(): Parser<Flex> {
    return Parser.sequence(
      Parser.float.where((num) => num >= 0),
      Parser.string('fr'),
    ).map(([fraction, _unit]) => new Flex(fraction));
  }
}
