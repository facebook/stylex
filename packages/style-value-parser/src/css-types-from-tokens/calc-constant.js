/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';

export type CalcConstant = 'pi' | 'e' | 'infinity' | '-infinity' | 'NaN';

export const calcConstant: TokenParser<CalcConstant> = TokenParser.oneOf(
  TokenParser.string('pi'),
  TokenParser.string('e'),
  TokenParser.string('infinity'),
  TokenParser.string('-infinity'),
  TokenParser.string('NaN'),
);
