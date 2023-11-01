/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarGroup } from '@stylexjs/stylex/lib/StyleXTypes';

import { defineVars } from '@stylexjs/stylex';

type TColorsOKLCHHues = $ReadOnly<{
  red: string,
  pink: string,
  purple: string,
  violet: string,
  indigo: string,
  blue: string,
  cyan: string,
  teal: string,
  green: string,
  lime: string,
  yellow: string,
  orange: string,
}>;

export const colorsOKLCHHues: VarGroup<TColorsOKLCHHues> = defineVars({
  red: '25',
  pink: '350',
  purple: '310',
  violet: '290',
  indigo: '270',
  blue: '240',
  cyan: '210',
  teal: '185',
  green: '145',
  lime: '125',
  yellow: '100',
  orange: '75',
});
