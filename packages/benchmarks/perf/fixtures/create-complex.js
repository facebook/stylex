/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';
import { sizes, spacing } from './sizes.stylex';

export const styles = stylex.create({
  root: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: sizes.borderRadiusMedium,
    color: {
      default: 'inherit',
      ':hover': 'black',
    },
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    gap: sizes.gapSmall,
    lineHeight: 'inherit',
    margin: sizes.marginTiny,
    padding: sizes.paddingTiny,
    textAlign: 'inherit',
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
    transform: {
      default: null,
      ':active': 'scale(0.98)',
    },
    transition: {
      default: null,
      ':active': 'none',
    },
  },
  wrapper: {
    alignItems: 'center',
    borderRadius: sizes.borderRadiusLarge,
    display: 'flex',
    gap: sizes.gapMedium,
    height: 254,
    justifyContent: 'center',
    margin: sizes.marginSmall,
    minHeight: 100,
    overflow: 'hidden',
    padding: sizes.paddingMedium,
    paddingBlock: sizes.paddingLarge,
    paddingInline: sizes.paddingSmall,
    position: 'relative',
    textAlign: 'center',
    width: '100%',
    '::placeholder': {
      color: 'gray',
    },
  },
  button: {
    borderRadius: sizes.borderRadiusMedium,
    color: {
      default: 'var(--blue-link)',
      ':hover': {
        default: null,
        '@media (hover: hover)': 'scale(1.1)',
      },
      ':active': 'scale(0.9)',
    },
    height: sizes.buttonHeightMedium,
    padding: sizes.paddingSmall,
    paddingBlock: sizes.paddingTiny,
    paddingInline: sizes.paddingMedium,
  },
  buttonSmall: {
    borderRadius: sizes.borderRadiusSmall,
    height: sizes.buttonHeightSmall,
    margin: sizes.marginTiny,
    padding: sizes.paddingTiny,
    paddingBlock: sizes.paddingTiny,
    paddingInline: sizes.paddingSmall,
  },
  buttonLarge: {
    borderRadius: sizes.borderRadiusLarge,
    height: sizes.buttonHeightLarge,
    margin: sizes.marginSmall,
    padding: sizes.paddingLarge,
    paddingBlock: sizes.paddingMedium,
    paddingInline: sizes.paddingLarge,
  },
  linkUnderline: {
    backgroundColor: 'var(--primary-button-background)',
    borderTopEndRadius: sizes.borderRadiusSmall,
    borderTopStartRadius: sizes.borderRadiusSmall,
    bottom: 0,
    end: sizes.paddingSmall,
    height: 3,
    margin: sizes.marginTiny,
    padding: sizes.paddingTiny,
    position: 'absolute',
    start: sizes.paddingSmall,
    transform: 'scaleY(0)',
    transformOrigin: 'center bottom',
    transitionDuration: 'var(--fds-fast)',
    transitionProperty: 'transform',
    transitionTimingFunction: 'var(--fds-soft)',
  },
  outerWithExpandedOnLargeScreensGlobalPanel: {
    borderRadius: sizes.borderRadiusMedium,
    gap: sizes.gapSmall,
    insetInlineStart: {
      default: 'var(--global-panel-width-expanded)',
      '@media (max-width: 1200px)': 'var(--global-panel-width)',
    },
    margin: sizes.marginMedium,
    padding: sizes.paddingMedium,
    width: {
      default: 'calc(100% - var(--global-panel-width-expanded))',
      '@media (max-width: 1200px)': 'calc(100% - var(--global-panel-width))',
    },
  },
  panel: {
    borderRadius: spacing.border.radius.large,
    gap: spacing.gap.medium,
    margin: spacing.margin.large,
    padding: spacing.padding.large,
    paddingBlock: spacing.padding.medium,
    paddingInline: spacing.padding.large,
  },
  panelHeader: {
    borderRadius: spacing.border.radius.medium,
    gap: spacing.gap.small,
    margin: spacing.margin.small,
    marginBlockEnd: spacing.margin.medium,
    padding: spacing.padding.medium,
  },
  panelBody: {
    borderRadius: spacing.border.radius.medium,
    gap: spacing.gap.medium,
    margin: spacing.margin.small,
    padding: spacing.padding.medium,
  },
  panelFooter: {
    borderRadius: spacing.border.radius.medium,
    gap: spacing.gap.small,
    margin: spacing.margin.small,
    marginBlockStart: spacing.margin.medium,
    padding: spacing.padding.medium,
  },
  dynamicHeight: (height) => ({ height }),
  dynamicPadding: (paddingTop, paddingBottom) => ({
    paddingTop,
    paddingBottom,
  }),
  dynamicTextColor: (textColor) => ({ color: textColor }),
  dynamicFontSize: (fontSize) => ({ fontSize }),
  dynamicFontWeight: (fontWeight) => ({ fontWeight }),
  dynamicLineHeight: (lineHeight) => ({ lineHeight }),
  dynamicLetterSpacing: (letterSpacing) => ({ letterSpacing }),
  dynamicTextTransform: (textTransform) => ({ textTransform }),
  dynamicTextDecoration: (textDecoration) => ({ textDecoration }),
  dynamicBorderRadius: (borderRadius) => ({ borderRadius }),
  dynamicMargin: (margin) => ({ margin }),
  dynamicGap: (gap) => ({ gap }),
});
