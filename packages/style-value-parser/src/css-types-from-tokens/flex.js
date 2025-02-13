/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';

// e.g. 1fr
export class Flex {
  +fraction: number;
  constructor(fraction: number) {
    this.fraction = fraction;
  }
  toString(): string {
    return `${this.fraction}fr`;
  }
  static get parse(): TokenParser<Flex> {
    return TokenParser.tokens.Dimension.map((dim) =>
      dim[4].unit === 'fr' && dim[4].signCharacter !== '-'
        ? dim[4].value
        : null,
    )
      .where((val) => val != null)
      .map((value) => new Flex(value));
  }
}
