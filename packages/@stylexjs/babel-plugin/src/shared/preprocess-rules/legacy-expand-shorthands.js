/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TStyleValue } from '../common-types';

import splitValue from '../utils/split-css-value';

export const LOGICAL_FLOAT_START_VAR = '--stylex-logical-end';
export const LOGICAL_FLOAT_END_VAR = '--stylex-logical-start';

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

const listStyleGlobalValues = new Set<string>([
  'inherit',
  'initial',
  'revert',
  'unset',
]);
const listStylePositionValues = new Set<string>(['inside', 'outside']);
const listStyleTypeRegex = /^([a-z-]+|".*?"|'.*?')$/;

const shorthands: $ReadOnly<{ [key: string]: (TStyleValue) => TReturn }> = {
  border: (rawValue: TStyleValue): TReturn => {
    return [
      ['borderTop', rawValue],
      ['borderInlineEnd', rawValue],
      ['borderBottom', rawValue],
      ['borderInlineStart', rawValue],
    ];
  },

  borderColor: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopColor', top],
      ['borderInlineEndColor', right],
      ['borderBottomColor', bottom],
      ['borderInlineStartColor', left],
    ];
  },
  borderHorizontal: (rawValue: TStyleValue): TReturn => {
    return [
      ['borderInlineStart', rawValue],
      ['borderInlineEnd', rawValue],
    ];
  },
  borderStyle: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopStyle', top],
      ['borderInlineEndStyle', right],
      ['borderBottomStyle', bottom],
      ['borderInlineStartStyle', left],
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
      ['borderInlineEndWidth', right],
      ['borderBottomWidth', bottom],
      ['borderInlineStartWidth', left],
    ];
  },

  borderHorizontalColor: (rawValue: TStyleValue): TReturn => [
    ['borderInlineStartColor', rawValue],
    ['borderInlineEndColor', rawValue],
  ],
  borderHorizontalStyle: (rawValue: TStyleValue): TReturn => [
    ['borderInlineStartStyle', rawValue],
    ['borderInlineEndStyle', rawValue],
  ],
  borderHorizontalWidth: (rawValue: TStyleValue): TReturn => [
    ['borderInlineStartWidth', rawValue],
    ['borderInlineEndWidth', rawValue],
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
      ['borderStartStartRadius', top],
      ['borderStartEndRadius', right],
      ['borderEndEndRadius', bottom],
      ['borderEndStartRadius', left],
    ];
  },

  containIntrinsicSize: (rawValue: TStyleValue): TReturn => {
    const parts = splitValue(rawValue);

    // combine any part which is "auto" with the subsequent part
    // ['auto', 'x', 'auto', 'y'] => ['auto x', 'auto y']
    // ['auto', 'x', 'y'] => ['auto x', 'y']
    // ['x', 'auto', 'y'] => ['x', 'auto y']
    // ['x', 'y'] => ['x', 'y']
    const [width, height = width] = parts.reduce(
      (coll: Array<number | string | null>, part: number | string | null) => {
        const lastElement = coll[coll.length - 1];
        if (lastElement === 'auto' && part != null) {
          return [...coll.slice(0, -1), `auto ${part}`];
        }
        return [...coll, part];
      },
      [],
    );

    return [
      ['containIntrinsicWidth', width],
      ['containIntrinsicHeight', height],
    ];
  },

  inset: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['top', top],
      ['insetInlineEnd', right],
      ['bottom', bottom],
      ['insetInlineStart', left],
    ];
  },
  insetInline: (rawValue: TStyleValue): TReturn => {
    const [start, end = start] = splitValue(rawValue);
    return [...shorthands.start(start), ...shorthands.end(end)];
  },
  insetBlock: (rawValue: TStyleValue): TReturn => {
    const [top, bottom = top] = splitValue(rawValue);
    return [
      ['top', top],
      ['bottom', bottom],
    ];
  },
  start: (rawValue: TStyleValue): TReturn => [
    ['insetInlineStart', rawValue],
    ['left', null],
    ['right', null],
  ],
  end: (rawValue: TStyleValue): TReturn => [
    ['insetInlineEnd', rawValue],
    ['left', null],
    ['right', null],
  ],
  left: (rawValue: TStyleValue): TReturn => [
    ['left', rawValue],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
  ],
  right: (rawValue: TStyleValue): TReturn => [
    ['right', rawValue],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
  ],

  gap: (rawValue: TStyleValue): TReturn => {
    const [row, column = row] = splitValue(rawValue);

    return [
      ['rowGap', row],
      ['columnGap', column],
    ];
  },

  listStyle: (rawValue: TStyleValue): TReturn => {
    if (rawValue == null) {
      return [
        ['listStyleType', null],
        ['listStylePosition', null],
        ['listStyleImage', null],
      ];
    }
    const parts = splitValue(rawValue);
    let image = null;
    let position = null;
    let type = null;

    // Handle global keywords - must be the only value
    if (
      parts.length === 1 &&
      parts[0] != null &&
      typeof parts[0] === 'string' &&
      listStyleGlobalValues.has(parts[0])
    ) {
      const globalValue = parts[0];
      return [
        ['listStyleType', globalValue],
        ['listStylePosition', globalValue],
        ['listStyleImage', globalValue],
      ];
    }

    // First pass: assign values that can only belong to one property
    const remainingParts = [];

    for (const part of parts) {
      if (part == null || typeof part !== 'string') continue;

      // Check for global keywords mixed with other values (invalid)
      // and use of `var()` which can't be disambiguated.
      if (listStyleGlobalValues.has(part) || part.includes('var(--')) {
        throw new Error(
          `invalid "listStyle" value of "${JSON.stringify(rawValue)}"`,
        );
      }
      // Check if it's a position value (unambiguous)
      else if (listStylePositionValues.has(part)) {
        if (position != null) {
          throw new Error(
            `invalid "listStyle" value of ${JSON.stringify(rawValue)}`,
          );
        }
        position = part;
      }
      // Check if it's a type value that's not 'none' (unambiguous)
      else if (part !== 'none' && listStyleTypeRegex.test(part)) {
        if (type != null) {
          throw new Error(
            `invalid "listStyle" value of ${JSON.stringify(rawValue)}`,
          );
        }
        type = part;
      }
      // Keep ambiguous values for second pass
      else {
        remainingParts.push(part);
      }
    }

    // Second pass: handle remaining parts (including 'none' and image values)
    for (const part of remainingParts) {
      // If 'none' and type is not yet assigned, assign to type
      if (part === 'none' && type == null) {
        type = part;
      }
      // Otherwise assign to image
      else {
        if (image != null) {
          throw new Error(
            `invalid "listStyle" value of ${JSON.stringify(rawValue)}`,
          );
        }
        image = part;
      }
    }

    return [
      ['listStyleType', type],
      ['listStylePosition', position],
      ['listStyleImage', image],
    ];
  },

  margin: (rawValue: TStyleValue): TReturn => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['marginTop', top],
      ['marginInlineEnd', right],
      ['marginBottom', bottom],
      ['marginInlineStart', left],
    ];
  },
  marginHorizontal: (rawValue: TStyleValue): TReturn => {
    const [start, end = start] = splitValue(rawValue);
    return [...shorthands.marginStart(start), ...shorthands.marginEnd(end)];
  },
  marginStart: (rawValue: TStyleValue): TReturn => [
    ['marginInlineStart', rawValue],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginEnd: (rawValue: TStyleValue): TReturn => [
    ['marginInlineEnd', rawValue],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginLeft: (rawValue: TStyleValue): TReturn => [
    ['marginLeft', rawValue],
    ['marginInlineStart', null],
    ['marginInlineEnd', null],
  ],
  marginRight: (rawValue: TStyleValue): TReturn => [
    ['marginRight', rawValue],
    ['marginInlineStart', null],
    ['marginInlineEnd', null],
  ],
  marginVertical: (rawValue: TStyleValue): TReturn => {
    const [top, bottom = top] = splitValue(rawValue);
    return [
      ['marginTop', top],
      ['marginBottom', bottom],
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
      ['paddingInlineEnd', right],
      ['paddingBottom', bottom],
      ['paddingInlineStart', left],
    ];
  },
  paddingHorizontal: (val: TStyleValue): TReturn => {
    const [start, end = start] = splitValue(val);
    return [...shorthands.paddingStart(start), ...shorthands.paddingEnd(end)];
  },
  paddingStart: (val: TStyleValue): TReturn => [
    ['paddingInlineStart', val],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingEnd: (val: TStyleValue): TReturn => [
    ['paddingInlineEnd', val],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingLeft: (val: TStyleValue): TReturn => [
    ['paddingLeft', val],
    ['paddingInlineStart', null],
    ['paddingInlineEnd', null],
  ],
  paddingRight: (val: TStyleValue): TReturn => [
    ['paddingRight', val],
    ['paddingInlineStart', null],
    ['paddingInlineEnd', null],
  ],
  paddingVertical: (val: TStyleValue): TReturn => {
    const [top, bottom = top] = splitValue(val);
    return [
      ['paddingTop', top],
      ['paddingBottom', bottom],
    ];
  },
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

  borderStart: (val: TStyleValue): TReturn => [['borderInlineStart', val]],
  borderEnd: (val: TStyleValue): TReturn => [['borderInlineEnd', val]],

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

  borderTopStartRadius: (val: TStyleValue): TReturn => [
    ['borderStartStartRadius', val],
  ],
  borderTopEndRadius: (val: TStyleValue): TReturn => [
    ['borderStartEndRadius', val],
  ],
  borderBottomStartRadius: (val: TStyleValue): TReturn => [
    ['borderEndStartRadius', val],
  ],
  borderBottomEndRadius: (val: TStyleValue): TReturn => [
    ['borderEndEndRadius', val],
  ],

  gridGap: shorthands.gap,
  gridRowGap: (value: TStyleValue): TReturn => [['rowGap', value]],
  gridColumnGap: (value: TStyleValue): TReturn => [['columnGap', value]],

  marginBlock: shorthands.marginVertical,
  marginBlockStart: (val: TStyleValue): TReturn => [['marginTop', val]],
  marginBlockEnd: (val: TStyleValue): TReturn => [['marginBottom', val]],
  marginInline: shorthands.marginHorizontal,

  overflowBlock: (value: TStyleValue): TReturn => [['overflowY', value]],
  overflowInline: (value: TStyleValue): TReturn => [['overflowX', value]],

  paddingBlock: shorthands.paddingVertical,
  paddingBlockStart: (val: TStyleValue): TReturn => [['paddingTop', val]],
  paddingBlockEnd: (val: TStyleValue): TReturn => [['paddingBottom', val]],
  paddingInline: shorthands.paddingHorizontal,

  scrollMarginBlockStart: (value: TStyleValue): TReturn => [
    ['scrollMarginTop', value],
  ],
  scrollMarginBlockEnd: (value: TStyleValue): TReturn => [
    ['scrollMarginBottom', value],
  ],
  float: (value: TStyleValue): TReturn => {
    if (value === 'inline-start' || value === 'start') {
      return [['float', `var(${LOGICAL_FLOAT_START_VAR})`]];
    } else if (value === 'inline-end' || value === 'end') {
      return [['float', `var(${LOGICAL_FLOAT_END_VAR})`]];
    }
    return [['float', value]];
  },

  clear: (value: TStyleValue): TReturn => {
    if (value === 'inline-start' || value === 'start') {
      return [['clear', `var(${LOGICAL_FLOAT_START_VAR})`]];
    } else if (value === 'inline-end' || value === 'end') {
      return [['clear', `var(${LOGICAL_FLOAT_END_VAR})`]];
    }
    return [['clear', value]];
  },
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default expansions as typeof expansions;
