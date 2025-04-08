/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: {
      default: 'inherit',
      ':hover': 'black',
    },
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    margin: 0,
    padding: 0,
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
    borderRadius: 4,
    display: 'flex',
    height: 254,
    justifyContent: 'center',
    minHeight: 100,
    overflow: 'hidden',
    position: 'relative',
    textAlign: 'center',
    width: '100%',
    '::placeholder': {
      color: 'gray',
    },
  },
  button: {
    color: {
      default: 'var(--blue-link)',
      ':hover': {
        default: null,
        '@media (hover: hover)': 'scale(1.1)',
      },
      ':active': 'scale(0.9)',
    },
  },
  linkUnderline: {
    backgroundColor: 'var(--primary-button-background)',
    borderTopEndRadius: 1,
    borderTopStartRadius: 1,
    bottom: 0,
    end: 2,
    height: 3,
    position: 'absolute',
    start: 2,
    transform: 'scaleY(0)',
    transformOrigin: 'center bottom',
    transitionDuration: 'var(--fds-fast)',
    transitionProperty: 'transform',
    transitionTimingFunction: 'var(--fds-soft)',
  },
  outerWithExpandedOnLargeScreensGlobalPanel: {
    insetInlineStart: {
      default: 'var(--global-panel-width-expanded)',
      '@media (max-width: 1200px)': 'var(--global-panel-width)',
    },
    width: {
      default: 'calc(100% - var(--global-panel-width-expanded))',
      '@media (max-width: 1200px)': 'calc(100% - var(--global-panel-width))',
    },
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
});
