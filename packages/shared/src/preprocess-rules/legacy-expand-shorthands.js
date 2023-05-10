/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import splitValue from '../utils/split-css-value';

import type { TStyleValue } from '../common-types';

// TODO: to be added later.
// const aliases = {
//   marginInlineStart: (rawValue) => [['marginStart', rawValue]],
//   marginInlineEnd: (rawValue) => [['marginEnd', rawValue]],
//   marginInline: (rawValue) => [
//     ['marginStart', rawValue],
//     ['marginEnd', rawValue],
//   ],
//   paddingInlineStart: (rawValue) => [['paddingStart', rawValue]],
//   paddingInlineEnd: (rawValue) => [['paddingEnd', rawValue]],
//   paddingInline: (rawValue) => [
//     ['paddingStart', rawValue],
//     ['paddingEnd', rawValue],
//   ],
//   // 'borderInlineStart': (rawValue) => [['borderStart', rawValue]],
//   // 'borderInlineEnd': (rawValue) => [['borderEnd', rawValue]],
//   // // This will need to change.
//   // 'borderInline': (rawValue) => [
//   //   ['borderStart', rawValue],
//   //   ['borderEnd', rawValue],
//   // ],
// };

/**
 * Shorthand properties:
 * - [x] all - Should be banned
 * - [ ] animation
 * - [ ] background
 * - [-] border
 * - [x] border-block-end
 * - [x] border-block-start
 * - [ ] border-bottom
 * - [x] border-color
 * - [x] border-image
 * - [x] border-inline-end
 * - [x] border-inline-start
 * - [ ] border-left
 * - [x] border-radius
 * - [ ] border-right
 * - [x] border-style
 * - [ ] border-top
 * - [x] border-width
 * - [ ] column-rule
 * - [ ] columns
 * - [ ] flex
 * - [ ] flex-flow
 * - [ ] font
 * - [ ] gap
 * - [ ] grid
 * - [ ] grid-area
 * - [ ] grid-column
 * - [ ] grid-row
 * - [ ] grid-template
 * - [ ] list-style
 * - [x] margin
 * - [ ] mask
 * - [ ] offset
 * - [ ] outline
 * - [x] overflow
 * - [x] padding
 * - [ ] place-content
 * - [ ] place-items
 * - [ ] place-self
 * - [ ] scroll-margin
 * - [ ] scroll-padding
 * - [ ] text-decoration
 * - [ ] text-emphasis
 * - [ ] transition
 */

type TReturn = $ReadOnlyArray<[string, TStyleValue]>;

const borderWidthKeywords = new Set(['thin', 'medium', 'thick']);
const borderStyleKeywords = new Set([
  'none',
  'hidden',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inside', // Non-standard
  'inset',
  'outset',
]);
const globalKeywords = new Set(['initial', 'inherit', 'unset']);
// eslint-disable-next-line no-unused-vars
function borderDetector(borderParts: $ReadOnlyArray<number | string | null>) {
  const parts = borderParts.filter(Boolean).slice();

  let suffix = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (typeof part === 'string' && part.endsWith('!important')) {
      parts[i] = part.replace('!important', '').trim();
      suffix = ' !important';
    }
  }

  if (
    parts.length === 1 &&
    typeof parts[0] === 'string' &&
    globalKeywords.has(parts[0])
  ) {
    return [parts[0], parts[0], parts[0]];
  }

  // Find the part that starts with a number
  // This is most likely to be the borderWidth
  let width = parts.find(
    (part) =>
      typeof part === 'number' ||
      part.match(/^\.?\d+/) ||
      borderWidthKeywords.has(part)
  );
  if (typeof width === 'number') {
    width = String(width) + 'px';
  }
  // console.log('width', width);
  if (width != null) {
    parts.splice(parts.indexOf(width), 1);
  }
  if (parts.length === 0) {
    return [String(width) + suffix, null, null];
  }
  const style = parts.find(
    (part) => typeof part === 'string' && borderStyleKeywords.has(part)
  );
  if (style != null) {
    parts.splice(parts.indexOf(style), 1);
  }
  if (parts.length === 2 && width == null) {
    width = parts[0];
    parts.splice(0, 1);
  }
  if (width != null && parts.length > 1) {
    throw new Error('Invalid border shorthand value');
  }
  const color = parts[0];
  return [width, style, color].map((part) =>
    part != null ? part + suffix : null
  );
}

const expansions = {
  // TODO: Due to UI regressions internally, we need to maintain the buggy behaviour of
  // border shorthand for now. This will be fixed in a future release.
  // border: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return expansions.borderWidth(rawValue);
  //   }

  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);

  //   return [
  //     ...(width != null ? expansions.borderWidth(width) : []),
  //     ...(style != null ? expansions.borderStyle(style) : []),
  //     ...(color != null ? expansions.borderColor(color) : []),
  //   ];
  // },
  // borderTop: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return [['borderTopWidth', rawValue]];
  //   }
  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);

  //   return [
  //     width != null ? ['borderTopWidth', width] : null,
  //     style != null ? ['borderTopStyle', style] : null,
  //     color != null ? ['borderTopColor', color] : null,
  //   ].filter(Boolean);
  // },
  // borderEnd: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return [['borderEndWidth', rawValue]];
  //   }

  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);

  //   return [
  //     width != null ? ['borderEndWidth', width] : null,
  //     style != null ? ['borderEndStyle', style] : null,
  //     color != null ? ['borderEndColor', color] : null,
  //   ].filter(Boolean);
  // },
  // borderRight: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return [['borderRightWidth', rawValue]];
  //   }
  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);
  //   return [
  //     width != null ? ['borderRightWidth', width] : null,
  //     style != null ? ['borderRightStyle', style] : null,
  //     color != null ? ['borderRightColor', color] : null,
  //   ].filter(Boolean);
  // },
  // borderBottom: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return [['borderBottomWidth', rawValue]];
  //   }
  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);
  //   return [
  //     width != null ? ['borderBottomWidth', width] : null,
  //     style != null ? ['borderBottomStyle', style] : null,
  //     color != null ? ['borderBottomColor', color] : null,
  //   ].filter(Boolean);
  // },
  // borderStart: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return [['borderStartWidth', rawValue]];
  //   }
  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);
  //   return [
  //     width != null ? ['borderStartWidth', width] : null,
  //     style != null ? ['borderStartStyle', style] : null,
  //     color != null ? ['borderStartColor', color] : null,
  //   ].filter(Boolean);
  // },
  // borderLeft: (rawValue: TStyleValue): TReturn => {
  //   if (typeof rawValue === 'number') {
  //     return [['borderLeftWidth', rawValue]];
  //   }
  //   const parts = splitValue(rawValue);
  //   const [width, style, color] = borderDetector(parts);
  //   return [
  //     width != null ? ['borderLeftWidth', width] : null,
  //     style != null ? ['borderLeftStyle', style] : null,
  //     color != null ? ['borderLeftColor', color] : null,
  //   ].filter(Boolean);
  // },

  border: (rawValue: TStyleValue): TReturn => {
    return [
      ['borderTop', rawValue],
      ['borderEnd', rawValue],
      ['borderBottom', rawValue],
      ['borderStart', rawValue],
    ];
  },

  borderColor: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopColor', top],
      ['borderEndColor', right],
      ['borderBottomColor', bottom],
      ['borderStartColor', left],
    ];
  },
  borderHorizontal: (rawValue: TStyleValue): TReturn => {
    return [
      ['borderStart', rawValue],
      ['borderEnd', rawValue],
    ];
    // return [
    //   ...expansions.borderStart(rawValue),
    //   ...expansions.borderEnd(rawValue),
    // ];
  },
  borderStyle: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopStyle', top],
      ['borderEndStyle', right],
      ['borderBottomStyle', bottom],
      ['borderStartStyle', left],
    ];
  },
  borderVertical: (rawValue: TStyleValue): TReturn => {
    return [
      ['borderTop', rawValue],
      ['borderBottom', rawValue],
    ];
    // return [
    //   ...expansions.borderTop(rawValue),
    //   ...expansions.borderBottom(rawValue),
    // ];
  },
  borderWidth: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopWidth', top],
      ['borderEndWidth', right],
      ['borderBottomWidth', bottom],
      ['borderStartWidth', left],
    ];
  },
  borderRadius: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopStartRadius', top],
      ['borderTopEndRadius', right],
      ['borderBottomEndRadius', bottom],
      ['borderBottomStartRadius', left],
    ];
  },
  margin: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['marginTop', top],
      ['marginEnd', right],
      ['marginBottom', bottom],
      ['marginStart', left],
    ];
  },
  marginHorizontal: (rawValue: TStyleValue): TReturn => {
    return [
      ['marginStart', rawValue],
      ['marginEnd', rawValue],
    ];
  },
  marginVertical: (rawValue: TStyleValue): TReturn => {
    return [
      ['marginTop', rawValue],
      ['marginBottom', rawValue],
    ];
  },

  overflow: (rawValue: TStyleValue): TReturn => {
    const [x, y = x] = splitValue(rawValue);
    return [
      ['overflowX', x],
      ['overflowY', y],
    ];
  },
  padding: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['paddingTop', top],
      ['paddingEnd', right],
      ['paddingBottom', bottom],
      ['paddingStart', left],
    ];
  },
  paddingHorizontal: (rawValue: TStyleValue): TReturn => {
    return [
      ['paddingStart', rawValue],
      ['paddingEnd', rawValue],
    ];
  },
  paddingVertical: (rawValue: TStyleValue): TReturn => {
    return [
      ['paddingTop', rawValue],
      ['paddingBottom', rawValue],
    ];
  },
};

export default expansions;
