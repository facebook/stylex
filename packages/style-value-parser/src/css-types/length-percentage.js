/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

import { Percentage } from './common-types';
import { Length } from './length';

export type LengthPercentage = Length | Percentage;
export const lengthPercentage: Parser<LengthPercentage> = Parser.oneOf(
  Percentage.parse,
  Length.parse,
);
