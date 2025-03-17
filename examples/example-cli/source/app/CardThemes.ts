/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as stylex from '@stylexjs/stylex';
import { tokens } from './CardTokens.stylex';

export const minorOffset = stylex.createTheme(tokens, {
  arrowTransform: 'translateX(5px)',
});

export const majorOffset = stylex.createTheme(tokens, {
  arrowTransform: 'translateX(10px)',
});

export const reset = stylex.createTheme(tokens, {});
