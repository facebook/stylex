/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TStyleValue } from '../common-types';

/// # Handle CSS shorthands in a React Native compatible way.
///
/// This means:
/// - disallowing certain properties altogether by throwing errors
/// - disallowing multiple values within many shorthands
/// - Treating certain non-standard properties as aliases for real CSS properties

type TReturn = $ReadOnlyArray<[string, TStyleValue]>;

const shorthands = {
  all: (_: TStyleValue): TReturn => {
    throw new Error('all is not supported');
  },
  animation: (_value: TStyleValue): TReturn => {
    throw new Error('animation is not supported');
  },
  background: (_value: TStyleValue): TReturn => {
    throw new Error(
      'background is not supported. Use background-color, border-image etc. instead.',
    );
  },
  border: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'border is not supported. Use border-width, border-style and border-color instead.',
    );
  },
  borderInline: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderInline is not supported. Use borderInlineWidth, borderInlineStyle and borderInlineColor instead.',
    );
  },
  // @Deprecated
  borderBlock: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderBlock is not supported. Use borderBlockWidth, borderBlockStyle and borderBlockColor instead.',
    );
  },

  // @Deprecated
  borderTop: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderTop is not supported. Use borderTopWidth, borderTopStyle and borderTopColor instead.',
    );
  },
  // @Deprecated
  borderInlineEnd: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderInlineEnd is not supported. Use borderInlineEndWidth, borderInlineEndStyle and borderInlineEndColor instead.',
    );
  },
  // @Deprecated
  borderRight: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderRight is not supported. Use borderRightWidth, borderRightStyle and borderRightColor instead.',
    );
  },
  // @Deprecated
  borderBottom: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderBottom is not supported. Use borderBottomWidth, borderBottomStyle and borderBottomColor instead.',
    );
  },
  // @Deprecated
  borderInlineStart: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderInlineStart is not supported. Use borderInlineStartWidth, borderInlineStartStyle and borderInlineStartColor instead.',
    );
  },
  // @Deprecated
  borderLeft: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      [
        '`borderLeft` is not supported.',
        'You could use `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`,',
        'but it is preferable to use `borderInlineStartWidth`, `borderInlineStartStyle` and `borderInlineStartColor`.',
      ].join(' '),
    );
  },
};

const aliases = {
  // @Deprecated
  borderHorizontal: shorthands.borderInline,
  // @Deprecated
  borderVertical: shorthands.borderBlock,
  // @Deprecated
  borderBlockStart: shorthands.borderTop,
  // @Deprecated
  borderEnd: shorthands.borderInlineEnd,
  // @Deprecated
  borderBlockEnd: shorthands.borderBottom,
  // @Deprecated
  borderStart: shorthands.borderInlineStart,

  blockSize: (val: TStyleValue): TReturn => [['height', val]],
  inlineSize: (val: TStyleValue): TReturn => [['width', val]],
  minBlockSize: (val: TStyleValue): TReturn => [['minHeight', val]],
  minInlineSize: (val: TStyleValue): TReturn => [['minWidth', val]],
  maxBlockSize: (val: TStyleValue): TReturn => [['maxHeight', val]],
  maxInlineSize: (val: TStyleValue): TReturn => [['maxWidth', val]],

  borderHorizontalWidth: (val: TStyleValue): TReturn => [
    ['borderInlineWidth', val],
  ],
  borderHorizontalStyle: (val: TStyleValue): TReturn => [
    ['borderInlineStyle', val],
  ],
  borderHorizontalColor: (val: TStyleValue): TReturn => [
    ['borderInlineColor', val],
  ],
  borderVerticalWidth: (val: TStyleValue): TReturn => [
    ['borderBlockWidth', val],
  ],
  borderVerticalStyle: (val: TStyleValue): TReturn => [
    ['borderBlockStyle', val],
  ],
  borderVerticalColor: (val: TStyleValue): TReturn => [
    ['borderBlockColor', val],
  ],

  borderBlockStartColor: (value: TStyleValue): TReturn => [
    ['borderTopColor', value],
  ],
  borderBlockEndColor: (value: TStyleValue): TReturn => [
    ['borderBottomColor', value],
  ],
  borderBlockStartStyle: (value: TStyleValue): TReturn => [
    ['borderTopStyle', value],
  ],
  borderBlockEndStyle: (value: TStyleValue): TReturn => [
    ['borderBottomStyle', value],
  ],
  borderBlockStartWidth: (value: TStyleValue): TReturn => [
    ['borderTopWidth', value],
  ],
  borderBlockEndWidth: (value: TStyleValue): TReturn => [
    ['borderBottomWidth', value],
  ],

  borderStartColor: (val: TStyleValue): TReturn => [
    ['borderInlineStartColor', val],
  ],
  borderEndColor: (val: TStyleValue): TReturn => [
    ['borderInlineEndColor', val],
  ],
  borderStartStyle: (val: TStyleValue): TReturn => [
    ['borderInlineStartStyle', val],
  ],
  borderEndStyle: (val: TStyleValue): TReturn => [
    ['borderInlineEndStyle', val],
  ],
  borderStartWidth: (val: TStyleValue): TReturn => [
    ['borderInlineStartWidth', val],
  ],
  borderEndWidth: (val: TStyleValue): TReturn => [
    ['borderInlineEndWidth', val],
  ],

  borderTopStartRadius: (value: TStyleValue): TReturn => [
    ['borderStartStartRadius', value],
  ],
  borderTopEndRadius: (value: TStyleValue): TReturn => [
    ['borderStartEndRadius', value],
  ],
  borderBottomStartRadius: (value: TStyleValue): TReturn => [
    ['borderEndStartRadius', value],
  ],
  borderBottomEndRadius: (value: TStyleValue): TReturn => [
    ['borderEndEndRadius', value],
  ],

  containIntrinsicBlockSize: (value: TStyleValue): TReturn => [
    ['containIntrinsicHeight', value],
  ],
  containIntrinsicInlineSize: (value: TStyleValue): TReturn => [
    ['containIntrinsicWidth', value],
  ],

  marginBlockStart: (value: TStyleValue): TReturn => [['marginTop', value]],
  marginBlockEnd: (value: TStyleValue): TReturn => [['marginBottom', value]],
  marginStart: (val: TStyleValue): TReturn => [['marginInlineStart', val]],
  marginEnd: (val: TStyleValue): TReturn => [['marginInlineEnd', val]],
  marginHorizontal: (val: TStyleValue): TReturn => [['marginInline', val]],
  marginVertical: (val: TStyleValue): TReturn => [['marginBlock', val]],

  overflowBlock: (value: TStyleValue): TReturn => [['overflowY', value]],
  overflowInline: (value: TStyleValue): TReturn => [['overflowX', value]],

  paddingBlockStart: (rawValue: TStyleValue): TReturn => [
    ['paddingTop', rawValue],
  ],
  paddingBlockEnd: (rawValue: TStyleValue): TReturn => [
    ['paddingBottom', rawValue],
  ],
  paddingStart: (val: TStyleValue): TReturn => [['paddingInlineStart', val]],
  paddingEnd: (val: TStyleValue): TReturn => [['paddingInlineEnd', val]],
  paddingHorizontal: (val: TStyleValue): TReturn => [['paddingInline', val]],
  paddingVertical: (val: TStyleValue): TReturn => [['paddingBlock', val]],

  scrollMarginBlockStart: (value: TStyleValue): TReturn => [
    ['scrollMarginTop', value],
  ],
  scrollMarginBlockEnd: (value: TStyleValue): TReturn => [
    ['scrollMarginBottom', value],
  ],

  insetBlockStart: (value: TStyleValue): TReturn => [['top', value]],
  insetBlockEnd: (value: TStyleValue): TReturn => [['bottom', value]],
  start: (val: TStyleValue): TReturn => [['insetInlineStart', val]],
  end: (val: TStyleValue): TReturn => [['insetInlineEnd', val]],
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default (expansions: $ReadOnly<{
  ...typeof shorthands,
  ...typeof aliases,
}>);
