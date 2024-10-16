/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { CustomIdentifier } from './custom-ident';

export class DashedIdentifier {
  +value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  static get parse(): Parser<DashedIdentifier> {
    return Parser.sequence(Parser.string('--'), CustomIdentifier.parse).map(
      ([dash, ident]) => new DashedIdentifier(dash + ident.value),
    );
  }
}
