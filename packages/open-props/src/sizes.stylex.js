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

type TSizes = $ReadOnly<{
  spacing000: string,
  spacing00: string,
  spacing1: string,
  spacing2: string,
  spacing3: string,
  spacing4: string,
  spacing5: string,
  spacing6: string,
  spacing7: string,
  spacing8: string,
  spacing9: string,
  spacing10: string,
  spacing11: string,
  spacing12: string,
  spacing13: string,
  spacing14: string,
  spacing15: string,

  fluid1: string,
  fluid2: string,
  fluid3: string,
  fluid4: string,
  fluid5: string,
  fluid6: string,
  fluid7: string,
  fluid8: string,
  fluid9: string,
  fluid10: string,

  content1: string,
  content2: string,
  content3: string,

  header1: string,
  header2: string,
  header3: string,

  xxs: string,
  xs: string,
  sm: string,
  md: string,
  lg: string,
  xl: string,
  xxl: string,

  relative000: string,
  relative00: string,
  relative1: string,
  relative2: string,
  relative3: string,
  relative4: string,
  relative5: string,
  relative6: string,
  relative7: string,
  relative8: string,
  relative9: string,
  relative10: string,
  relative11: string,
  relative12: string,
  relative13: string,
  relative14: string,
  relative15: string,
}>;

export const sizes: VarGroup<TSizes> = defineVars({
  spacing000: '-.5rem',
  spacing00: '-.25rem',
  spacing1: '.25rem',
  spacing2: '.5rem',
  spacing3: '1rem',
  spacing4: '1.25rem',
  spacing5: '1.5rem',
  spacing6: '1.75rem',
  spacing7: '2rem',
  spacing8: '3rem',
  spacing9: '4rem',
  spacing10: '5rem',
  spacing11: '7.5rem',
  spacing12: '10rem',
  spacing13: '15rem',
  spacing14: '20rem',
  spacing15: '30rem',

  fluid1: 'clamp(.5rem, 1vw, 1rem)',
  fluid2: 'clamp(1rem, 2vw, 1.5rem)',
  fluid3: 'clamp(1.5rem, 3vw, 2rem)',
  fluid4: 'clamp(2rem, 4vw, 3rem)',
  fluid5: 'clamp(4rem, 5vw, 5rem)',
  fluid6: 'clamp(5rem, 7vw, 7.5rem)',
  fluid7: 'clamp(7.5rem, 10vw, 10rem)',
  fluid8: 'clamp(10rem, 20vw, 15rem)',
  fluid9: 'clamp(15rem, 30vw, 20rem)',
  fluid10: 'clamp(20rem, 40vw, 30rem)',

  content1: '20ch',
  content2: '45ch',
  content3: '60ch',

  header1: '20ch',
  header2: '25ch',
  header3: '35ch',

  xxs: '240px',
  xs: '360px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1440px',
  xxl: '1920px',

  relative000: '-.5ch',
  relative00: '-.25ch',
  relative1: '.25ch',
  relative2: '.5ch',
  relative3: '1ch',
  relative4: '1.25ch',
  relative5: '1.5ch',
  relative6: '1.75ch',
  relative7: '2ch',
  relative8: '3ch',
  relative9: '4ch',
  relative10: '5ch',
  relative11: '7.5ch',
  relative12: '10ch',
  relative13: '15ch',
  relative14: '20ch',
  relative15: '30ch',
});
