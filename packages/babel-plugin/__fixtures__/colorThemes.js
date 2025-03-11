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

const colorsLight = {
  accent: baseColorPalette.green500,
  accentDeemphasized: baseColorPalette.green100,
  accentEmphasized: baseColorPalette.green700,

  secondaryNegative: baseColorPalette.red400,
  secondaryNegativeDeemphasized: baseColorPalette.red75,
  secondaryNegativeEmphasized: baseColorPalette.red500,
  secondaryPositive: baseColorPalette.green500,
  secondaryPositiveDeemphasized: baseColorPalette.green75,
  secondaryWarning: baseColorPalette.yellow400,
  secondaryWarningDeemphasized: baseColorPalette.yellow75,

  contentDefault: baseColorPalette.neutralGray1000,
  contentDeemphasized: baseColorPalette.blackAlpha60,
  contentDisabled: baseColorPalette.neutralGray300,
  contentOnAccent: baseColorPalette.whiteOpaque,
  contentActionDefault: baseColorPalette.neutralGray1000, // contentDefault
  contentActionEmphasized: baseColorPalette.green600,
  contentExternalLink: baseColorPalette.green600,
  contentInverse: baseColorPalette.whiteOpaque,
  contentRead: baseColorPalette.cobalt400,

  backgroundWashPlain: baseColorPalette.whiteOpaque,
  backgroundWashInset: baseColorPalette.warmGray75,
  backgroundElevatedWashPlain: baseColorPalette.whiteOpaque,
  backgroundElevatedWashInset: baseColorPalette.warmGray75,
  backgroundDimmer: 'rgb(0, 0, 0, 0.32)',

  surfaceDefault: baseColorPalette.whiteOpaque,
  surfaceEmphasized: baseColorPalette.warmGray75,
  surfaceElevatedDefault: baseColorPalette.whiteOpaque,
  surfaceElevatedEmphasized: baseColorPalette.warmGray75,
  surfaceHighlight: baseColorPalette.warmGray300Alpha15,
  surfaceInverse: baseColorPalette.neutralGray800,
  surfacePressed: baseColorPalette.blackAlpha20,

  linesDivider: baseColorPalette.blackAlpha10,
  linesOutlineDefault: baseColorPalette.neutralGray400,
  linesOutlineDeemphasized: baseColorPalette.blackAlpha20,

  persistentAlwaysBranded: baseColorPalette.green500,
  persistentAlwaysBlack: baseColorPalette.neutralGray1000,
  persistentAlwaysWhite: baseColorPalette.whiteOpaque,
  persistentActivityIndicator: baseColorPalette.green400,

  productSystemsBubbleSurfaceIncoming: baseColorPalette.whiteOpaque, // surfaceElevatedDefault
  productSystemsBubbleSurfaceOutgoing: baseColorPalette.green100,
  productSystemsBubbleContentDeemphasized: baseColorPalette.blackAlpha60, // contentDeemphasized
  productSystemsBubbleSurfaceOverlay: baseColorPalette.warmGray300Alpha15,
  productSystemsBubbleSurfaceSystem: baseColorPalette.whiteAlpha90,
  productSystemsBubbleSurfaceE2E: baseColorPalette.yellow100,
  productSystemsBubbleContentE2E: baseColorPalette.blackAlpha60, // contentDeemphasized
  productSystemsBubbleSurfaceBusiness: baseColorPalette.emerald100,
  productSystemsBubbleContentBusiness: baseColorPalette.blackAlpha60, // contentDeemphasized
  productSystemsChatSurfaceComposer: baseColorPalette.whiteOpaque, // surfaceElevatedDefault
  productSystemsChatBackgroundWallpaper: baseColorPalette.cream75,
  productSystemsChatForegroundWallpaper: baseColorPalette.cream150,
  productSystemsChatSurfaceTray: baseColorPalette.warmGray75, // surfaceEmphasized
  productSystemsStatusSeen: baseColorPalette.warmGray300,

  internalComponentsSurfaceNavBar: baseColorPalette.warmGray75, // surfaceEmphasized
  internalComponentsActiveListRow: baseColorPalette.warmGray300Alpha15, // surfaceHighlight
};

const colorsDark = {
  accent: baseColorPalette.green450,
  accentDeemphasized: baseColorPalette.green800,
  accentEmphasized: baseColorPalette.green100,

  secondaryNegative: baseColorPalette.red300,
  secondaryNegativeDeemphasized: baseColorPalette.red800,
  secondaryNegativeEmphasized: baseColorPalette.red200,
  secondaryPositive: baseColorPalette.green300,
  secondaryPositiveDeemphasized: baseColorPalette.green800,
  secondaryWarning: baseColorPalette.yellow300,
  secondaryWarningDeemphasized: baseColorPalette.yellow800,

  contentDefault: baseColorPalette.neutralGray50,
  contentDeemphasized: baseColorPalette.whiteAlpha60,
  contentDisabled: baseColorPalette.neutralGray700,
  contentOnAccent: baseColorPalette.neutralGray1000,
  contentActionDefault: baseColorPalette.neutralGray50, // contentDefault
  contentActionEmphasized: baseColorPalette.green450,
  contentExternalLink: baseColorPalette.green450,
  contentInverse: baseColorPalette.neutralGray1000,
  contentRead: baseColorPalette.skyBlue300,

  backgroundWashPlain: baseColorPalette.neutralGray900,
  backgroundWashInset: baseColorPalette.neutralGray900,
  backgroundElevatedWashPlain: baseColorPalette.neutralGray850,
  backgroundElevatedWashInset: baseColorPalette.neutralGray850,
  backgroundDimmer: 'rgb(0, 0, 0, 0.32)',

  surfaceDefault: baseColorPalette.neutralGray900,
  surfaceEmphasized: baseColorPalette.neutralGray850,
  surfaceElevatedDefault: baseColorPalette.neutralGray850,
  surfaceElevatedEmphasized: baseColorPalette.neutralGray800,
  surfaceHighlight: baseColorPalette.whiteAlpha10,
  surfaceInverse: baseColorPalette.neutralGray100,
  surfacePressed: baseColorPalette.whiteAlpha20,

  linesDivider: baseColorPalette.whiteAlpha10,
  linesOutlineDefault: baseColorPalette.neutralGray500,
  linesOutlineDeemphasized: baseColorPalette.whiteAlpha10,

  persistentAlwaysBranded: baseColorPalette.green450,
  persistentAlwaysBlack: baseColorPalette.neutralGray1000,
  persistentAlwaysWhite: baseColorPalette.whiteOpaque,
  persistentActivityIndicator: baseColorPalette.green400,

  productSystemsBubbleSurfaceIncoming: baseColorPalette.neutralGray850,
  productSystemsBubbleSurfaceOutgoing: baseColorPalette.green750,
  productSystemsBubbleContentDeemphasized: baseColorPalette.whiteAlpha60,
  productSystemsBubbleSurfaceOverlay: baseColorPalette.blackAlpha20,
  productSystemsBubbleSurfaceSystem: baseColorPalette.neutralGray850,
  productSystemsBubbleSurfaceE2E: baseColorPalette.neutralGray850,
  productSystemsBubbleContentE2E: baseColorPalette.yellow300,
  productSystemsBubbleSurfaceBusiness: baseColorPalette.neutralGray850,
  productSystemsBubbleContentBusiness: baseColorPalette.emerald400,
  productSystemsChatSurfaceComposer: baseColorPalette.neutralGray800,
  productSystemsChatBackgroundWallpaper: baseColorPalette.neutralGray900,
  productSystemsChatForegroundWallpaper: baseColorPalette.whiteAlpha10,
  productSystemsChatSurfaceTray: baseColorPalette.neutralGray900,
  productSystemsStatusSeen: baseColorPalette.neutralGray500,

  internalComponentsSurfaceNavBar: baseColorPalette.neutralGray850,
  internalComponentsActiveListRow: baseColorPalette.whiteAlpha10,
};

const DARK = '@media (prefers-color-scheme: dark)';

const systemTheme = {
  '--accent': {
    default: colorsLight.accent,
    [DARK]: colorsDark.accent,
  },
  '--accent-deemphasized': {
    default: colorsLight.accentDeemphasized,
    [DARK]: colorsDark.accentDeemphasized,
  },
  '--accent-emphasized': {
    default: colorsLight.accentEmphasized,
    [DARK]: colorsDark.accentEmphasized,
  },
  '--secondary-negative': {
    default: colorsLight.secondaryNegative,
    [DARK]: colorsDark.secondaryNegative,
  },
  '--secondary-negative-deemphasized': {
    default: colorsLight.secondaryNegativeDeemphasized,
    [DARK]: colorsDark.secondaryNegativeDeemphasized,
  },
  '--secondary-negative-emphasized': {
    default: colorsLight.secondaryNegativeEmphasized,
    [DARK]: colorsDark.secondaryNegativeEmphasized,
  },
  '--secondary-positive': {
    default: colorsLight.secondaryPositive,
    [DARK]: colorsDark.secondaryPositive,
  },
  '--secondary-positive-deemphasized': {
    default: colorsLight.secondaryPositiveDeemphasized,
    [DARK]: colorsDark.secondaryPositiveDeemphasized,
  },
  '--secondary-warning': {
    default: colorsLight.secondaryWarning,
    [DARK]: colorsDark.secondaryWarning,
  },
  '--secondary-warning-deemphasized': {
    default: colorsLight.secondaryWarningDeemphasized,
    [DARK]: colorsDark.secondaryWarningDeemphasized,
  },
  '--content-default': {
    default: colorsLight.contentDefault,
    [DARK]: colorsDark.contentDefault,
  },
  '--content-deemphasized': {
    default: colorsLight.contentDeemphasized,
    [DARK]: colorsDark.contentDeemphasized,
  },
  '--content-disabled': {
    default: colorsLight.contentDisabled,
    [DARK]: colorsDark.contentDisabled,
  },
  '--content-on-accent': {
    default: colorsLight.contentOnAccent,
    [DARK]: colorsDark.contentOnAccent,
  },
  '--content-action-default': {
    default: colorsLight.contentActionDefault,
    [DARK]: colorsDark.contentActionDefault,
  },
  '--content-action-emphasized': {
    default: colorsLight.contentActionEmphasized,
    [DARK]: colorsDark.contentActionEmphasized,
  },
  '--content-external-link': {
    default: colorsLight.contentExternalLink,
    [DARK]: colorsDark.contentExternalLink,
  },
  '--content-inverse': {
    default: colorsLight.contentInverse,
    [DARK]: colorsDark.contentInverse,
  },
  '--content-read': {
    default: colorsLight.contentRead,
    [DARK]: colorsDark.contentRead,
  },
  '--background-wash-plain': {
    default: colorsLight.backgroundWashPlain,
    [DARK]: colorsDark.backgroundWashPlain,
  },
  '--background-wash-inset': {
    default: colorsLight.backgroundWashInset,
    [DARK]: colorsDark.backgroundWashInset,
  },
  '--background-elevated-wash-plain': {
    default: colorsLight.backgroundElevatedWashPlain,
    [DARK]: colorsDark.backgroundElevatedWashPlain,
  },
  '--background-elevated-wash-inset': {
    default: colorsLight.backgroundElevatedWashInset,
    [DARK]: colorsDark.backgroundElevatedWashInset,
  },
  '--background-dimmer': {
    default: colorsLight.backgroundDimmer,
    [DARK]: colorsDark.backgroundDimmer,
  },
  '--surface-default': {
    default: colorsLight.surfaceDefault,
    [DARK]: colorsDark.surfaceDefault,
  },
  '--surface-emphasized': {
    default: colorsLight.surfaceEmphasized,
    [DARK]: colorsDark.surfaceEmphasized,
  },
  '--surface-elevated-default': {
    default: colorsLight.surfaceElevatedDefault,
    [DARK]: colorsDark.surfaceElevatedDefault,
  },
  '--surface-elevated-emphasized': {
    default: colorsLight.surfaceElevatedEmphasized,
    [DARK]: colorsDark.surfaceElevatedEmphasized,
  },
  '--surface-highlight': {
    default: colorsLight.surfaceHighlight,
    [DARK]: colorsDark.surfaceHighlight,
  },
  '--surface-inverse': {
    default: colorsLight.surfaceInverse,
    [DARK]: colorsDark.surfaceInverse,
  },
  '--surface-pressed': {
    default: colorsLight.surfacePressed,
    [DARK]: colorsDark.surfacePressed,
  },
  '--lines-divider': {
    default: colorsLight.linesDivider,
    [DARK]: colorsDark.linesDivider,
  },
  '--lines-outline-default': {
    default: colorsLight.linesOutlineDefault,
    [DARK]: colorsDark.linesOutlineDefault,
  },
  '--lines-outline-deemphasized': {
    default: colorsLight.linesOutlineDeemphasized,
    [DARK]: colorsDark.linesOutlineDeemphasized,
  },
  '--persistent-always-branded': {
    default: colorsLight.persistentAlwaysBranded,
    [DARK]: colorsDark.persistentAlwaysBranded,
  },
  '--persistent-always-black': {
    default: colorsLight.persistentAlwaysBlack,
    [DARK]: colorsDark.persistentAlwaysBlack,
  },
  '--persistent-always-white': {
    default: colorsLight.persistentAlwaysWhite,
    [DARK]: colorsDark.persistentAlwaysWhite,
  },
  '--persistent-activity-indicator': {
    default: colorsLight.persistentActivityIndicator,
    [DARK]: colorsDark.persistentActivityIndicator,
  },
  '--systems-bubble-surface-incoming': {
    default: colorsLight.productSystemsBubbleSurfaceIncoming,
    [DARK]: colorsDark.productSystemsBubbleSurfaceIncoming,
  },
  '--systems-bubble-surface-outgoing': {
    default: colorsLight.productSystemsBubbleSurfaceOutgoing,
    [DARK]: colorsDark.productSystemsBubbleSurfaceOutgoing,
  },
  '--systems-bubble-content-deemphasized': {
    default: colorsLight.productSystemsBubbleContentDeemphasized,
    [DARK]: colorsDark.productSystemsBubbleContentDeemphasized,
  },
  '--systems-bubble-surface-overlay': {
    default: colorsLight.productSystemsBubbleSurfaceOverlay,
    [DARK]: colorsDark.productSystemsBubbleSurfaceOverlay,
  },
  '--systems-bubble-surface-system': {
    default: colorsLight.productSystemsBubbleSurfaceSystem,
    [DARK]: colorsDark.productSystemsBubbleSurfaceSystem,
  },
  '--systems-bubble-surface-e2e': {
    default: colorsLight.productSystemsBubbleSurfaceE2E,
    [DARK]: colorsDark.productSystemsBubbleSurfaceE2E,
  },
  '--systems-bubble-content-e2e': {
    default: colorsLight.productSystemsBubbleContentE2E,
    [DARK]: colorsDark.productSystemsBubbleContentE2E,
  },
  '--systems-bubble-surface-business': {
    default: colorsLight.productSystemsBubbleSurfaceBusiness,
    [DARK]: colorsDark.productSystemsBubbleSurfaceBusiness,
  },
  '--systems-bubble-content-business': {
    default: colorsLight.productSystemsBubbleContentBusiness,
    [DARK]: colorsDark.productSystemsBubbleContentBusiness,
  },
  '--systems-chat-surface-composer': {
    default: colorsLight.productSystemsChatSurfaceComposer,
    [DARK]: colorsDark.productSystemsChatSurfaceComposer,
  },
  '--systems-chat-background-wallpaper': {
    default: colorsLight.productSystemsChatBackgroundWallpaper,
    [DARK]: colorsDark.productSystemsChatBackgroundWallpaper,
  },
  '--systems-chat-foreground-wallpaper': {
    default: colorsLight.productSystemsChatForegroundWallpaper,
    [DARK]: colorsDark.productSystemsChatForegroundWallpaper,
  },
  '--systems-chat-surface-tray': {
    default: colorsLight.productSystemsChatSurfaceTray,
    [DARK]: colorsDark.productSystemsChatSurfaceTray,
  },
  '--systems-status-seen': {
    default: colorsLight.productSystemsStatusSeen,
    [DARK]: colorsDark.productSystemsStatusSeen,
  },
  '--internal-components-surface-nav-bar': {
    default: colorsLight.internalComponentsSurfaceNavBar,
    [DARK]: colorsDark.internalComponentsSurfaceNavBar,
  },
  '--internal-components-active-list-row': {
    default: colorsLight.internalComponentsActiveListRow,
    [DARK]: colorsDark.internalComponentsActiveListRow,
  },
};
const lightTheme = {
  '--accent': systemTheme['--accent'].default,
  '--accent-deemphasized': systemTheme['--accent-deemphasized'].default,
  '--accent-emphasized': systemTheme['--accent-emphasized'].default,
  '--secondary-negative': systemTheme['--secondary-negative'].default,
  '--secondary-negative-deemphasized':
    systemTheme['--secondary-negative-deemphasized'].default,
  '--secondary-negative-emphasized':
    systemTheme['--secondary-negative-emphasized'].default,
  '--secondary-positive': systemTheme['--secondary-positive'].default,
  '--secondary-positive-deemphasized':
    systemTheme['--secondary-positive-deemphasized'].default,
  '--secondary-warning': systemTheme['--secondary-warning'].default,
  '--secondary-warning-deemphasized':
    systemTheme['--secondary-warning-deemphasized'].default,
  '--content-default': systemTheme['--content-default'].default,
  '--content-deemphasized': systemTheme['--content-deemphasized'].default,
  '--content-disabled': systemTheme['--content-disabled'].default,
  '--content-on-accent': systemTheme['--content-on-accent'].default,
  '--content-action-default': systemTheme['--content-action-default'].default,
  '--content-action-emphasized':
    systemTheme['--content-action-emphasized'].default,
  '--content-external-link': systemTheme['--content-external-link'].default,
  '--content-inverse': systemTheme['--content-inverse'].default,
  '--content-read': systemTheme['--content-read'].default,
  '--background-wash-plain': systemTheme['--background-wash-plain'].default,
  '--background-wash-inset': systemTheme['--background-wash-inset'].default,
  '--background-elevated-wash-plain':
    systemTheme['--background-elevated-wash-plain'].default,
  '--background-elevated-wash-inset':
    systemTheme['--background-elevated-wash-inset'].default,
  '--background-dimmer': systemTheme['--background-dimmer'].default,
  '--surface-default': systemTheme['--surface-default'].default,
  '--surface-emphasized': systemTheme['--surface-emphasized'].default,
  '--surface-elevated-default':
    systemTheme['--surface-elevated-default'].default,
  '--surface-elevated-emphasized':
    systemTheme['--surface-elevated-emphasized'].default,
  '--surface-highlight': systemTheme['--surface-highlight'].default,
  '--surface-inverse': systemTheme['--surface-inverse'].default,
  '--surface-pressed': systemTheme['--surface-pressed'].default,
  '--lines-divider': systemTheme['--lines-divider'].default,
  '--lines-outline-default': systemTheme['--lines-outline-default'].default,
  '--lines-outline-deemphasized':
    systemTheme['--lines-outline-deemphasized'].default,
  '--persistent-always-branded':
    systemTheme['--persistent-always-branded'].default,
  '--persistent-always-black': systemTheme['--persistent-always-black'].default,
  '--persistent-always-white': systemTheme['--persistent-always-white'].default,
  '--persistent-activity-indicator':
    systemTheme['--persistent-activity-indicator'].default,
  '--systems-bubble-surface-incoming':
    systemTheme['--systems-bubble-surface-incoming'].default,
  '--systems-bubble-surface-outgoing':
    systemTheme['--systems-bubble-surface-outgoing'].default,
  '--systems-bubble-content-deemphasized':
    systemTheme['--systems-bubble-content-deemphasized'].default,
  '--systems-bubble-surface-overlay':
    systemTheme['--systems-bubble-surface-overlay'].default,
  '--systems-bubble-surface-system':
    systemTheme['--systems-bubble-surface-system'].default,
  '--systems-bubble-surface-e2e':
    systemTheme['--systems-bubble-surface-e2e'].default,
  '--systems-bubble-content-e2e':
    systemTheme['--systems-bubble-content-e2e'].default,
  '--systems-bubble-surface-business':
    systemTheme['--systems-bubble-surface-business'].default,
  '--systems-bubble-content-business':
    systemTheme['--systems-bubble-content-business'].default,
  '--systems-chat-surface-composer':
    systemTheme['--systems-chat-surface-composer'].default,
  '--systems-chat-background-wallpaper':
    systemTheme['--systems-chat-background-wallpaper'].default,
  '--systems-chat-foreground-wallpaper':
    systemTheme['--systems-chat-foreground-wallpaper'].default,
  '--systems-chat-surface-tray':
    systemTheme['--systems-chat-surface-tray'].default,
  '--systems-status-seen': systemTheme['--systems-status-seen'].default,
  '--internal-components-surface-nav-bar':
    systemTheme['--internal-components-surface-nav-bar'].default,
  '--internal-components-active-list-row':
    systemTheme['--internal-components-active-list-row'].default,
};

const darkTheme = {
  '--accent': systemTheme['--accent'][DARK],
  '--accent-deemphasized': systemTheme['--accent-deemphasized'][DARK],
  '--accent-emphasized': systemTheme['--accent-emphasized'][DARK],
  '--secondary-negative': systemTheme['--secondary-negative'][DARK],
  '--secondary-negative-deemphasized':
    systemTheme['--secondary-negative-deemphasized'][DARK],
  '--secondary-negative-emphasized':
    systemTheme['--secondary-negative-emphasized'][DARK],
  '--secondary-positive': systemTheme['--secondary-positive'][DARK],
  '--secondary-positive-deemphasized':
    systemTheme['--secondary-positive-deemphasized'][DARK],
  '--secondary-warning': systemTheme['--secondary-warning'][DARK],
  '--secondary-warning-deemphasized':
    systemTheme['--secondary-warning-deemphasized'][DARK],
  '--content-default': systemTheme['--content-default'][DARK],
  '--content-deemphasized': systemTheme['--content-deemphasized'][DARK],
  '--content-disabled': systemTheme['--content-disabled'][DARK],
  '--content-on-accent': systemTheme['--content-on-accent'][DARK],
  '--content-action-default': systemTheme['--content-action-default'][DARK],
  '--content-action-emphasized':
    systemTheme['--content-action-emphasized'][DARK],
  '--content-external-link': systemTheme['--content-external-link'][DARK],
  '--content-inverse': systemTheme['--content-inverse'][DARK],
  '--content-read': systemTheme['--content-read'][DARK],
  '--background-wash-plain': systemTheme['--background-wash-plain'][DARK],
  '--background-wash-inset': systemTheme['--background-wash-inset'][DARK],
  '--background-elevated-wash-plain':
    systemTheme['--background-elevated-wash-plain'][DARK],
  '--background-elevated-wash-inset':
    systemTheme['--background-elevated-wash-inset'][DARK],
  '--background-dimmer': systemTheme['--background-dimmer'][DARK],
  '--surface-default': systemTheme['--surface-default'][DARK],
  '--surface-emphasized': systemTheme['--surface-emphasized'][DARK],
  '--surface-elevated-default': systemTheme['--surface-elevated-default'][DARK],
  '--surface-elevated-emphasized':
    systemTheme['--surface-elevated-emphasized'][DARK],
  '--surface-highlight': systemTheme['--surface-highlight'][DARK],
  '--surface-inverse': systemTheme['--surface-inverse'][DARK],
  '--surface-pressed': systemTheme['--surface-pressed'][DARK],
  '--lines-divider': systemTheme['--lines-divider'][DARK],
  '--lines-outline-default': systemTheme['--lines-outline-default'][DARK],
  '--lines-outline-deemphasized':
    systemTheme['--lines-outline-deemphasized'][DARK],
  '--persistent-always-branded':
    systemTheme['--persistent-always-branded'][DARK],
  '--persistent-always-black': systemTheme['--persistent-always-black'][DARK],
  '--persistent-always-white': systemTheme['--persistent-always-white'][DARK],
  '--persistent-activity-indicator':
    systemTheme['--persistent-activity-indicator'][DARK],
  '--systems-bubble-surface-incoming':
    systemTheme['--systems-bubble-surface-incoming'][DARK],
  '--systems-bubble-surface-outgoing':
    systemTheme['--systems-bubble-surface-outgoing'][DARK],
  '--systems-bubble-content-deemphasized':
    systemTheme['--systems-bubble-content-deemphasized'][DARK],
  '--systems-bubble-surface-overlay':
    systemTheme['--systems-bubble-surface-overlay'][DARK],
  '--systems-bubble-surface-system':
    systemTheme['--systems-bubble-surface-system'][DARK],
  '--systems-bubble-surface-e2e':
    systemTheme['--systems-bubble-surface-e2e'][DARK],
  '--systems-bubble-content-e2e':
    systemTheme['--systems-bubble-content-e2e'][DARK],
  '--systems-bubble-surface-business':
    systemTheme['--systems-bubble-surface-business'][DARK],
  '--systems-bubble-content-business':
    systemTheme['--systems-bubble-content-business'][DARK],
  '--systems-chat-surface-composer':
    systemTheme['--systems-chat-surface-composer'][DARK],
  '--systems-chat-background-wallpaper':
    systemTheme['--systems-chat-background-wallpaper'][DARK],
  '--systems-chat-foreground-wallpaper':
    systemTheme['--systems-chat-foreground-wallpaper'][DARK],
  '--systems-chat-surface-tray':
    systemTheme['--systems-chat-surface-tray'][DARK],
  '--systems-status-seen': systemTheme['--systems-status-seen'][DARK],
  '--internal-components-surface-nav-bar':
    systemTheme['--internal-components-surface-nav-bar'][DARK],
  '--internal-components-active-list-row':
    systemTheme['--internal-components-active-list-row'][DARK],
};

export const WDSSystemTheme: Theme<typeof colors> = stylex.createTheme(
  colors,
  systemTheme,
);
export const WDSLightTheme: Theme<typeof colors> = stylex.createTheme(
  colors,
  lightTheme,
);
export const WDSDarkTheme: Theme<typeof colors> = stylex.createTheme(
  colors,
  darkTheme,
);
