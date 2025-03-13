/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Theme } from '@stylexjs/stylex';

import { colors } from './colors.stylex';

import * as stylex from '@stylexjs/stylex';

const baseColorPalette = {
  neutralGray50: '#FAFAFA',
  neutralGray75: '#F4F4F4',
  neutralGray100: '#EEEEEE',
  neutralGray200: '#D8D8D8',
  neutralGray300: '#BDBDBD',
  neutralGray400: '#959393',
  neutralGray500: '#757778',
  neutralGray550: '#6A6C6C',
  neutralGray600: '#606263',
  neutralGray700: '#424445',
  neutralGray800: '#242626',
  neutralGray850: '#1D1F1F',
  neutralGray900: '#161717',
  neutralGray1000: '#0A0A0A',

  warmGray50: '#FBFAF9',
  warmGray75: '#F7F5F3',
  warmGray100: '#F1EEEB',
  warmGray200: '#DBD8D4',
  warmGray300: '#C2BDB8',
  warmGray400: '#9F9891',
  warmGray500: '#7C7771',
  warmGray600: '#66625D',
  warmGray700: '#474440',
  warmGray800: '#262524',
  warmGray900: '#171616',
  warmGray1000: '#0B0A0A',
  warmGray300Alpha15: 'rgba(194, 189, 184, 0.15)',

  green50: '#F2FDF0',
  green75: '#E7FCE3',
  green100: '#D9FDD3',
  green200: '#ACFCAC',
  green300: '#71EB85',
  green400: '#25D366',
  green450: '#21C063',
  green500: '#1DAA61',
  green600: '#1B8755',
  green700: '#15603E',
  green750: '#144D37',
  green800: '#103529',
  green500Alpha30: 'rgba(29, 170, 97, 0.3)',
  green500Alpha60: 'rgba(29, 170, 97, 0.6)',

  red50: '#FEEFF2',
  red75: '#FDE8EB',
  red100: '#FBD8DC',
  red200: '#FA99A4',
  red300: '#FB5061',
  red400: '#EA0038',
  red500: '#B80531',
  red600: '#911435',
  red700: '#61182E',
  red800: '#321622',
  red400Alpha30: 'rgba(234, 0, 56, 0.3)',

  orange50: '#FFF7F5',
  orange75: '#FFEBE6',
  orange100: '#FEE2D8',
  orange200: '#FDC1AD',
  orange300: '#FC9775',
  orange400: '#FA6533',
  orange500: '#C4532D',
  orange600: '#9A4529',
  orange700: '#6B3424',
  orange800: '#35221E',
  yellow50: '#FFFCF5',
  yellow75: '#FFF7E5',
  yellow100: '#FFF0D4',
  yellow200: '#FFE4AF',
  yellow300: '#FFD279',
  yellow400: '#FFB938',
  yellow500: '#C58730',
  yellow600: '#9D6C2C',
  yellow700: '#6D4E26',
  yellow800: '#362C1F',
  purple50: '#F7F5FF',
  purple75: '#EFEBFF',
  purple100: '#E8E0FF',
  purple200: '#D1C4FF',
  purple300: '#A791FF',
  purple400: '#7F66FF',
  purple500: '#5E47DE',
  purple600: '#4837AF',
  purple700: '#3A327B',
  purple800: '#242447',

  cobalt50: '#F2F8FF',
  cobalt75: '#E1F0FF',
  cobalt100: '#D2E8FE',
  cobalt200: '#99CAFE',
  cobalt300: '#53A6FD',
  cobalt400: '#007BFC',
  cobalt500: '#0063CB',
  cobalt600: '#0451A3',
  cobalt700: '#073D76',
  cobalt800: '#092642',

  skyBlue50: '#F2FAFE',
  skyBlue75: '#DEF3FC',
  skyBlue100: '#CAECFA',
  skyBlue200: '#93D7F5',
  skyBlue300: '#53BDEB',
  skyBlue400: '#009DE2',
  skyBlue500: '#027EB5',
  skyBlue600: '#046692',
  skyBlue700: '#074B6A',
  skyBlue800: '#092C3D',

  pink50: '#FFF5F8',
  pink75: '#FFEBF1',
  pink100: '#FFDAE7',
  pink200: '#FFABC7',
  pink300: '#FF72A1',
  pink400: '#FF2E74',
  pink500: '#D42A66',
  pink600: '#A32553',
  pink700: '#6D1E3E',
  pink800: '#36192A',

  emerald50: '#F0FFF9',
  emerald75: '#E1FEF2',
  emerald100: '#D5FDED',
  emerald200: '#B2F5DA',
  emerald300: '#7AE3C3',
  emerald400: '#06CF9C',
  emerald500: '#00A884',
  emerald600: '#008069',
  emerald700: '#125C4E',
  emerald800: '#0A332C',

  teal50: '#EDFAFA',
  teal75: '#DFF6F5',
  teal100: '#CBF2EE',
  teal200: '#95DBD4',
  teal300: '#42C7B8',
  teal400: '#02A698',
  teal500: '#028377',
  teal600: '#046A62',
  teal700: '#074D4A',
  teal800: '#092D2F',

  cream50: '#FAF8F5',
  cream75: '#F5F1EB',
  cream100: '#EFE9E0',
  cream150: '#EAE0D3',
  cream200: '#E5DBCD',
  cream300: '#D4C3AB',
  cream400: '#C1A886',
  cream500: '#9F8465',
  cream600: '#7B654C',
  cream700: '#504334',
  cream800: '#2C2720',

  brown50: '#FEF9F6',
  brown75: '#FCEDE3',
  brown100: '#F4DED1',
  brown200: '#E5C6B2',
  brown300: '#DBA685',
  brown400: '#C0835D',
  brown500: '#9E6947',
  brown600: '#855538',
  brown700: '#5B3C29',
  brown800: '#35271E',

  whiteAlpha05: 'rgba(255, 255, 255, 0.05)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
  whiteAlpha40: 'rgba(255, 255, 255, 0.4)',
  whiteAlpha50: 'rgba(255, 255, 255, 0.5)',
  whiteAlpha60: 'rgba(255, 255, 255, 0.6)',
  whiteAlpha70: 'rgba(255, 255, 255, 0.7)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  whiteOpaque: '#FFFFFF',

  blackAlpha05: 'rgba(0, 0, 0, 0.05)',
  blackAlpha10: 'rgba(0, 0, 0, 0.1)',
  blackAlpha20: 'rgba(0, 0, 0, 0.2)',
  blackAlpha30: 'rgba(0, 0, 0, 0.3)',
  blackAlpha40: 'rgba(0, 0, 0, 0.4)',
  blackAlpha50: 'rgba(0, 0, 0, 0.5)',
  blackAlpha60: 'rgba(0, 0, 0, 0.6)',
  blackAlpha70: 'rgba(0, 0, 0, 0.7)',
  blackAlpha80: 'rgba(0, 0, 0, 0.8)',
  blackAlpha90: 'rgba(0, 0, 0, 0.9)',
  blackOpaque: '#000000',

  transparent: 'transparent',
};

const DARK = '@media (prefers-color-scheme: dark)';

const systemTheme = {
  '--accent': {
    default: baseColorPalette.green500,
    [DARK]: baseColorPalette.green450,
  },
  '--accent-deemphasized': {
    default: baseColorPalette.green100,
    [DARK]: baseColorPalette.green800,
  },
  '--accent-emphasized': {
    default: baseColorPalette.green700,
    [DARK]: baseColorPalette.green100,
  },
  '--secondary-negative': {
    default: baseColorPalette.red400,
    [DARK]: baseColorPalette.red300,
  },
  '--secondary-negative-deemphasized': {
    default: baseColorPalette.red75,
    [DARK]: baseColorPalette.red800,
  },
  '--secondary-negative-emphasized': {
    default: baseColorPalette.red500,
    [DARK]: baseColorPalette.red200,
  },
  '--secondary-positive': {
    default: baseColorPalette.green500,
    [DARK]: baseColorPalette.green300,
  },
  '--secondary-positive-deemphasized': {
    default: baseColorPalette.green75,
    [DARK]: baseColorPalette.green800,
  },
  '--secondary-warning': {
    default: baseColorPalette.yellow400,
    [DARK]: baseColorPalette.yellow300,
  },
  '--secondary-warning-deemphasized': {
    default: baseColorPalette.yellow75,
    [DARK]: baseColorPalette.yellow800,
  },
  '--content-default': {
    default: baseColorPalette.neutralGray1000,
    [DARK]: baseColorPalette.neutralGray50,
  },
  '--content-deemphasized': {
    default: baseColorPalette.blackAlpha60,
    [DARK]: baseColorPalette.whiteAlpha60,
  },
  '--content-disabled': {
    default: baseColorPalette.neutralGray300,
    [DARK]: baseColorPalette.neutralGray700,
  },
  '--content-on-accent': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray1000,
  },
  '--content-action-default': {
    default: baseColorPalette.neutralGray1000,
    [DARK]: baseColorPalette.neutralGray50,
  },
  '--content-action-emphasized': {
    default: baseColorPalette.green600,
    [DARK]: baseColorPalette.green450,
  },
  '--content-external-link': {
    default: baseColorPalette.green600,
    [DARK]: baseColorPalette.green450,
  },
  '--content-inverse': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray1000,
  },
  '--content-read': {
    default: baseColorPalette.cobalt400,
    [DARK]: baseColorPalette.skyBlue300,
  },
  '--background-wash-plain': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray900,
  },
  '--background-wash-inset': {
    default: baseColorPalette.warmGray75,
    [DARK]: baseColorPalette.neutralGray900,
  },
  '--background-elevated-wash-plain': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--background-elevated-wash-inset': {
    default: baseColorPalette.warmGray75,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--background-dimmer': {
    default: 'rgb(0, 0, 0, 0.32)',
    [DARK]: 'rgb(0, 0, 0, 0.32)',
  },
  '--surface-default': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray900,
  },
  '--surface-emphasized': {
    default: baseColorPalette.warmGray75,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--surface-elevated-default': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--surface-elevated-emphasized': {
    default: baseColorPalette.warmGray75,
    [DARK]: baseColorPalette.neutralGray800,
  },
  '--surface-highlight': {
    default: baseColorPalette.warmGray300Alpha15,
    [DARK]: baseColorPalette.whiteAlpha10,
  },
  '--surface-inverse': {
    default: baseColorPalette.neutralGray800,
    [DARK]: baseColorPalette.neutralGray100,
  },
  '--surface-pressed': {
    default: baseColorPalette.blackAlpha20,
    [DARK]: baseColorPalette.whiteAlpha20,
  },
  '--lines-divider': {
    default: baseColorPalette.blackAlpha10,
    [DARK]: baseColorPalette.whiteAlpha10,
  },
  '--lines-outline-default': {
    default: baseColorPalette.neutralGray400,
    [DARK]: baseColorPalette.neutralGray500,
  },
  '--lines-outline-deemphasized': {
    default: baseColorPalette.blackAlpha20,
    [DARK]: baseColorPalette.whiteAlpha10,
  },
  '--persistent-always-branded': {
    default: baseColorPalette.green500,
    [DARK]: baseColorPalette.green450,
  },
  '--persistent-always-black': {
    default: baseColorPalette.neutralGray1000,
    [DARK]: baseColorPalette.neutralGray1000,
  },
  '--persistent-always-white': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.whiteOpaque,
  },
  '--persistent-activity-indicator': {
    default: baseColorPalette.green400,
    [DARK]: baseColorPalette.green400,
  },
  '--systems-bubble-surface-incoming': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--systems-bubble-surface-outgoing': {
    default: baseColorPalette.green100,
    [DARK]: baseColorPalette.green750,
  },
  '--systems-bubble-content-deemphasized': {
    default: baseColorPalette.blackAlpha60,
    [DARK]: baseColorPalette.whiteAlpha60,
  },
  '--systems-bubble-surface-overlay': {
    default: baseColorPalette.warmGray300Alpha15,
    [DARK]: baseColorPalette.blackAlpha20,
  },
  '--systems-bubble-surface-system': {
    default: baseColorPalette.whiteAlpha90,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--systems-bubble-surface-e2e': {
    default: baseColorPalette.yellow100,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--systems-bubble-content-e2e': {
    default: baseColorPalette.blackAlpha60,
    [DARK]: baseColorPalette.whiteAlpha60,
  },
  '--systems-bubble-surface-business': {
    default: baseColorPalette.emerald100,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--systems-bubble-content-business': {
    default: baseColorPalette.blackAlpha60,
    [DARK]: baseColorPalette.whiteAlpha60,
  },
  '--systems-chat-surface-composer': {
    default: baseColorPalette.whiteOpaque,
    [DARK]: baseColorPalette.neutralGray800,
  },
  '--systems-chat-background-wallpaper': {
    default: baseColorPalette.cream75,
    [DARK]: baseColorPalette.neutralGray900,
  },
  '--systems-chat-foreground-wallpaper': {
    default: baseColorPalette.cream150,
    [DARK]: baseColorPalette.whiteAlpha10,
  },
  '--systems-chat-surface-tray': {
    default: baseColorPalette.warmGray75,
    [DARK]: baseColorPalette.neutralGray900,
  },
  '--systems-status-seen': {
    default: baseColorPalette.warmGray300,
    [DARK]: baseColorPalette.neutralGray500,
  },
  '--internal-components-surface-nav-bar': {
    default: baseColorPalette.warmGray75,
    [DARK]: baseColorPalette.neutralGray850,
  },
  '--internal-components-active-list-row': {
    default: baseColorPalette.warmGray300Alpha15,
    [DARK]: baseColorPalette.whiteAlpha10,
  },
};

const lightTheme = Object.fromEntries(
  Object.entries(systemTheme)
    // $FlowFixMe
    .map((entry) => [entry[0], entry[1].default]),
);
const darkTheme = Object.fromEntries(
  Object.entries(systemTheme)
    // $FlowFixMe
    .map((entry) => [entry[0], entry[1][DARK]]),
);

export const WDSSystemTheme: Theme<typeof colors> = stylex.createTheme(
  colors,
  systemTheme,
);
export const WDSLightTheme: Theme<typeof colors> = stylex.createTheme(
  colors,
  // $FlowFixMe
  lightTheme,
);
export const WDSDarkTheme: Theme<typeof colors> = stylex.createTheme(
  colors,
  // $FlowFixMe
  darkTheme,
);
