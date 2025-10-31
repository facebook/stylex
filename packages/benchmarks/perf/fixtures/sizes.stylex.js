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

const SpacingTokens = {
  border: {
    radius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      xLarge: '1rem',
    },
  },
  padding: {
    tiny: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xLarge: '2rem',
  },
  margin: {
    tiny: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xLarge: '2rem',
  },
  gap: {
    tiny: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
  },
  icon: {
    size: {
      small: '1rem',
      medium: '1.5rem',
      large: '2rem',
    },
  },
  button: {
    height: {
      small: '2rem',
      medium: '2.5rem',
      large: '3rem',
    },
  },
  input: {
    height: {
      small: '2rem',
      medium: '2.5rem',
      large: '3rem',
    },
  },
  container: {
    width: {
      small: '20rem',
      medium: '40rem',
      large: '60rem',
    },
  },
};

export const spacing = stylex.defineConsts(SpacingTokens);
