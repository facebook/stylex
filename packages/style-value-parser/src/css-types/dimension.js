/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { Frequency } from './frequency';
import { Length } from './length';
import { Resolution } from './resolution';
import { Time } from './time';

export type Dimension = Length | Time | Frequency | Resolution;
export const dimension: Parser<Dimension> = Parser.oneOf(
  Length.parse,
  Time.parse,
  Frequency.parse,
  Resolution.parse,
);
