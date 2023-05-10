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

/**
 * Shorthand properties:
 * - [x] all - Should be banned
 * - [x] animation
 * - [x] background
 * - [x] border
 * - [x] border-block-end
 * - [x] border-block-start
 * - [x] border-bottom
 * - [x] border-color
 * - [x] border-image
 * - [x] border-inline-end
 * - [x] border-inline-start
 * - [x] border-left
 * - [x] border-radius
 * - [x] border-right
 * - [x] border-style
 * - [x] border-top
 * - [x] border-width
 * - [x] column-rule
 * - [x] columns
 * - [x] container
 * - [x] flex
 * - [x] flex-flow
 * - [x] font
 * - [x] gap
 * - [x] grid
 * - [x] grid-area
 * - [x] grid-column
 * - [x] grid-row
 * - [x] grid-template
 * - [x] inset
 * - [x] inset-block
 * - [x] inset-inline
 * - [x] list-style
 * - [x] margin
 * - [x] mask
 * - [x] offset
 * - [x] outline
 * - [x] overflow
 * - [x] padding
 * - [x] place-content
 * - [x] place-items
 * - [x] place-self
 * - [x] scroll-margin
 * - [x] scroll-padding
 * - [x] text-decoration
 * - [x] text-emphasis
 * - [x] transition
 */

type TReturn = $ReadOnlyArray<[string, TStyleValue]>;

const shorthands = {
  all: (_: TStyleValue): TReturn => {
    throw new Error('all is not supported');
  },
  animation: (value: TStyleValue): Array<[string, TStyleValue]> => [
    ['animation', value],
    ['animationName', null],
    ['animationDuration', null],
    ['animationTimingFunction', null],
    ['animationDelay', null],
    ['animationIterationCount', null],
    ['animationDirection', null],
    ['animationFillMode', null],
    ['animationPlayState', null],
  ],

  background: (value: TStyleValue): TReturn => [
    ['background', value],
    ['backgroundAttachment', null],
    ['backgroundClip', null],
    ['backgroundColor', null],
    ['backgroundImage', null],
    ['backgroundOrigin', null],
    ['backgroundPosition', null],
    ['backgroundRepeat', null],
    ['backgroundSize', null],
  ],

  // These will be removed later, matching the properties with React Native.
  // For now, we're compiling them to the React Native properties.
  // @Deprecated
  border: (rawValue: TStyleValue): TReturn => {
    if (typeof rawValue === 'number') {
      return shorthands.borderWidth(rawValue);
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ...shorthands.borderWidth(width),
      ...shorthands.borderStyle(style),
      ...shorthands.borderColor(color),
    ];
  },
  // @Deprecated
  borderInline: (rawValue: TStyleValue): TReturn => {
    if (typeof rawValue === 'number') {
      return [
        ['borderInlineWidth', rawValue],
        ['borderInlineStartWidth', null],
        ['borderInlineEndWidth', null],
      ];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ...shorthands.borderInlineWidth(width),
      ...shorthands.borderInlineStyle(style),
      ...shorthands.borderInlineColor(color),
    ];
  },
  // @Deprecated
  borderBlock: (rawValue: TStyleValue): TReturn => {
    if (typeof rawValue === 'number') {
      return [
        ['borderBlockWidth', rawValue],
        ['borderTopWidth', null],
        ['borderBottomWidth', null],
      ];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ...shorthands.borderBlockWidth(width),
      ...shorthands.borderBlockStyle(style),
      ...shorthands.borderBlockColor(color),
    ];
  },

  // @Deprecated
  borderTop: (rawValue: TStyleValue): TReturn => {
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
  // @Deprecated
  borderInlineEnd: (rawValue: TStyleValue): TReturn => {
    if (typeof rawValue === 'number') {
      return [['borderInlineEndWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderInlineEndWidth', width],
      ['borderInlineEndStyle', style],
      ['borderInlineEndColor', color],
    ];
  },
  // @Deprecated
  borderRight: (_rawValue: TStyleValue): TReturn => {
    throw new Error(
      [
        '`borderRight` is not supported.',
        'You could use `borderRightWidth`, `borderRightStyle` and `borderRightColor`,',
        'but it is preferable to use `borderInlineEndWidth`, `borderInlineEndStyle` and `borderInlineEndColor`.',
      ].join(' ')
    );
  },
  // @Deprecated
  borderBottom: (rawValue: TStyleValue): TReturn => {
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
  // @Deprecated
  borderInlineStart: (rawValue: TStyleValue): TReturn => {
    if (typeof rawValue === 'number') {
      return [['borderInlineStartWidth', rawValue]];
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ['borderInlineStartWidth', width],
      ['borderInlineStartStyle', style],
      ['borderInlineStartColor', color],
    ];
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
  borderInlineWidth: (rawValue: TStyleValue): TReturn => [
    ['borderInlineWidth', rawValue],
    ['borderInlineStartWidth', null],
    ['borderLeftWidth', null],
    ['borderInlineEndWidth', null],
    ['borderRightWidth', null],
  ],
  borderInlineStyle: (rawValue: TStyleValue): TReturn => [
    ['borderInlineStyle', rawValue],
    ['borderInlineStartStyle', null],
    ['borderLeftStyle', null],
    ['borderInlineEndStyle', null],
    ['borderRightStyle', null],
  ],
  borderInlineColor: (rawValue: TStyleValue): TReturn => [
    ['borderInlineColor', rawValue],
    ['borderInlineStartColor', null],
    ['borderLeftColor', null],
    ['borderInlineEndColor', null],
    ['borderRightColor', null],
  ],
  borderBlockWidth: (rawValue: TStyleValue): TReturn => [
    ['borderBlockWidth', rawValue],
    ['borderTopWidth', null],
    ['borderBottomWidth', null],
  ],
  borderBlockStyle: (rawValue: TStyleValue): TReturn => [
    ['borderBlockStyle', rawValue],
    ['borderTopStyle', null],
    ['borderBottomStyle', null],
  ],
  borderBlockColor: (rawValue: TStyleValue): TReturn => [
    ['borderBlockColor', rawValue],
    ['borderTopColor', null],
    ['borderBottomColor', null],
  ],
  borderColor: (value: TStyleValue): TReturn => [
    ['borderColor', value],
    ['borderTopColor', null],
    ['borderInlineEndColor', null],
    ['borderRightColor', null],
    ['borderBottomColor', null],
    ['borderInlineStartColor', null],
    ['borderLeftColor', null],
  ],
  borderStyle: (value: TStyleValue): TReturn => [
    ['borderStyle', value],
    ['borderTopStyle', null],
    ['borderInlineEndStyle', null],
    ['borderRightStyle', null],
    ['borderBottomStyle', null],
    ['borderInlineStartStyle', null],
    ['borderLeftStyle', null],
  ],
  borderWidth: (value: TStyleValue): TReturn => [
    ['borderWidth', value],
    ['borderTopWidth', null],
    ['borderInlineEndWidth', null],
    ['borderRightWidth', null],
    ['borderBottomWidth', null],
    ['borderInlineStartWidth', null],
    ['borderLeftWidth', null],
  ],
  borderInlineStartColor: (value: TStyleValue): TReturn => [
    ['borderInlineStartColor', value],
    ['borderLeftColor', null],
    ['borderRightColor', null],
  ],
  borderInlineEndColor: (value: TStyleValue): TReturn => [
    ['borderInlineEndColor', value],
    ['borderLeftColor', null],
    ['borderRightColor', null],
  ],
  borderInlineStartStyle: (value: TStyleValue): TReturn => [
    ['borderInlineStartStyle', value],
    ['borderLeftStyle', null],
    ['borderRightStyle', null],
  ],
  borderInlineEndStyle: (value: TStyleValue): TReturn => [
    ['borderInlineEndStyle', value],
    ['borderLeftStyle', null],
    ['borderRightStyle', null],
  ],
  borderInlineStartWidth: (value: TStyleValue): TReturn => [
    ['borderInlineStartWidth', value],
    ['borderLeftWidth', null],
    ['borderRightWidth', null],
  ],
  borderInlineEndWidth: (value: TStyleValue): TReturn => [
    ['borderInlineEndWidth', value],
    ['borderLeftWidth', null],
    ['borderRightWidth', null],
  ],
  borderLeftColor: (value: TStyleValue): TReturn => [
    ['borderLeftColor', value],
    ['borderInlineStartColor', null],
    ['borderInlineEndColor', null],
  ],
  borderRightColor: (value: TStyleValue): TReturn => [
    ['borderRightColor', value],
    ['borderInlineStartColor', null],
    ['borderInlineEndColor', null],
  ],
  borderLeftStyle: (value: TStyleValue): TReturn => [
    ['borderLeftStyle', value],
    ['borderInlineStartStyle', null],
    ['borderInlineEndStyle', null],
  ],
  borderRightStyle: (value: TStyleValue): TReturn => [
    ['borderRightStyle', value],
    ['borderInlineStartStyle', null],
    ['borderInlineEndStyle', null],
  ],
  borderLeftWidth: (value: TStyleValue): TReturn => [
    ['borderLeftWidth', value],
    ['borderInlineStartWidth', null],
    ['borderInlineEndWidth', null],
  ],
  borderRightWidth: (value: TStyleValue): TReturn => [
    ['borderRightWidth', value],
    ['borderInlineStartWidth', null],
    ['borderInlineEndWidth', null],
  ],

  borderRadius: (value: TStyleValue): TReturn => {
    const values = typeof value === 'number' ? [value] : splitValue(value);
    if (values.length === 1) {
      return [
        ['borderRadius', value],
        // // logical constituents
        ['borderStartStartRadius', null],
        ['borderStartEndRadius', null],
        ['borderEndStartRadius', null],
        ['borderEndEndRadius', null],
        // physical constituents
        ['borderTopLeftRadius', null],
        ['borderTopRightRadius', null],
        ['borderBottomLeftRadius', null],
        ['borderBottomRightRadius', null],
      ];
    }

    // @Deprecated
    const [
      startStart,
      startEnd = startStart,
      endEnd = startStart,
      endStart = startEnd,
    ] = values;
    return [
      // split into logical consituents
      ['borderStartStartRadius', startStart],
      ['borderStartEndRadius', startEnd],
      ['borderEndEndRadius', endEnd],
      ['borderEndStartRadius', endStart],
      // unset physical consituents
      ['borderTopLeftRadius', null],
      ['borderTopRightRadius', null],
      ['borderBottomLeftRadius', null],
      ['borderBottomRightRadius', null],
    ];
  },
  borderStartStartRadius: (value: TStyleValue): TReturn => [
    ['borderStartStartRadius', value],
    ['borderTopLeftRadius', null],
    ['borderTopRightRadius', null],
  ],
  borderStartEndRadius: (value: TStyleValue): TReturn => [
    ['borderStartEndRadius', value],
    ['borderTopLeftRadius', null],
    ['borderTopRightRadius', null],
  ],
  borderEndStartRadius: (value: TStyleValue): TReturn => [
    ['borderEndStartRadius', value],
    ['borderBottomLeftRadius', null],
    ['borderBottomRightRadius', null],
  ],
  borderEndEndRadius: (value: TStyleValue): TReturn => [
    ['borderEndEndRadius', value],
    ['borderBottomLeftRadius', null],
    ['borderBottomRightRadius', null],
  ],
  borderTopLeftRadius: (value: TStyleValue): TReturn => [
    ['borderTopLeftRadius', value],
    ['borderStartStartRadius', null],
    ['borderStartEndRadius', null],
  ],
  borderTopRightRadius: (value: TStyleValue): TReturn => [
    ['borderTopRightRadius', value],
    ['borderStartStartRadius', null],
    ['borderStartEndRadius', null],
  ],
  borderBottomLeftRadius: (value: TStyleValue): TReturn => [
    ['borderBottomLeftRadius', value],
    ['borderEndStartRadius', null],
    ['borderEndEndRadius', null],
  ],
  borderBottomRightRadius: (value: TStyleValue): TReturn => [
    ['borderBottomRightRadius', value],
    ['borderEndStartRadius', null],
    ['borderEndEndRadius', null],
  ],

  columnRule: (value: TStyleValue): TReturn => [
    ['columnRule', value],
    ['columnRuleWidth', null],
    ['columnRuleStyle', null],
    ['columnRuleColor', null],
  ],
  columns: (value: TStyleValue): TReturn => [
    ['columns', value],
    ['columnCount', null],
    ['columnWidth', null],
  ],

  container: (value: TStyleValue): TReturn => [
    ['container', value],
    ['containerName', null],
    ['containerType', null],
  ],

  flex: (value: TStyleValue): TReturn => [
    ['flex', value],
    ['flexGrow', null],
    ['flexShrink', null],
    ['flexBasis', null],
  ],
  flexFlow: (value: TStyleValue): TReturn => [
    ['flexFlow', value],
    ['flexDirection', null],
    ['flexWrap', null],
  ],
  // @Deprecated ?
  font: (value: TStyleValue): TReturn => [
    ['font', value],
    ['fontFamily', null],
    ['fontSize', null],
    ['fontStretch', null],
    ['fontStyle', null],
    ['fontVariant', null],
    ['fontWeight', null],
    ['lineHeight', null],
  ],
  gap: (value: TStyleValue): TReturn => [
    ['gap', value],
    ['rowGap', null],
    ['columnGap', null],
  ],
  grid: (value: TStyleValue): TReturn => [
    ['grid', value],
    ['gridTemplate', null],
    ['gridTemplateAreas', null],
    ['gridTemplateColumns', null],
    ['gridTemplateRows', null],

    ['gridAutoRows', null],
    ['gridAutoColumns', null],
    ['gridAutoFlow', null],
  ],
  gridArea: (value: TStyleValue): TReturn => [
    ['gridArea', value],
    ['gridRow', null],
    ['gridRowStart', null],
    ['gridRowEnd', null],
    ['gridColumn', null],
    ['gridColumnStart', null],
    ['gridColumnEnd', null],
  ],
  gridRow: (value: TStyleValue): TReturn => [
    ['gridRow', value],
    ['gridRowStart', null],
    ['gridRowEnd', null],
  ],
  gridColumn: (value: TStyleValue): TReturn => [
    ['gridColumn', value],
    ['gridColumnStart', null],
    ['gridColumnEnd', null],
  ],
  gridTemplate: (value: TStyleValue): TReturn => [
    ['gridTemplate', value],
    ['gridTemplateAreas', null],
    ['gridTemplateColumns', null],
    ['gridTemplateRows', null],
  ],
  inset: (value: TStyleValue): TReturn => [
    ['inset', value],
    ['insetInline', null],
    ['insetBlock', null],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
    ['top', null],
    ['right', null],
    ['bottom', null],
    ['left', null],
  ],
  insetInline: (value: TStyleValue): TReturn => [
    ['insetInline', value],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
    ['left', null],
    ['right', null],
  ],
  insetBlock: (value: TStyleValue): TReturn => [
    ['insetBlock', value],
    ['top', null],
    ['bottom', null],
  ],
  insetInlineStart: (value: TStyleValue): TReturn => [
    ['insetInlineStart', value],
    ['left', null],
    ['right', null],
  ],
  insetInlineEnd: (value: TStyleValue): TReturn => [
    ['insetInlineEnd', value],
    ['left', null],
    ['right', null],
  ],
  left: (value: TStyleValue): TReturn => [
    ['left', value],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
  ],
  right: (value: TStyleValue): TReturn => [
    ['right', value],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
  ],

  listStyle: (value: TStyleValue): TReturn => [
    ['listStyle', value],
    ['listStyleImage', null],
    ['listStylePosition', null],
    ['listStyleType', null],
  ],

  margin: (value: TStyleValue): TReturn => {
    const values = typeof value === 'number' ? [value] : splitValue(value);
    if (values.length === 1) {
      return [
        ['margin', values[0]],
        ['marginInlineStart', null],
        ['marginLeft', null],
        ['marginInlineEnd', null],
        ['marginRight', null],
        ['marginTop', null],
        ['marginBottom', null],
      ];
    }
    // @Deprecated
    const [top, right = top, bottom = top, left = right] = values;
    return [
      ['marginTop', top],
      ['marginInlineEnd', right],
      ['marginBottom', bottom],
      ['marginInlineStart', left],
      ['marginLeft', null],
      ['marginRight', null],
    ];
  },
  marginInline: (value: TStyleValue): TReturn => [
    ['marginInline', value],
    ['marginInlineStart', null],
    ['marginLeft', null],
    ['marginInlineEnd', null],
    ['marginRight', null],
  ],
  marginBlock: (value: TStyleValue): TReturn => [
    ['marginBlock', value],
    ['marginTop', null],
    ['marginBottom', null],
  ],
  marginInlineStart: (value: TStyleValue): TReturn => [
    ['marginInlineStart', value],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginInlineEnd: (value: TStyleValue): TReturn => [
    ['marginInlineEnd', value],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginLeft: (value: TStyleValue): TReturn => [
    ['marginLeft', value],
    ['marginInlineStart', null],
    ['marginInlineEnd', null],
  ],
  marginRight: (value: TStyleValue): TReturn => [
    ['marginRight', value],
    ['marginInlineStart', null],
    ['marginInlineEnd', null],
  ],

  mask: (value: TStyleValue): TReturn => [
    ['mask', value],
    ['maskClip', null],
    ['maskComposite', null],
    ['maskImage', null],
    ['maskMode', null],
    ['maskOrigin', null],
    ['maskPosition', null],
    ['maskRepeat', null],
    ['maskSize', null],
  ],

  offset: (value: TStyleValue): TReturn => [
    ['offset', value],
    ['offsetAnchor', null],
    ['offsetDistance', null],
    ['offsetPath', null],
    ['offsetPosition', null],
    ['offsetRotate', null],
  ],

  outline: (value: TStyleValue): TReturn => [
    ['outline', value],
    ['outlineColor', null],
    ['outlineStyle', null],
    ['outlineWidth', null],
  ],

  overflow: (value: TStyleValue): TReturn => [
    ['overflow', value],
    ['overflowX', null],
    ['overflowY', null],
  ],

  padding: (rawValue: TStyleValue): TReturn => {
    const values =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);
    if (values.length === 1) {
      return [
        ['padding', values[0]],
        ['paddingStart', null],
        ['paddingLeft', null],
        ['paddingEnd', null],
        ['paddingRight', null],
        ['paddingTop', null],
        ['paddingBottom', null],
      ];
    }
    // @Deprecated
    const [top, right = top, bottom = top, left = right] = values;
    return [
      ['paddingTop', top],
      ['paddingEnd', right],
      ['paddingBottom', bottom],
      ['paddingStart', left],
    ];
  },
  paddingInline: (rawValue: TStyleValue): TReturn => [
    ['paddingInline', rawValue],
    ['paddingStart', null],
    ['paddingLeft', null],
    ['paddingEnd', null],
    ['paddingRight', null],
  ],
  paddingBlock: (rawValue: TStyleValue): TReturn => [
    ['paddingBlock', rawValue],
    ['paddingTop', null],
    ['paddingBottom', null],
  ],
  paddingInlineStart: (value: TStyleValue): TReturn => [
    ['paddingInlineStart', value],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingInlineEnd: (value: TStyleValue): TReturn => [
    ['paddingInlineEnd', value],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingLeft: (value: TStyleValue): TReturn => [
    ['paddingLeft', value],
    ['paddingInlineStart', null],
    ['paddingInlineEnd', null],
  ],
  paddingRight: (value: TStyleValue): TReturn => [
    ['paddingRight', value],
    ['paddingInlineStart', null],
    ['paddingInlineEnd', null],
  ],
  placeContent: (value: TStyleValue): TReturn => [
    ['placeContent', value],
    ['alignContent', null],
    ['justifyContent', null],
  ],
  placeItems: (value: TStyleValue): TReturn => [
    ['placeItems', value],
    ['alignItems', null],
    ['justifyItems', null],
  ],
  placeSelf: (value: TStyleValue): TReturn => [
    ['placeSelf', value],
    ['alignSelf', null],
    ['justifySelf', null],
  ],
  scrollMargin: (value: TStyleValue): TReturn => [
    ['scrollMargin', value],
    ['scrollMarginBottom', null],
    ['scrollMarginLeft', null],
    ['scrollMarginStart', null],
    ['scrollMarginRight', null],
    ['scrollMarginEnd', null],
    ['scrollMarginTop', null],
  ],
  scrollPadding: (value: TStyleValue): TReturn => [
    ['scrollPadding', value],
    ['scrollPaddingBottom', null],
    ['scrollPaddingLeft', null],
    ['scrollPaddingStart', null],
    ['scrollPaddingRight', null],
    ['scrollPaddingEnd', null],
    ['scrollPaddingTop', null],
  ],
  scrollTimeline: (value: TStyleValue): TReturn => [
    ['scrollTimeline', value],
    ['scrollTimelineName', null],
    ['scrollTimelineAxis', null],
  ],
  textDecoration: (value: TStyleValue): TReturn => [
    ['textDecoration', value],
    ['textDecorationColor', null],
    ['textDecorationLine', null],
    ['textDecorationStyle', null],
    ['textDecorationThickness', null],
  ],
  textEmphasis: (value: TStyleValue): TReturn => [
    ['textEmphasis', value],
    ['textEmphasisColor', null],
    ['textEmphasisStyle', null],
  ],
  transition: (value: TStyleValue): TReturn => [
    ['transition', value],
    ['transitionDelay', null],
    ['transitionDuration', null],
    ['transitionProperty', null],
    ['transitionTimingFunction', null],
  ],
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

  borderHorizontalWidth: shorthands.borderInlineWidth,
  borderHorizontalStyle: shorthands.borderInlineStyle,
  borderHorizontalColor: shorthands.borderInlineColor,
  borderVerticalWidth: shorthands.borderBlockWidth,
  borderVerticalStyle: shorthands.borderBlockStyle,
  borderVerticalColor: shorthands.borderBlockColor,

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

  borderStartColor: shorthands.borderInlineStartColor,
  borderEndColor: shorthands.borderInlineEndColor,
  borderStartStyle: shorthands.borderInlineStartStyle,
  borderEndStyle: shorthands.borderInlineEndStyle,
  borderStartWidth: shorthands.borderInlineStartWidth,
  borderEndWidth: shorthands.borderInlineEndWidth,

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
  marginStart: shorthands.marginInlineStart,
  marginEnd: shorthands.marginInlineEnd,
  marginHorizontal: shorthands.marginInline,
  marginVertical: shorthands.marginBlock,

  paddingBlockStart: (rawValue: TStyleValue): TReturn => [
    ['paddingTop', rawValue],
  ],
  paddingBlockEnd: (rawValue: TStyleValue): TReturn => [
    ['paddingBottom', rawValue],
  ],
  paddingStart: shorthands.paddingInlineStart,
  paddingEnd: shorthands.paddingInlineEnd,
  paddingHorizontal: shorthands.paddingInline,
  paddingVertical: shorthands.paddingBlock,

  insetBlockStart: (value: TStyleValue): TReturn => [['top', value]],
  insetBlockEnd: (value: TStyleValue): TReturn => [['bottom', value]],
  start: shorthands.insetInlineStart,
  end: shorthands.insetInlineEnd,
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default expansions;
