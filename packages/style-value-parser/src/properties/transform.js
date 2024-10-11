/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { TransformFunction } from '../css-types/transform-function';

export class Transform {
  +value: $ReadOnlyArray<TransformFunction>;

  constructor(value: $ReadOnlyArray<TransformFunction>) {
    this.value = value;
  }

  toString(): string {
    return this.value.join(' ');
  }

  static get parse(): Parser<Transform> {
    return Parser.oneOrMore(TransformFunction.parse)
      .separatedBy(Parser.whitespace)
      .map((value) => new Transform(value));
  }
}
