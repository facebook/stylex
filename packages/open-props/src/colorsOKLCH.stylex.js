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

type TColorsOKLCH = $ReadOnly<{
  color0: string,
  color1: string,
  color2: string,
  color3: string,
  color4: string,
  color5: string,
  color6: string,
  color7: string,
  color8: string,
  color9: string,
  color10: string,
  color11: string,
  color12: string,
  color13: string,
  color14: string,
  color15: string,
  bright: string,
}>;

export const colorsOKLCH: VarGroup<TColorsOKLCH> = defineVars({
  color0: '99% .03',
  color1: '95% .06',
  color2: '88% .12',
  color3: '80% .14',
  color4: '74% .16',
  color5: '68% .19',
  color6: '63% .20',
  color7: '58% .21',
  color8: '53% .20',
  color9: '49% .19',
  color10: '42% .17',
  color11: '35% .15',
  color12: '27% .12',
  color13: '20% .09',
  color14: '14% .07',
  color15: '11% .05',
  bright: '65% .3',
});
