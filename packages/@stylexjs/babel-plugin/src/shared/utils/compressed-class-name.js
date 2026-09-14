/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { propertyShorthands } from '../property-shorthands';
import { getNumberSuffix, lengthUnits, timeUnits } from './transform-value';

const MAX_COMPRESSED_CLASS_NAME_LENGTH = 6;

const alignment = Object.freeze({
  baseline: 'b',
  center: 'c',
  end: 'e',
  'flex-end': 'fe',
  'flex-start': 'fs',
  normal: 'n',
  'space-around': 'sa',
  'space-between': 'sb',
  'space-evenly': 'se',
  start: 's',
  stretch: 'st',
});

const itemAlignment = Object.freeze({
  baseline: 'b',
  center: 'c',
  end: 'e',
  'flex-end': 'fe',
  'flex-start': 'fs',
  normal: 'n',
  'self-end': 'se',
  'self-start': 'ss',
  start: 'st',
  stretch: 's',
});

const selfAlignment = Object.freeze({
  ...itemAlignment,
  auto: 'a',
});

const color = Object.freeze({
  black: 'b',
  blue: 'bl',
  currentColor: 'c',
  gray: 'gy',
  green: 'g',
  orange: 'o',
  purple: 'p',
  red: 'r',
  transparent: 't',
  white: 'w',
  yellow: 'y',
});

const overflow = Object.freeze({
  auto: 'a',
  clip: 'c',
  hidden: 'h',
  scroll: 's',
  visible: 'v',
});

const borderStyle = Object.freeze({
  dashed: 'd',
  dotted: 'dt',
  double: 'db',
  hidden: 'h',
  none: 'n',
  solid: 's',
});

const timingFunction = Object.freeze({
  ease: 'e',
  'ease-in': 'ei',
  'ease-in-out': 'io',
  'ease-out': 'eo',
  linear: 'l',
  'step-end': 'se',
  'step-start': 'ss',
});

export const valueShorthands: $ReadOnly<{
  [string]: $ReadOnly<{ [string]: string }>,
}> = Object.freeze({
  accentColor: color,
  alignContent: alignment,
  alignItems: itemAlignment,
  alignSelf: selfAlignment,
  animationDirection: {
    alternate: 'a',
    'alternate-reverse': 'ar',
    normal: 'n',
    reverse: 'r',
  },
  animationFillMode: {
    backwards: 'b',
    both: 'bt',
    forwards: 'f',
    none: 'n',
  },
  animationIterationCount: { infinite: 'i' },
  animationName: { none: 'n' },
  animationPlayState: { paused: 'p', running: 'r' },
  animationTimingFunction: timingFunction,
  appearance: { auto: 'a', none: 'n' },
  backgroundColor: color,
  backgroundImage: { none: 'n' },
  backgroundPosition: {
    bottom: 'b',
    center: 'c',
    left: 'l',
    right: 'r',
    top: 't',
  },
  backgroundRepeat: {
    'no-repeat': 'n',
    repeat: 'r',
    'repeat-x': 'rx',
    'repeat-y': 'ry',
    round: 'rd',
    space: 's',
  },
  backgroundSize: { auto: 'a', contain: 'ct', cover: 'c' },
  borderBlockColor: color,
  borderBlockStyle: borderStyle,
  borderBottomColor: color,
  borderBottomStyle: borderStyle,
  borderColor: color,
  borderInlineColor: color,
  borderInlineEndColor: color,
  borderInlineEndStyle: borderStyle,
  borderInlineStartColor: color,
  borderInlineStartStyle: borderStyle,
  borderInlineStyle: borderStyle,
  borderLeftColor: color,
  borderLeftStyle: borderStyle,
  borderRightColor: color,
  borderRightStyle: borderStyle,
  borderStyle,
  borderTopColor: color,
  borderTopStyle: borderStyle,
  boxShadow: { none: 'n' },
  boxSizing: { 'border-box': 'b', 'content-box': 'c' },
  clear: {
    both: 'b',
    'inline-end': 'ie',
    'inline-start': 'is',
    left: 'l',
    none: 'n',
    right: 'r',
  },
  color,
  content: { none: 'no', normal: 'n' },
  cursor: {
    auto: 'a',
    crosshair: 'c',
    default: 'd',
    grab: 'g',
    grabbing: 'gb',
    help: 'h',
    move: 'm',
    'not-allowed': 'na',
    pointer: 'p',
    text: 't',
    wait: 'w',
    'zoom-in': 'zi',
    'zoom-out': 'zo',
  },
  display: {
    block: 'b',
    contents: 'c',
    flex: 'f',
    'flow-root': 'fr',
    grid: 'g',
    inline: 'i',
    'inline-block': 'ib',
    'inline-flex': 'if',
    'inline-grid': 'ig',
    none: 'n',
    table: 't',
  },
  fill: color,
  filter: { none: 'n' },
  flexDirection: {
    column: 'c',
    'column-reverse': 'cr',
    row: 'r',
    'row-reverse': 'rr',
  },
  flexWrap: { nowrap: 'n', wrap: 'w', 'wrap-reverse': 'wr' },
  float: {
    'inline-end': 'ie',
    'inline-start': 'is',
    left: 'l',
    none: 'n',
    right: 'r',
  },
  fontFamily: {
    monospace: 'm',
    'sans-serif': 'ss',
    serif: 'sr',
    'system-ui': 'sy',
  },
  fontStyle: { italic: 'i', normal: 'n', oblique: 'o' },
  fontWeight: {
    bold: 'b',
    bolder: 'br',
    lighter: 'l',
    normal: 'n',
  },
  justifyContent: alignment,
  justifyItems: itemAlignment,
  justifySelf: selfAlignment,
  letterSpacing: { normal: 'n' },
  lineHeight: { normal: 'n' },
  listStyleType: { none: 'n' },
  margin: { auto: 'a' },
  marginBlock: { auto: 'a' },
  marginBlockEnd: { auto: 'a' },
  marginBlockStart: { auto: 'a' },
  marginBottom: { auto: 'a' },
  marginInline: { auto: 'a' },
  marginInlineEnd: { auto: 'a' },
  marginInlineStart: { auto: 'a' },
  marginLeft: { auto: 'a' },
  marginRight: { auto: 'a' },
  marginTop: { auto: 'a' },
  maxHeight: { none: 'n' },
  maxWidth: { none: 'n' },
  objectFit: {
    contain: 'ct',
    cover: 'cv',
    fill: 'f',
    none: 'n',
    'scale-down': 'sd',
  },
  objectPosition: {
    bottom: 'b',
    center: 'c',
    left: 'l',
    right: 'r',
    top: 't',
  },
  outlineColor: color,
  outlineStyle: borderStyle,
  overflow,
  overflowWrap: { anywhere: 'a', 'break-word': 'bw', normal: 'n' },
  overflowX: overflow,
  overflowY: overflow,
  placeContent: alignment,
  placeItems: itemAlignment,
  placeSelf: selfAlignment,
  pointerEvents: { auto: 'a', none: 'n' },
  position: {
    absolute: 'a',
    fixed: 'f',
    relative: 'r',
    static: 's',
    sticky: 'st',
  },
  resize: {
    block: 'bk',
    both: 'b',
    horizontal: 'h',
    inline: 'i',
    none: 'n',
    vertical: 'v',
  },
  stroke: color,
  textAlign: {
    center: 'c',
    end: 'e',
    justify: 'j',
    left: 'l',
    'match-parent': 'mp',
    right: 'r',
    start: 's',
  },
  textDecoration: {
    blink: 'b',
    'line-through': 'lt',
    none: 'n',
    overline: 'o',
    underline: 'u',
  },
  textOverflow: { clip: 'c', ellipsis: 'e' },
  textTransform: {
    capitalize: 'c',
    lowercase: 'l',
    none: 'n',
    uppercase: 'u',
  },
  transform: { none: 'n' },
  transformOrigin: {
    bottom: 'b',
    center: 'c',
    left: 'l',
    right: 'r',
    top: 't',
  },
  transitionProperty: {
    all: 'a',
    'background-color': 'bg',
    color: 'c',
    none: 'n',
    opacity: 'o',
    transform: 't',
  },
  transitionTimingFunction: timingFunction,
  userSelect: { all: 'al', auto: 'a', contain: 'c', none: 'n', text: 't' },
  verticalAlign: {
    baseline: 'b',
    bottom: 'bt',
    middle: 'm',
    sub: 's',
    super: 'sp',
    'text-bottom': 'tb',
    'text-top': 'tt',
    top: 't',
  },
  visibility: { collapse: 'c', hidden: 'h', visible: 'v' },
  whiteSpace: {
    'break-spaces': 'bs',
    normal: 'n',
    nowrap: 'nw',
    pre: 'p',
    'pre-line': 'pl',
    'pre-wrap': 'pw',
  },
  willChange: {
    auto: 'a',
    contents: 'c',
    opacity: 'o',
    'scroll-position': 'sp',
    transform: 't',
  },
  wordBreak: {
    'break-all': 'ba',
    'break-word': 'bw',
    'keep-all': 'ka',
    normal: 'n',
  },
  wordSpacing: { normal: 'n' },
  zIndex: { auto: 'a' },
});

const simpleUnitShorthands: $ReadOnly<{ [string]: string }> = Object.freeze({
  '%': 'p',
  em: 'e',
  rem: 'r',
});

function encodeNumber(value: string): ?string {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }

  const normalized = String(number);
  if (!/^-?(?:\d+|\d+\.\d+)$/.test(normalized)) {
    return null;
  }
  return normalized.replace('.', 'd');
}

function getNumericClassName(
  property: string,
  propertyShorthand: string,
  value: string,
): ?string {
  if (value === '0') {
    return propertyShorthand + '0';
  }

  const dimension = value.match(/^(-?(?:\d+|\d*\.\d+))(px|%|rem|em|ms|s)?$/);
  if (dimension == null) {
    return null;
  }

  const number = encodeNumber(dimension[1]);
  const unit = dimension[2] ?? '';
  if (number == null) {
    return null;
  }

  if (unit === '' && getNumberSuffix(property) === '') {
    return propertyShorthand + number;
  }
  if (
    unit === 'px' &&
    lengthUnits.has(property) &&
    getNumberSuffix(property) !== ''
  ) {
    return propertyShorthand + number;
  }
  if ((unit === 'ms' || unit === 's') && timeUnits.has(property)) {
    return propertyShorthand + number + unit[0];
  }

  const unitShorthand = simpleUnitShorthands[unit];
  return unitShorthand == null
    ? null
    : propertyShorthand + number + unitShorthand;
}

function getKeywordClassName(
  property: string,
  propertyShorthand: string,
  value: string,
): ?string {
  const valueShorthand = valueShorthands[property]?.[value];
  return valueShorthand == null
    ? null
    : `${propertyShorthand}-${valueShorthand}`;
}

function getHexColorClassName(
  property: string,
  propertyShorthand: string,
  value: string,
): ?string {
  if (valueShorthands[property] !== color || !/^#[0-9a-f]{3,4}$/i.test(value)) {
    return null;
  }
  return `${propertyShorthand}-${value.slice(1).toLowerCase()}`;
}

export default function getCompressedClassName(
  property: string,
  value: string | $ReadOnlyArray<string>,
  hasModifiers: boolean,
  classNamePrefix: string,
): ?string {
  const propertyShorthand = propertyShorthands[property];
  if (
    propertyShorthand == null ||
    Array.isArray(value) ||
    hasModifiers ||
    classNamePrefix === ''
  ) {
    return null;
  }

  const candidate =
    getNumericClassName(property, propertyShorthand, value) ??
    getKeywordClassName(property, propertyShorthand, value) ??
    getHexColorClassName(property, propertyShorthand, value);

  if (
    candidate == null ||
    candidate.length > MAX_COMPRESSED_CLASS_NAME_LENGTH ||
    candidate.startsWith(classNamePrefix)
  ) {
    return null;
  }
  return candidate;
}
