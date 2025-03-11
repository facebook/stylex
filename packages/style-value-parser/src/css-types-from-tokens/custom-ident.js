/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';

export class CustomIdentifier {
  +value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }

  static get parser(): TokenParser<CustomIdentifier> {
    return TokenParser.tokens.Ident.map((token): string => token[4].value)
      .where(
        (str: string): implies str is string =>
          !reservedKeywords.includes(str.toLowerCase()),
      )
      .map((value: string): CustomIdentifier => new CustomIdentifier(value));
  }
}

const reservedKeywords = [
  'unset',
  'initial',
  'inherit',
  'default',
  'none',
  'auto',
  'normal',
  'hidden',
  'visible',
  'revert',
  'revert-layer',
];
