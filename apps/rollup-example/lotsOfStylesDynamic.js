/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import * as stylex from '@stylexjs/stylex';

export const lotsOfStylesDynamic = [
  stylex.create({
    // Dynamic styles
    dynamicHeight: (height) => ({
      height,
    }),
    dynamicPadding: (paddingTop, paddingBottom) => ({
      paddingTop,
      paddingBottom,
    }),
    dynamicTextColor: (textColor) => ({
      color: textColor,
    }),
  }),
  stylex.create({
    // Mixed dynamic and regular styles
    dynamicHeightWithStatic: (height) => ({
      height,
      backgroundColor: 'var(--background-color)',
    }),
    dynamicPaddingWithStatic: (paddingTop, paddingBottom) => ({
      paddingTop,
      paddingBottom,
      margin: '8px',
    }),
    dynamicTextColorWithStatic: (textColor) => ({
      color: textColor,
      fontSize: '16px',
    }),
  }),
];
