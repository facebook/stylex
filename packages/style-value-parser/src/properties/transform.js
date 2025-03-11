/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';
import { TransformFunction } from '../css-types-from-tokens/transform-function';

export class Transform {
  +value: $ReadOnlyArray<TransformFunction>;

  constructor(value: $ReadOnlyArray<TransformFunction>) {
    this.value = value;
  }

  toString(): string {
    return this.value.join(' ');
  }

  static get parse(): TokenParser<Transform> {
    return TokenParser.oneOrMore(TransformFunction.parser)
      .separatedBy(TokenParser.tokens.Whitespace)
      .map((value) => new Transform(value));
  }
}
