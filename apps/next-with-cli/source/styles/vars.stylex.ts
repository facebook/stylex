/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

export const vars = stylex.defineVars({
  maxWidth: '1100px',
  borderRadius: '12px',
  fontMono: [
    'ui-monospace',
    'Menlo',
    'Monaco',
    '"Cascadia Mono"',
    '"Segoe UI Mono"',
    '"Roboto Mono"',
    '"Oxygen Mono"',
    '"Ubuntu Monospace"',
    '"Source Code Pro"',
    '"Fira Mono"',
    '"Droid Sans Mono"',
    '"Courier New"',
    'monospace',
  ].join(', '),
  foregroundRGB: {
    default: '0, 0, 0',
    [DARK]: '255, 255, 255',
  },
  backgroundStartRGB: {
    default: '214, 219, 220',
    [DARK]: '0, 0, 0',
  },
  backgroundEndRGB: {
    default: '255, 255, 255',
    [DARK]: '0, 0, 0',
  },
  primaryGlow: {
    default: `conic-gradient(${[
      'from 180deg at 50% 50%',
      '#16abff33 0deg',
      '#0885ff33 55deg',
      '#54d6ff33 120deg',
      '#0071ff33 160deg',
      'transparent 360deg',
    ].join(', ')})`,
    [DARK]: 'radial-gradient(rgba(1, 65, 255, 0.4), rgba(1, 65, 255, 0))',
  },
  secondaryGlow: {
    default: 'radial-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
    [DARK]: `linear-gradient(${[
      'to bottom right',
      'rgba(1, 65, 255, 0)',
      'rgba(1, 65, 255, 0)',
      'rgba(1, 65, 255, 0.3)',
    ].join(', ')})`,
  },
  tileStartRGB: {
    default: '239, 245, 249',
    [DARK]: '2, 13, 46',
  },
  tileEndRGB: {
    default: '228, 232, 233',
    [DARK]: '2, 5, 19',
  },
  tileBorder: {
    default: `conic-gradient(${[
      '#00000080',
      '#00000040',
      '#00000030',
      '#00000020',
      '#00000010',
      '#00000010',
      '#00000080',
    ].join(', ')})`,
    [DARK]: `conic-gradient(${[
      '#ffffff80',
      '#ffffff40',
      '#ffffff30',
      '#ffffff20',
      '#ffffff10',
      '#ffffff10',
      '#ffffff80',
    ].join(', ')})`,
  },
  calloutRGB: {
    default: '238, 240, 241',
    [DARK]: '20, 20, 20',
  },
  calloutBorderRGB: {
    default: '172, 175, 176',
    [DARK]: '108, 108, 108',
  },
  cardRGB: {
    default: '180, 185, 188',
    [DARK]: '100, 100, 100',
  },
  cardBorderRGB: {
    default: '131, 134, 135',
    [DARK]: '200, 200, 200',
  },
});

export const tokens = stylex.defineVars({
  arrowTransform: 'translateX(0)',
});
