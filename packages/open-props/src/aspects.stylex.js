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

type TAspects = $ReadOnly<{
  ratioSquare: string,
  ratioLandscape: string,
  ratioPortrait: string,
  ratioWidescreen: string,
  ratioUltrawide: string,
  ratioGolden: string,
}>;

export const aspects: VarGroup<TAspects> = defineVars({
  ratioSquare: '1',
  ratioLandscape: '4/3',
  ratioPortrait: '3/4',
  ratioWidescreen: '16/9',
  ratioUltrawide: '18/5',
  ratioGolden: '1.6180/1',
});
