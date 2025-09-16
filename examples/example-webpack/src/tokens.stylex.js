/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

export const colors = stylex.defineVars({
  textPrimary: { default: '#000', [DARK]: '#fff' },
  white: { default: '#fff', [DARK]: '#fff' },
  fg1: { default: 'hsl(0, 0%, 0%)', [DARK]: 'hsl(0, 0%, 100%)' },
  bg1: { default: 'hsl(276, 17%, 96%)', [DARK]: 'hsl(276, 17%, 96%)' },
  pinkH: 295,
  pinkS: '62%',
  pinkL: '60%',
  cyanH: 202,
  cyanS: '100%',
  cyanL: '50%',
});
