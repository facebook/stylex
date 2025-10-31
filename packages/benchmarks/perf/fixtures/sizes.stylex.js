/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';

const SemanticSizes = {
  borderRadiusSmall: '0.25rem',
  borderRadiusMedium: '0.5rem',
  borderRadiusLarge: '0.75rem',
  borderRadiusXLarge: '1rem',
  paddingTiny: '0.25rem',
  paddingSmall: '0.5rem',
  paddingMedium: '1rem',
  paddingLarge: '1.5rem',
  paddingXLarge: '2rem',
  marginTiny: '0.25rem',
  marginSmall: '0.5rem',
  marginMedium: '1rem',
  marginLarge: '1.5rem',
  marginXLarge: '2rem',
  gapTiny: '0.25rem',
  gapSmall: '0.5rem',
  gapMedium: '1rem',
  gapLarge: '1.5rem',
  iconSizeSmall: '1rem',
  iconSizeMedium: '1.5rem',
  iconSizeLarge: '2rem',
  buttonHeightSmall: '2rem',
  buttonHeightMedium: '2.5rem',
  buttonHeightLarge: '3rem',
  inputHeightSmall: '2rem',
  inputHeightMedium: '2.5rem',
  inputHeightLarge: '3rem',
  containerWidthSmall: '20rem',
  containerWidthMedium: '40rem',
  containerWidthLarge: '60rem',
};

export const sizes = stylex.defineConsts(SemanticSizes);
