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

const shorthands = {
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

  borderHorizontalColor: (rawValue: TStyleValue): TReturn => [
    ['borderStartColor', rawValue],
    ['borderEndColor', rawValue],
  ],
  borderHorizontalStyle: (rawValue: TStyleValue): TReturn => [
    ['borderStartStyle', rawValue],
    ['borderEndStyle', rawValue],
  ],
  borderHorizontalWidth: (rawValue: TStyleValue): TReturn => [
    ['borderStartWidth', rawValue],
    ['borderEndWidth', rawValue],
  ],
  borderVerticalColor: (rawValue: TStyleValue): TReturn => [
    ['borderTopColor', rawValue],
    ['borderBottomColor', rawValue],
  ],
  borderVerticalStyle: (rawValue: TStyleValue): TReturn => [
    ['borderTopStyle', rawValue],
    ['borderBottomStyle', rawValue],
  ],
  borderVerticalWidth: (rawValue: TStyleValue): TReturn => [
    ['borderTopWidth', rawValue],
    ['borderBottomWidth', rawValue],
  ],

  borderRadius: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopStartRadius', top],
      ['borderTopEndRadius', right],
      ['borderBottomEndRadius', bottom],
      ['borderBottomStartRadius', left],
    ];
  },
  inset: (rawValue: TStyleValue): TReturn => [
    ['top', rawValue],
    ['end', rawValue],
    ['bottom', rawValue],
    ['start', rawValue],
  ],
  insetInline: (rawValue: TStyleValue): TReturn => [
    ['start', rawValue],
    ['end', rawValue],
  ],
  insetBlock: (rawValue: TStyleValue): TReturn => [
    ['top', rawValue],
    ['bottom', rawValue],
  ],
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
  paddingHorizontal: (val: TStyleValue): TReturn => {
    return [
      ['paddingStart', val],
      ['paddingEnd', val],
    ];
  },
  paddingVertical: (val: TStyleValue): TReturn => {
    return [
      ['paddingTop', val],
      ['paddingBottom', val],
    ];
  },
};

const aliases = {
  insetBlockStart: (val: TStyleValue): TReturn => [['top', val]],
  insetBlockEnd: (val: TStyleValue): TReturn => [['bottom', val]],
  insetInlineStart: (val: TStyleValue): TReturn => [['start', val]],
  insetInlineEnd: (val: TStyleValue): TReturn => [['end', val]],

  blockSize: (val: TStyleValue): TReturn => [['height', val]],
  inlineSize: (val: TStyleValue): TReturn => [['width', val]],
  minBlockSize: (val: TStyleValue): TReturn => [['minHeight', val]],
  minInlineSize: (val: TStyleValue): TReturn => [['minWidth', val]],
  maxBlockSize: (val: TStyleValue): TReturn => [['maxHeight', val]],
  maxInlineSize: (val: TStyleValue): TReturn => [['maxWidth', val]],

  borderBlockWidth: shorthands.borderVerticalWidth,
  borderBlockStyle: shorthands.borderVerticalStyle,
  borderBlockColor: shorthands.borderVerticalColor,
  borderBlockStartWidth: (val: TStyleValue): TReturn => [
    ['borderTopWidth', val],
  ],
  borderBlockStartStyle: (val: TStyleValue): TReturn => [
    ['borderTopStyle', val],
  ],
  borderBlockStartColor: (val: TStyleValue): TReturn => [
    ['borderTopColor', val],
  ],
  borderBlockEndWidth: (val: TStyleValue): TReturn => [
    ['borderBottomWidth', val],
  ],
  borderBlockEndStyle: (val: TStyleValue): TReturn => [
    ['borderBottomStyle', val],
  ],
  borderBlockEndColor: (val: TStyleValue): TReturn => [
    ['borderBottomColor', val],
  ],
  borderInlineWidth: shorthands.borderHorizontalWidth,
  borderInlineStyle: shorthands.borderHorizontalStyle,
  borderInlineColor: shorthands.borderHorizontalColor,
  borderInlineStartWidth: (val: TStyleValue): TReturn => [
    ['borderStartWidth', val],
  ],
  borderInlineStartStyle: (val: TStyleValue): TReturn => [
    ['borderStartStyle', val],
  ],
  borderInlineStartColor: (val: TStyleValue): TReturn => [
    ['borderStartColor', val],
  ],
  borderInlineEndWidth: (val: TStyleValue): TReturn => [
    ['borderEndWidth', val],
  ],
  borderInlineEndStyle: (val: TStyleValue): TReturn => [
    ['borderEndStyle', val],
  ],
  borderInlineEndColor: (val: TStyleValue): TReturn => [
    ['borderEndColor', val],
  ],
  borderStartStartRadius: (val: TStyleValue): TReturn => [
    ['borderTopStartRadius', val],
  ],
  borderStartEndRadius: (val: TStyleValue): TReturn => [
    ['borderTopEndRadius', val],
  ],
  borderEndStartRadius: (val: TStyleValue): TReturn => [
    ['borderBottomStartRadius', val],
  ],
  borderEndEndRadius: (val: TStyleValue): TReturn => [
    ['borderBottomEndRadius', val],
  ],

  marginBlock: shorthands.marginVertical,
  marginBlockStart: (val: TStyleValue): TReturn => [['marginTop', val]],
  marginBlockEnd: (val: TStyleValue): TReturn => [['marginBottom', val]],
  marginInline: shorthands.marginHorizontal,
  marginInlineStart: (val: TStyleValue): TReturn => [['marginStart', val]],
  marginInlineEnd: (val: TStyleValue): TReturn => [['marginEnd', val]],
  paddingBlock: shorthands.paddingVertical,
  paddingBlockStart: (val: TStyleValue): TReturn => [['paddingTop', val]],
  paddingBlockEnd: (val: TStyleValue): TReturn => [['paddingBottom', val]],
  paddingInline: shorthands.paddingHorizontal,
  paddingInlineStart: (val: TStyleValue): TReturn => [['paddingStart', val]],
  paddingInlineEnd: (val: TStyleValue): TReturn => [['paddingEnd', val]],
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default (expansions: typeof expansions);
