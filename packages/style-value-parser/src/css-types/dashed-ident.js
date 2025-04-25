/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';

export class DashedIdentifier {
  +value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  static get parser(): TokenParser<DashedIdentifier> {
    return TokenParser.tokens.Ident.map((token): string => token[4].value)
      .where(
        (str: string): implies str is string =>
          str.startsWith('--') && str.length > 2,
      )
      .map((value: string): DashedIdentifier => new DashedIdentifier(value));
  }
}
