/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import splitValue from '../utils/split-css-value';

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

const expansions = {
  // Old buggy implementation that left two sets of conflicting border properties
  // border: (rawValue: string): Array<[string, string]> => {
  //   return [
  //     ['borderTop', rawValue],
  //     ['borderEnd', rawValue],
  //     ['borderBottom', rawValue],
  //     ['borderStart', rawValue],
  //   ];
  // },

  // Add this later, as this will be a breaking change
  border: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return expansions.borderWidth(rawValue);
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ...expansions.borderWidth(width),
      ...expansions.borderStyle(style),
      ...expansions.borderColor(color),
    ];
  },
  borderTop: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return [['borderTopWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderTopWidth', width],
      ['borderTopStyle', style],
      ['borderTopColor', color],
    ];
  },
  borderEnd: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return [['borderEndWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderEndWidth', width],
      ['borderEndStyle', style],
      ['borderEndColor', color],
    ];
  },
  borderRight: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return [['borderRightWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderRightWidth', width],
      ['borderRightStyle', style],
      ['borderRightColor', color],
    ];
  },
  borderBottom: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return [['borderBottomWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderBottomWidth', width],
      ['borderBottomStyle', style],
      ['borderBottomColor', color],
    ];
  },
  borderStart: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return [['borderStartWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderStartWidth', width],
      ['borderStartStyle', style],
      ['borderStartColor', color],
    ];
  },
  borderLeft: (rawValue: string): Array<[string, string]> => {
    if (typeof rawValue === 'number') {
      return [['borderLeftWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderLeftWidth', width],
      ['borderLeftStyle', style],
      ['borderLeftColor', color],
    ];
  },

  borderColor: (rawValue: string): Array<[string, string]> => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopColor', top],
      ['borderEndColor', right],
      ['borderBottomColor', bottom],
      ['borderStartColor', left],
    ];
  },
  borderHorizontal: (rawValue: string): Array<[string, string]> => {
    return [
      ['borderStart', rawValue],
      ['borderEnd', rawValue],
    ];
  },
  borderStyle: (rawValue: string): Array<[string, string]> => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopStyle', top],
      ['borderEndStyle', right],
      ['borderBottomStyle', bottom],
      ['borderStartStyle', left],
    ];
  },
  borderVertical: (rawValue: string): Array<[string, string]> => {
    return [
      ['borderTop', rawValue],
      ['borderBottom', rawValue],
    ];
  },
  borderWidth: (rawValue: string): Array<[string, string]> => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);

    return [
      ['borderTopWidth', top],
      ['borderEndWidth', right],
      ['borderBottomWidth', bottom],
      ['borderStartWidth', left],
    ];
  },
  borderRadius: (rawValue: string): Array<[string, string]> => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'string'
        ? splitValue(rawValue)
        : typeof rawValue === 'number'
        ? [rawValue]
        : rawValue; // remove

    return [
      ['borderTopStartRadius', top],
      ['borderTopEndRadius', right],
      ['borderBottomEndRadius', bottom],
      ['borderBottomStartRadius', left],
    ];
  },
  margin: (rawValue: string): Array<[string, string]> => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);

    return [
      ['marginTop', top],
      ['marginEnd', right],
      ['marginBottom', bottom],
      ['marginStart', left],
    ];
  },
  marginHorizontal: (rawValue: string): Array<[string, string]> => {
    return [
      ['marginStart', rawValue],
      ['marginEnd', rawValue],
    ];
  },
  marginVertical: (rawValue: string): Array<[string, string]> => {
    return [
      ['marginTop', rawValue],
      ['marginBottom', rawValue],
    ];
  },

  overflow: (rawValue: string): Array<[string, string]> => {
    const [x, y = x] = splitValue(rawValue);
    return [
      ['overflowX', x],
      ['overflowY', y],
    ];
  },
  padding: (rawValue: string): Array<[string, string]> => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);

    return [
      ['paddingTop', top],
      ['paddingEnd', right],
      ['paddingBottom', bottom],
      ['paddingStart', left],
    ];
  },
  paddingHorizontal: (rawValue: string): Array<[string, string]> => {
    return [
      ['paddingStart', rawValue],
      ['paddingEnd', rawValue],
    ];
  },
  paddingVertical: (rawValue: string): Array<[string, string]> => {
    return [
      ['paddingTop', rawValue],
      ['paddingBottom', rawValue],
    ];
  },
};

export default expansions;
