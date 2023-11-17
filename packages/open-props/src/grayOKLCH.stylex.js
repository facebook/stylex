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

type TGrayOKLCH = $ReadOnly<{
  grey0: string,
  grey1: string,
  grey2: string,
  grey3: string,
  grey4: string,
  grey5: string,
  grey6: string,
  grey7: string,
  grey8: string,
  grey9: string,
  grey10: string,
  grey11: string,
  grey12: string,
  grey13: string,
  grey14: string,
  grey15: string,
}>;

export const grayOKLCH: VarGroup<TGrayOKLCH> = defineVars({
  grey0: '99%',
  grey1: '95%',
  grey2: '88%',
  grey3: '80%',
  grey4: '74%',
  grey5: '68%',
  grey6: '63%',
  grey7: '58%',
  grey8: '53%',
  grey9: '49%',
  grey10: '43%',
  grey11: '37%',
  grey12: '31%',
  grey13: '25%',
  grey14: '18%',
  grey15: '10%',
});
