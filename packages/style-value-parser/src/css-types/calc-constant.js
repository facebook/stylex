/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

export type CalcConstant = 'pi' | 'e' | 'infinity' | '-infinity' | 'NaN';

export const calcConstant: Parser<CalcConstant> = Parser.oneOf(
  Parser.string('pi'),
  Parser.string('e'),
  Parser.string('infinity'),
  Parser.string('-infinity'),
  Parser.string('NaN'),
);
