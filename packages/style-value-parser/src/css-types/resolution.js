/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';
import type { TokenDimension } from '@csstools/css-tokenizer';
import { TokenType } from '@csstools/css-tokenizer';

type Unit = 'dpi' | 'dpcm' | 'dppx';

export class Resolution {
  +value: number;
  +unit: Unit;
  constructor(value: number, unit: Unit) {
    this.value = value;
    this.unit = unit;
  }
  toString(): string {
    return `${this.value}${this.unit}`;
  }
  static UNITS: $ReadOnlyArray<Unit> = ['dpi', 'dpcm', 'dppx'];
  static get parser(): TokenParser<Resolution> {
    return TokenParser.token<TokenDimension>(TokenType.Dimension)
      .where(
        (v: TokenDimension): implies v is TokenDimension =>
          v[4].unit === 'dpi' || v[4].unit === 'dpcm' || v[4].unit === 'dppx',
      )
      .map((v) => new Resolution(v[4].value, v[4].unit as $FlowFixMe as Unit));
  }
}
