/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  pink7: '#d6336c',
  blue9: '#1864ab',
  gray0: '#f8f9fa',
});

export const fonts = stylex.defineVars({
  mono: 'Dank Mono,Operator Mono,Inconsolata,Fira Mono,ui-monospace,SF Mono,Monaco,Droid Sans Mono,Source Code Pro,monospace',
});

export const sizes = stylex.defineVars({
  spacing5: '1.5rem',
  spacing2: '.5rem',
});
