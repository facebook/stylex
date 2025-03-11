/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

import { Angle } from './angle';
import { Percentage } from './common-types';

export const anglePercentage: Parser<Angle | Percentage> = Parser.oneOf(
  Angle.parse,
  Percentage.parse,
);
