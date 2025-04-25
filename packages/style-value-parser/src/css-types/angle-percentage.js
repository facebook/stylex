/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';

import { Angle } from './angle';
import { Percentage } from './common-types';

export const anglePercentage: TokenParser<Angle | Percentage> =
  TokenParser.oneOf(Angle.parser, Percentage.parser);
