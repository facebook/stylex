/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';
import { Frequency } from './frequency';
import { Length } from './length';
import { Resolution } from './resolution';
import { Time } from './time';

function arrIncludes<T>(arr: $ReadOnlyArray<T>, val: mixed): implies val is T {
  // $FlowFixMe[incompatible-type-guard] - Needed until fix lands in Flow
  return arr.includes(val);
}

export type Dimension = Length | Time | Resolution | Frequency;
export const dimension: TokenParser<Dimension> =
  TokenParser.tokens.Dimension.map((token): ?Dimension => {
    const { unit, value } = token[4];

    if (arrIncludes(Length.UNITS, unit)) {
      return new Length(value, unit);
    } else if (arrIncludes(Time.UNITS, unit)) {
      return new Time(value, unit);
    } else if (arrIncludes(Resolution.UNITS, unit)) {
      return new Resolution(value, unit);
    } else if (arrIncludes(Frequency.UNITS, unit)) {
      return new Frequency(value, unit);
    } else {
      null;
    }
  }).where((val) => val != null);
