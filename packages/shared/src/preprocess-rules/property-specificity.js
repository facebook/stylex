/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import splitValue from '../utils/split-css-value';

/// # Handle CSS shorthands in a React Native compatible way.
///
/// This means:
/// - disallowing certain properties altogether by throwing errors
/// - disallowing multiple values within many shorthands
/// - Treating certain non-standard properties as aliases for real CSS properties

const shorthands = {
  all: (_: string) => {
    throw new Error('all is not supported');
  },
  animation: (value: string): Array<[string, string]> => {
    throw new Error('animation is not supported');
  },
  background: (value: string): Array<[string, string]> => {
    throw new Error(
      'background is not supported. Use background-color, border-image etc. instead.'
    );
  },
  border: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'border is not supported. Use border-width, border-style and border-color instead.'
    );
  },
  borderInline: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderInline is not supported. Use borderInlineWidth, borderInlineStyle and borderInlineColor instead.'
    );
  },
  // @Deprecated
  borderBlock: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderBlock is not supported. Use borderBlockWidth, borderBlockStyle and borderBlockColor instead.'
    );
  },

  // @Deprecated
  borderTop: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderTop is not supported. Use borderTopWidth, borderTopStyle and borderTopColor instead.'
    );
  },
  // @Deprecated
  borderInlineEnd: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderInlineEnd is not supported. Use borderInlineEndWidth, borderInlineEndStyle and borderInlineEndColor instead.'
    );
  },
  // @Deprecated
  borderRight: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderRight is not supported. Use borderRightWidth, borderRightStyle and borderRightColor instead.'
    );
  },
  // @Deprecated
  borderBottom: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderBottom is not supported. Use borderBottomWidth, borderBottomStyle and borderBottomColor instead.'
    );
  },
  // @Deprecated
  borderInlineStart: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      'borderInlineStart is not supported. Use borderInlineStartWidth, borderInlineStartStyle and borderInlineStartColor instead.'
    );
  },
  // @Deprecated
  borderLeft: (rawValue: string): Array<[string, string]> => {
    throw new Error(
      [
        '`borderLeft` is not supported.',
        'You could use `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`,',
        'but it is preferable to use `borderInlineStartWidth`, `borderInlineStartStyle` and `borderInlineStartColor`.',
      ].join(' ')
    );
  },

  margin: (value: string): Array<[string, string]> => {
    const values = typeof value === 'number' ? [value] : splitValue(value);
    if (values.length === 1) {
      return [['margin', values[0]]];
    } else {
      throw new Error(
        'margin shorthand with multiple values is not supported. Use marginTop, marginInlineEnd, marginBottom and marginInlineStart instead.'
      );
    }
  },

  padding: (rawValue: string): Array<[string, string]> => {
    const values =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);
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

  borderHorizontalWidth: (value: string): Array<[string, string]> => [
    ['borderInlineWidth', value],
  ],
  borderHorizontalStyle: (value: string): Array<[string, string]> => [
    ['borderInlineStyle', value],
  ],
  borderHorizontalColor: (value: string): Array<[string, string]> => [
    ['borderInlineColor', value],
  ],
  borderVerticalWidth: (value: string): Array<[string, string]> => [
    ['borderBlockWidth', value],
  ],
  borderVerticalStyle: (value: string): Array<[string, string]> => [
    ['borderBlockStyle', value],
  ],
  borderVerticalColor: (value: string): Array<[string, string]> => [
    ['borderBlockColor', value],
  ],

  borderBlockStartColor: (value: string): Array<[string, string]> => [
    ['borderTopColor', value],
  ],
  borderBlockEndColor: (value: string): Array<[string, string]> => [
    ['borderBottomColor', value],
  ],
  borderBlockStartStyle: (value: string): Array<[string, string]> => [
    ['borderTopStyle', value],
  ],
  borderBlockEndStyle: (value: string): Array<[string, string]> => [
    ['borderBottomStyle', value],
  ],
  borderBlockStartWidth: (value: string): Array<[string, string]> => [
    ['borderTopWidth', value],
  ],
  borderBlockEndWidth: (value: string): Array<[string, string]> => [
    ['borderBottomWidth', value],
  ],

  borderStartColor: (value: string): Array<[string, string]> => [
    ['borderInlineStartColor', value],
  ],
  borderEndColor: (value: string): Array<[string, string]> => [
    ['borderInlineEndColor', value],
  ],
  borderStartStyle: (value: string): Array<[string, string]> => [
    ['borderInlineStartStyle', value],
  ],
  borderEndStyle: (value: string): Array<[string, string]> => [
    ['borderInlineEndStyle', value],
  ],
  borderStartWidth: (value: string): Array<[string, string]> => [
    ['borderInlineStartWidth', value],
  ],
  borderEndWidth: (value: string): Array<[string, string]> => [
    ['borderInlineEndWidth', value],
  ],

  borderTopStartRadius: (value: string): Array<[string, string]> => [
    ['borderStartStartRadius', value],
  ],
  borderTopEndRadius: (value: string): Array<[string, string]> => [
    ['borderStartEndRadius', value],
  ],
  borderBottomStartRadius: (value: string): Array<[string, string]> => [
    ['borderEndStartRadius', value],
  ],
  borderBottomEndRadius: (value: string): Array<[string, string]> => [
    ['borderEndEndRadius', value],
  ],

  marginBlockStart: (value: string): Array<[string, string]> => [
    ['marginTop', value],
  ],
  marginBlockEnd: (value: string): Array<[string, string]> => [
    ['marginBottom', value],
  ],

  marginStart: (value: string): Array<[string, string]> => [
    ['marginInlineStart', value],
  ],
  marginEnd: (value: string): Array<[string, string]> => [
    ['marginInlineEnd', value],
  ],
  marginHorizontal: (value: string): Array<[string, string]> => [
    ['marginInline', value],
  ],
  marginVertical: (value: string): Array<[string, string]> => [
    ['marginBlock', value],
  ],

  paddingBlockStart: (rawValue: string): Array<[string, string]> => [
    ['paddingTop', rawValue],
  ],
  paddingBlockEnd: (rawValue: string): Array<[string, string]> => [
    ['paddingBottom', rawValue],
  ],
  paddingStart: (value: string): Array<[string, string]> => [
    ['paddingInlineStart', value],
  ],
  paddingEnd: (value: string): Array<[string, string]> => [
    ['paddingInlineEnd', value],
  ],
  paddingHorizontal: (value: string): Array<[string, string]> => [
    ['paddingInline', value],
  ],
  paddingVertical: (value: string): Array<[string, string]> => [
    ['paddingBlock', value],
  ],

  insetBlockStart: (value: string): Array<[string, string]> => [['top', value]],
  insetBlockEnd: (value: string): Array<[string, string]> => [
    ['bottom', value],
  ],
  start: (value: string): Array<[string, string]> => [
    ['insetInlineStart', value],
  ],
  end: (value: string): Array<[string, string]> => [['insetInlineEnd', value]],
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default expansions;
