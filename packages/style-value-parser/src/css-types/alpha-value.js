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

export const alphaNumber: Parser<number> = Parser.float.where(
  (v) => v >= 0 && v <= 1,
);

export const alphaValue: Parser<number> = Parser.oneOf(
  Percentage.parse.map((v) => v.value / 100),
  alphaNumber,
);
