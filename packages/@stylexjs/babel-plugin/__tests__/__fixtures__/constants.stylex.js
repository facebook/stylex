/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// constants.stylex.js
import * as stylex from '@stylexjs/stylex';

export const breakpoints = stylex.defineConsts({
  small: '@media (max-width: 600px)',
  medium: '@media (min-width: 601px) and (max-width: 1024px)',
  large: '@media (max-width: 1025px)',
});

export const colors = stylex.defineConsts({
  accent: 'hotpink',
  background: 'white',
  foreground: 'black',
});

export const nestedTokens = stylex.defineConsts({
  button: {
    fill: {
      primary: 'blue',
    },
  },
});
