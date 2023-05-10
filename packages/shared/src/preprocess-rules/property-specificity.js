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
      'background is not supported. Use background-color, border-image etc. instead.'
    );
  },
  border: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'border is not supported. Use border-width, border-style and border-color instead.'
    );
  },
  borderInline: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderInline is not supported. Use borderInlineWidth, borderInlineStyle and borderInlineColor instead.'
    );
  },
  // @Deprecated
  borderBlock: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderBlock is not supported. Use borderBlockWidth, borderBlockStyle and borderBlockColor instead.'
    );
  },

  // @Deprecated
  borderTop: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderTop is not supported. Use borderTopWidth, borderTopStyle and borderTopColor instead.'
    );
  },
  // @Deprecated
  borderInlineEnd: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderInlineEnd is not supported. Use borderInlineEndWidth, borderInlineEndStyle and borderInlineEndColor instead.'
    );
  },
  // @Deprecated
  borderRight: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderRight is not supported. Use borderRightWidth, borderRightStyle and borderRightColor instead.'
    );
  },
  // @Deprecated
  borderBottom: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderBottom is not supported. Use borderBottomWidth, borderBottomStyle and borderBottomColor instead.'
    );
  },
  // @Deprecated
  borderInlineStart: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      'borderInlineStart is not supported. Use borderInlineStartWidth, borderInlineStartStyle and borderInlineStartColor instead.'
    );
  },
  // @Deprecated
  borderLeft: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      [
        '`borderLeft` is not supported.',
        'You could use `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`,',
        'but it is preferable to use `borderInlineStartWidth`, `borderInlineStartStyle` and `borderInlineStartColor`.',
      ].join(' ')
    );
  },

  margin: (value: TStyleValue): TReturn => {
    const values = splitValue(value);
    if (values.length === 1) {
      return [['margin', values[0]]];
    } else {
      throw new Error(
        'margin shorthand with multiple values is not supported. Use marginTop, marginInlineEnd, marginBottom and marginInlineStart instead.'
      );
    }
  },

  padding: (rawValue: TStyleValue): TReturn => {
    const values = splitValue(rawValue);
    if (values.length === 1) {
      return [['padding', values[0]]];
    }

    throw new Error(
      'padding shorthand with multiple values is not supported. Use paddingTop, paddingInlineEnd, paddingBottom and paddingInlineStart instead.'
    );
  },
};

const aliases = {
  // @UNSUPPORTED
  borderHorizontal: shorthands.borderInline,
  // @UNSUPPORTED
  borderVertical: shorthands.borderBlock,
  // @UNSUPPORTED
  borderBlockStart: shorthands.borderTop,
  // @UNSUPPORTED
  borderEnd: shorthands.borderInlineEnd,
  // @UNSUPPORTED
  borderBlockEnd: shorthands.borderBottom,
  // @UNSUPPORTED
  borderStart: shorthands.borderInlineStart,

  borderHorizontalWidth: (value: TStyleValue): TReturn => [
    ['borderInlineWidth', value],
  ],
  borderHorizontalStyle: (value: TStyleValue): TReturn => [
    ['borderInlineStyle', value],
  ],
  borderHorizontalColor: (value: TStyleValue): TReturn => [
    ['borderInlineColor', value],
  ],
  borderVerticalWidth: (value: TStyleValue): TReturn => [
    ['borderBlockWidth', value],
  ],
  borderVerticalStyle: (value: TStyleValue): TReturn => [
    ['borderBlockStyle', value],
  ],
  borderVerticalColor: (value: TStyleValue): TReturn => [
    ['borderBlockColor', value],
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

  borderStartColor: (value: TStyleValue): TReturn => [
    ['borderInlineStartColor', value],
  ],
  borderEndColor: (value: TStyleValue): TReturn => [
    ['borderInlineEndColor', value],
  ],
  borderStartStyle: (value: TStyleValue): TReturn => [
    ['borderInlineStartStyle', value],
  ],
  borderEndStyle: (value: TStyleValue): TReturn => [
    ['borderInlineEndStyle', value],
  ],
  borderStartWidth: (value: TStyleValue): TReturn => [
    ['borderInlineStartWidth', value],
  ],
  borderEndWidth: (value: TStyleValue): TReturn => [
    ['borderInlineEndWidth', value],
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

  marginBlockStart: (value: TStyleValue): TReturn => [['marginTop', value]],
  marginBlockEnd: (value: TStyleValue): TReturn => [['marginBottom', value]],

  marginStart: (value: TStyleValue): TReturn => [['marginInlineStart', value]],
  marginEnd: (value: TStyleValue): TReturn => [['marginInlineEnd', value]],
  marginHorizontal: (value: TStyleValue): TReturn => [['marginInline', value]],
  marginVertical: (value: TStyleValue): TReturn => [['marginBlock', value]],

  paddingBlockStart: (rawValue: TStyleValue): TReturn => [
    ['paddingTop', rawValue],
  ],
  paddingBlockEnd: (rawValue: TStyleValue): TReturn => [
    ['paddingBottom', rawValue],
  ],
  paddingStart: (value: TStyleValue): TReturn => [
    ['paddingInlineStart', value],
  ],
  paddingEnd: (value: TStyleValue): TReturn => [['paddingInlineEnd', value]],
  paddingHorizontal: (value: TStyleValue): TReturn => [
    ['paddingInline', value],
  ],
  paddingVertical: (value: TStyleValue): TReturn => [['paddingBlock', value]],

  insetBlockStart: (value: TStyleValue): TReturn => [['top', value]],
  insetBlockEnd: (value: TStyleValue): TReturn => [['bottom', value]],
  start: (value: TStyleValue): TReturn => [['insetInlineStart', value]],
  end: (value: TStyleValue): TReturn => [['insetInlineEnd', value]],
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default expansions;
