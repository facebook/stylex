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
    ...shorthands.start(rawValue),
    ...shorthands.end(rawValue),
  ],
  insetBlock: (rawValue: TStyleValue): TReturn => [
    ['top', rawValue],
    ['bottom', rawValue],
  ],
  start: (rawValue: TStyleValue): TReturn => [
    ['start', rawValue],
    ['left', null],
    ['right', null],
  ],
  end: (rawValue: TStyleValue): TReturn => [
    ['end', rawValue],
    ['left', null],
    ['right', null],
  ],
  left: (rawValue: TStyleValue): TReturn => [
    ['left', rawValue],
    ['start', null],
    ['end', null],
  ],
  right: (rawValue: TStyleValue): TReturn => [
    ['right', rawValue],
    ['start', null],
    ['end', null],
  ],

  gap: (rawValue: TStyleValue): TReturn => {
    const [row, column = row] = splitValue(rawValue);

    return [
      ['rowGap', row],
      ['columnGap', column],
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
  marginHorizontal: (rawValue: TStyleValue): TReturn => [
    ...shorthands.marginStart(rawValue),
    ...shorthands.marginEnd(rawValue),
  ],
  marginStart: (rawValue: TStyleValue): TReturn => [
    ['marginStart', rawValue],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginEnd: (rawValue: TStyleValue): TReturn => [
    ['marginEnd', rawValue],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginLeft: (rawValue: TStyleValue): TReturn => [
    ['marginLeft', rawValue],
    ['marginStart', null],
    ['marginEnd', null],
  ],
  marginRight: (rawValue: TStyleValue): TReturn => [
    ['marginRight', rawValue],
    ['marginStart', null],
    ['marginEnd', null],
  ],
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
  paddingHorizontal: (val: TStyleValue): TReturn => [
    ...shorthands.paddingStart(val),
    ...shorthands.paddingEnd(val),
  ],
  paddingStart: (val: TStyleValue): TReturn => [
    ['paddingStart', val],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingEnd: (val: TStyleValue): TReturn => [
    ['paddingEnd', val],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingLeft: (val: TStyleValue): TReturn => [
    ['paddingLeft', val],
    ['paddingStart', null],
    ['paddingEnd', null],
  ],
  paddingRight: (val: TStyleValue): TReturn => [
    ['paddingRight', val],
    ['paddingStart', null],
    ['paddingEnd', null],
  ],
  paddingVertical: (val: TStyleValue): TReturn => [
    ['paddingTop', val],
    ['paddingBottom', val],
  ],
};

const aliases = {
  insetBlockStart: (val: TStyleValue): TReturn => [['top', val]],
  insetBlockEnd: (val: TStyleValue): TReturn => [['bottom', val]],
  insetInlineStart: shorthands.start,
  insetInlineEnd: shorthands.end,

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

  gridGap: shorthands.gap,
  gridRowGap: (value: TStyleValue): TReturn => [['rowGap', value]],
  gridColumnGap: (value: TStyleValue): TReturn => [['columnGap', value]],

  marginBlock: shorthands.marginVertical,
  marginBlockStart: (val: TStyleValue): TReturn => [['marginTop', val]],
  marginBlockEnd: (val: TStyleValue): TReturn => [['marginBottom', val]],
  marginInline: shorthands.marginHorizontal,
  marginInlineStart: (val: TStyleValue): TReturn => [['marginStart', val]],
  marginInlineEnd: (val: TStyleValue): TReturn => [['marginEnd', val]],

  overflowBlock: (value: TStyleValue): TReturn => [['overflowY', value]],
  overflowInline: (value: TStyleValue): TReturn => [['overflowX', value]],

  paddingBlock: shorthands.paddingVertical,
  paddingBlockStart: (val: TStyleValue): TReturn => [['paddingTop', val]],
  paddingBlockEnd: (val: TStyleValue): TReturn => [['paddingBottom', val]],
  paddingInline: shorthands.paddingHorizontal,
  paddingInlineStart: (val: TStyleValue): TReturn => [['paddingStart', val]],
  paddingInlineEnd: (val: TStyleValue): TReturn => [['paddingEnd', val]],

  scrollMarginBlockStart: (value: TStyleValue): TReturn => [
    ['scrollMarginTop', value],
  ],
  scrollMarginBlockEnd: (value: TStyleValue): TReturn => [
    ['scrollMarginBottom', value],
  ],
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default (expansions: typeof expansions);
