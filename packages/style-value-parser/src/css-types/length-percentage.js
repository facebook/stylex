/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';
import { Length } from './length';
import { Percentage } from './common-types';

export type LengthPercentage = Length | Percentage;

export const lengthPercentage: TokenParser<LengthPercentage> =
  TokenParser.oneOf(Percentage.parser, Length.parser);
