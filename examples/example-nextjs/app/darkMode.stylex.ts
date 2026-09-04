/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as stylex from '@stylexjs/stylex';
import { globalTokens } from './globalTokens.stylex';

export const darkTheme = stylex.createTheme(globalTokens, {
  foregroundR: '255',
  foregroundG: '255',
  foregroundB: '255',

  bgStartRGB: 'rgb(0, 0, 0)',

  bgEndR: '0',
  bgEndG: '0',
  bgEndB: '0',

  calloutRGB: 'rgb(20, 20, 20)',
  calloutRGB50: 'rgba(20, 20, 20, 0.5)',

  calloutBorderR: '108',
  calloutBorderG: '108',
  calloutBorderB: '108',

  cardR: '100',
  cardG: '100',
  cardB: '100',

  cardBorderR: '200',
  cardBorderG: '200',
  cardBorderB: '200',

  primaryGlow: 'radial-gradient(rgba(1, 65, 255, 0.4), rgba(1, 65, 255, 0))',
  secondaryGlow: `linear-gradient(${[
    'to bottom right',
    'rgba(1, 65, 255, 0)',
    'rgba(1, 65, 255, 0)',
    'rgba(1, 65, 255, 0.3)',
  ].join(', ')})`,

  surfaceBg: '#0f1117',
  surfaceCard: '#1a1b26',
  surfaceCardShadow: '0 4px 24px rgba(0,0,0,0.3)',
  surfaceHover: 'rgba(255,255,255,0.04)',
});

export const lightTheme = stylex.createTheme(globalTokens, {
  foregroundR: '0',
  foregroundG: '0',
  foregroundB: '0',

  bgStartRGB: 'rgb(214, 219, 220)',

  bgEndR: '255',
  bgEndG: '255',
  bgEndB: '255',

  calloutRGB: 'rgb(238, 240, 241)',
  calloutRGB50: 'rgba(238, 240, 241, 0.5)',

  calloutBorderR: '172',
  calloutBorderG: '175',
  calloutBorderB: '176',

  cardR: '180',
  cardG: '185',
  cardB: '188',

  cardBorderR: '131',
  cardBorderG: '134',
  cardBorderB: '135',

  primaryGlow: `conic-gradient(${[
    'from 180deg at 50% 50%',
    '#16abff33 0deg',
    '#0885ff33 55deg',
    '#54d6ff33 120deg',
    '#0071ff33 160deg',
    'transparent 360deg',
  ].join(', ')})`,
  secondaryGlow:
    'radial-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',

  surfaceBg: '#fafafa',
  surfaceCard: 'white',
  surfaceCardShadow: '0 4px 24px rgba(0,0,0,0.06)',
  surfaceHover: 'rgba(0,0,0,0.02)',
});
