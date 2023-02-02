/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

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

const shorthands = {
  all: (_: string) => {
    throw new Error('all is not supported');
  },
  animation: (value: string): Array<[string, null | string]> => [
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

  background: (value: string): Array<[string, null | string]> => [
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
  border: (rawValue: string): Array<[string, null | string]> => {
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
  borderInline: (rawValue: string): Array<[string, null | string]> => {
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
  borderBlock: (rawValue: string): Array<[string, null | string]> => {
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
  borderTop: (rawValue: string): Array<[string, null | string]> => {
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
  borderInlineEnd: (rawValue: string): Array<[string, null | string]> => {
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
  borderRight: (rawValue: string): Array<[string, null | string]> => {
    throw new Error(
      [
        '`borderRight` is not supported.',
        'You could use `borderRightWidth`, `borderRightStyle` and `borderRightColor`,',
        'but it is preferable to use `borderInlineEndWidth`, `borderInlineEndStyle` and `borderInlineEndColor`.',
      ].join(' ')
    );
  },
  // @Deprecated
  borderBottom: (rawValue: string): Array<[string, null | string]> => {
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
  borderInlineStart: (rawValue: string): Array<[string, null | string]> => {
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
  borderLeft: (rawValue: string): Array<[string, null | string]> => {
    throw new Error(
      [
        '`borderLeft` is not supported.',
        'You could use `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`,',
        'but it is preferable to use `borderInlineStartWidth`, `borderInlineStartStyle` and `borderInlineStartColor`.',
      ].join(' ')
    );
  },
  borderInlineWidth: (rawValue: string): Array<[string, null | string]> => [
    ['borderInlineWidth', rawValue],
    ['borderInlineStartWidth', null],
    ['borderLeftWidth', null],
    ['borderInlineEndWidth', null],
    ['borderRightWidth', null],
  ],
  borderInlineStyle: (rawValue: string): Array<[string, null | string]> => [
    ['borderInlineStyle', rawValue],
    ['borderInlineStartStyle', null],
    ['borderLeftStyle', null],
    ['borderInlineEndStyle', null],
    ['borderRightStyle', null],
  ],
  borderInlineColor: (rawValue: string): Array<[string, null | string]> => [
    ['borderInlineColor', rawValue],
    ['borderInlineStartColor', null],
    ['borderLeftColor', null],
    ['borderInlineEndColor', null],
    ['borderRightColor', null],
  ],
  borderBlockWidth: (rawValue: string): Array<[string, null | string]> => [
    ['borderBlockWidth', rawValue],
    ['borderTopWidth', null],
    ['borderBottomWidth', null],
  ],
  borderBlockStyle: (rawValue: string): Array<[string, null | string]> => [
    ['borderBlockStyle', rawValue],
    ['borderTopStyle', null],
    ['borderBottomStyle', null],
  ],
  borderBlockColor: (rawValue: string): Array<[string, null | string]> => [
    ['borderBlockColor', rawValue],
    ['borderTopColor', null],
    ['borderBottomColor', null],
  ],
  borderColor: (value: string): Array<[string, null | string]> => [
    ['borderColor', value],
    ['borderTopColor', null],
    ['borderInlineEndColor', null],
    ['borderRightColor', null],
    ['borderBottomColor', null],
    ['borderInlineStartColor', null],
    ['borderLeftColor', null],
  ],
  borderStyle: (value: string): Array<[string, null | string]> => [
    ['borderStyle', value],
    ['borderTopStyle', null],
    ['borderInlineEndStyle', null],
    ['borderRightStyle', null],
    ['borderBottomStyle', null],
    ['borderInlineStartStyle', null],
    ['borderLeftStyle', null],
  ],
  borderWidth: (value: string): Array<[string, null | string]> => [
    ['borderWidth', value],
    ['borderTopWidth', null],
    ['borderInlineEndWidth', null],
    ['borderRightWidth', null],
    ['borderBottomWidth', null],
    ['borderInlineStartWidth', null],
    ['borderLeftWidth', null],
  ],
  borderInlineStartColor: (value: string): Array<[string, null | string]> => [
    ['borderInlineStartColor', value],
    ['borderLeftColor', null],
    ['borderRightColor', null],
  ],
  borderInlineEndColor: (value: string): Array<[string, null | string]> => [
    ['borderInlineEndColor', value],
    ['borderLeftColor', null],
    ['borderRightColor', null],
  ],
  borderInlineStartStyle: (value: string): Array<[string, null | string]> => [
    ['borderInlineStartStyle', value],
    ['borderLeftStyle', null],
    ['borderRightStyle', null],
  ],
  borderInlineEndStyle: (value: string): Array<[string, null | string]> => [
    ['borderInlineEndStyle', value],
    ['borderLeftStyle', null],
    ['borderRightStyle', null],
  ],
  borderInlineStartWidth: (value: string): Array<[string, null | string]> => [
    ['borderInlineStartWidth', value],
    ['borderLeftWidth', null],
    ['borderRightWidth', null],
  ],
  borderInlineEndWidth: (value: string): Array<[string, null | string]> => [
    ['borderInlineEndWidth', value],
    ['borderLeftWidth', null],
    ['borderRightWidth', null],
  ],
  borderLeftColor: (value: string): Array<[string, null | string]> => [
    ['borderLeftColor', value],
    ['borderInlineStartColor', null],
    ['borderInlineEndColor', null],
  ],
  borderRightColor: (value: string): Array<[string, null | string]> => [
    ['borderRightColor', value],
    ['borderInlineStartColor', null],
    ['borderInlineEndColor', null],
  ],
  borderLeftStyle: (value: string): Array<[string, null | string]> => [
    ['borderLeftStyle', value],
    ['borderInlineStartStyle', null],
    ['borderInlineEndStyle', null],
  ],
  borderRightStyle: (value: string): Array<[string, null | string]> => [
    ['borderRightStyle', value],
    ['borderInlineStartStyle', null],
    ['borderInlineEndStyle', null],
  ],
  borderLeftWidth: (value: string): Array<[string, null | string]> => [
    ['borderLeftWidth', value],
    ['borderInlineStartWidth', null],
    ['borderInlineEndWidth', null],
  ],
  borderRightWidth: (value: string): Array<[string, null | string]> => [
    ['borderRightWidth', value],
    ['borderInlineStartWidth', null],
    ['borderInlineEndWidth', null],
  ],

  borderRadius: (value: string): Array<[string, null | string]> => {
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
  borderStartStartRadius: (value: string): Array<[string, null | string]> => [
    ['borderStartStartRadius', value],
    ['borderTopLeftRadius', null],
    ['borderTopRightRadius', null],
  ],
  borderStartEndRadius: (value: string): Array<[string, null | string]> => [
    ['borderStartEndRadius', value],
    ['borderTopLeftRadius', null],
    ['borderTopRightRadius', null],
  ],
  borderEndStartRadius: (value: string): Array<[string, null | string]> => [
    ['borderEndStartRadius', value],
    ['borderBottomLeftRadius', null],
    ['borderBottomRightRadius', null],
  ],
  borderEndEndRadius: (value: string): Array<[string, null | string]> => [
    ['borderEndEndRadius', value],
    ['borderBottomLeftRadius', null],
    ['borderBottomRightRadius', null],
  ],
  borderTopLeftRadius: (value: string): Array<[string, null | string]> => [
    ['borderTopLeftRadius', value],
    ['borderStartStartRadius', null],
    ['borderStartEndRadius', null],
  ],
  borderTopRightRadius: (value: string): Array<[string, null | string]> => [
    ['borderTopRightRadius', value],
    ['borderStartStartRadius', null],
    ['borderStartEndRadius', null],
  ],
  borderBottomLeftRadius: (value: string): Array<[string, null | string]> => [
    ['borderBottomLeftRadius', value],
    ['borderEndStartRadius', null],
    ['borderEndEndRadius', null],
  ],
  borderBottomRightRadius: (value: string): Array<[string, null | string]> => [
    ['borderBottomRightRadius', value],
    ['borderEndStartRadius', null],
    ['borderEndEndRadius', null],
  ],

  columnRule: (value: string): Array<[string, null | string]> => [
    ['columnRule', value],
    ['columnRuleWidth', null],
    ['columnRuleStyle', null],
    ['columnRuleColor', null],
  ],
  columns: (value: string): Array<[string, null | string]> => [
    ['columns', value],
    ['columnCount', null],
    ['columnWidth', null],
  ],

  container: (value: string): Array<[string, null | string]> => [
    ['container', value],
    ['containerName', null],
    ['containerType', null],
  ],

  flex: (value: string): Array<[string, null | string]> => [
    ['flex', value],
    ['flexGrow', null],
    ['flexShrink', null],
    ['flexBasis', null],
  ],
  flexFlow: (value: string): Array<[string, null | string]> => [
    ['flexFlow', value],
    ['flexDirection', null],
    ['flexWrap', null],
  ],
  // @Deprecated ?
  font: (value: string): Array<[string, null | string]> => [
    ['font', value],
    ['fontFamily', null],
    ['fontSize', null],
    ['fontStretch', null],
    ['fontStyle', null],
    ['fontVariant', null],
    ['fontWeight', null],
    ['lineHeight', null],
  ],
  gap: (value: string): Array<[string, null | string]> => [
    ['gap', value],
    ['rowGap', null],
    ['columnGap', null],
  ],
  grid: (value: string): Array<[string, null | string]> => [
    ['grid', value],
    ['gridTemplate', null],
    ['gridTemplateAreas', null],
    ['gridTemplateColumns', null],
    ['gridTemplateRows', null],

    ['gridAutoRows', null],
    ['gridAutoColumns', null],
    ['gridAutoFlow', null],
  ],
  gridArea: (value: string): Array<[string, null | string]> => [
    ['gridArea', value],
    ['gridRow', null],
    ['gridRowStart', null],
    ['gridRowEnd', null],
    ['gridColumn', null],
    ['gridColumnStart', null],
    ['gridColumnEnd', null],
  ],
  gridRow: (value: string): Array<[string, null | string]> => [
    ['gridRow', value],
    ['gridRowStart', null],
    ['gridRowEnd', null],
  ],
  gridColumn: (value: string): Array<[string, null | string]> => [
    ['gridColumn', value],
    ['gridColumnStart', null],
    ['gridColumnEnd', null],
  ],
  gridTemplate: (value: string): Array<[string, null | string]> => [
    ['gridTemplate', value],
    ['gridTemplateAreas', null],
    ['gridTemplateColumns', null],
    ['gridTemplateRows', null],
  ],
  inset: (value: string): Array<[string, null | string]> => [
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
  insetInline: (value: string): Array<[string, null | string]> => [
    ['insetInline', value],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
    ['left', null],
    ['right', null],
  ],
  insetBlock: (value: string): Array<[string, null | string]> => [
    ['insetBlock', value],
    ['top', null],
    ['bottom', null],
  ],
  insetInlineStart: (value: string): Array<[string, null | string]> => [
    ['insetInlineStart', value],
    ['left', null],
    ['right', null],
  ],
  insetInlineEnd: (value: string): Array<[string, null | string]> => [
    ['insetInlineEnd', value],
    ['left', null],
    ['right', null],
  ],
  left: (value: string): Array<[string, null | string]> => [
    ['left', value],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
  ],
  right: (value: string): Array<[string, null | string]> => [
    ['right', value],
    ['insetInlineStart', null],
    ['insetInlineEnd', null],
  ],

  listStyle: (value: string): Array<[string, null | string]> => [
    ['listStyle', value],
    ['listStyleImage', null],
    ['listStylePosition', null],
    ['listStyleType', null],
  ],

  margin: (value: string): Array<[string, null | string]> => {
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
  marginInline: (value: string): Array<[string, null | string]> => [
    ['marginInline', value],
    ['marginInlineStart', null],
    ['marginLeft', null],
    ['marginInlineEnd', null],
    ['marginRight', null],
  ],
  marginBlock: (value: string): Array<[string, null | string]> => [
    ['marginBlock', value],
    ['marginTop', null],
    ['marginBottom', null],
  ],
  marginInlineStart: (value: string): Array<[string, null | string]> => [
    ['marginInlineStart', value],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginInlineEnd: (value: string): Array<[string, null | string]> => [
    ['marginInlineEnd', value],
    ['marginLeft', null],
    ['marginRight', null],
  ],
  marginLeft: (value: string): Array<[string, null | string]> => [
    ['marginLeft', value],
    ['marginInlineStart', null],
    ['marginInlineEnd', null],
  ],
  marginRight: (value: string): Array<[string, null | string]> => [
    ['marginRight', value],
    ['marginInlineStart', null],
    ['marginInlineEnd', null],
  ],

  mask: (value: string): Array<[string, null | string]> => [
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

  offset: (value: string): Array<[string, null | string]> => [
    ['offset', value],
    ['offsetAnchor', null],
    ['offsetDistance', null],
    ['offsetPath', null],
    ['offsetPosition', null],
    ['offsetRotate', null],
  ],

  outline: (value: string): Array<[string, null | string]> => [
    ['outline', value],
    ['outlineColor', null],
    ['outlineStyle', null],
    ['outlineWidth', null],
  ],

  overflow: (value: string): Array<[string, null | string]> => [
    ['overflow', value],
    ['overflowX', null],
    ['overflowY', null],
  ],

  padding: (rawValue: string): Array<[string, null | string]> => {
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
  paddingInline: (rawValue: string): Array<[string, null | string]> => [
    ['paddingInline', rawValue],
    ['paddingStart', null],
    ['paddingLeft', null],
    ['paddingEnd', null],
    ['paddingRight', null],
  ],
  paddingBlock: (rawValue: string): Array<[string, null | string]> => [
    ['paddingBlock', rawValue],
    ['paddingTop', null],
    ['paddingBottom', null],
  ],
  paddingInlineStart: (value: string): Array<[string, null | string]> => [
    ['paddingInlineStart', value],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingInlineEnd: (value: string): Array<[string, null | string]> => [
    ['paddingInlineEnd', value],
    ['paddingLeft', null],
    ['paddingRight', null],
  ],
  paddingLeft: (value: string): Array<[string, null | string]> => [
    ['paddingLeft', value],
    ['paddingInlineStart', null],
    ['paddingInlineEnd', null],
  ],
  paddingRight: (value: string): Array<[string, null | string]> => [
    ['paddingRight', value],
    ['paddingInlineStart', null],
    ['paddingInlineEnd', null],
  ],
  placeContent: (value: string): Array<[string, null | string]> => [
    ['placeContent', value],
    ['alignContent', null],
    ['justifyContent', null],
  ],
  placeItems: (value: string): Array<[string, null | string]> => [
    ['placeItems', value],
    ['alignItems', null],
    ['justifyItems', null],
  ],
  placeSelf: (value: string): Array<[string, null | string]> => [
    ['placeSelf', value],
    ['alignSelf', null],
    ['justifySelf', null],
  ],
  scrollMargin: (value: string): Array<[string, null | string]> => [
    ['scrollMargin', value],
    ['scrollMarginBottom', null],
    ['scrollMarginLeft', null],
    ['scrollMarginStart', null],
    ['scrollMarginRight', null],
    ['scrollMarginEnd', null],
    ['scrollMarginTop', null],
  ],
  scrollPadding: (value: string): Array<[string, null | string]> => [
    ['scrollPadding', value],
    ['scrollPaddingBottom', null],
    ['scrollPaddingLeft', null],
    ['scrollPaddingStart', null],
    ['scrollPaddingRight', null],
    ['scrollPaddingEnd', null],
    ['scrollPaddingTop', null],
  ],
  scrollTimeline: (value: string): Array<[string, null | string]> => [
    ['scrollTimeline', value],
    ['scrollTimelineName', null],
    ['scrollTimelineAxis', null],
  ],
  textDecoration: (value: string): Array<[string, null | string]> => [
    ['textDecoration', value],
    ['textDecorationColor', null],
    ['textDecorationLine', null],
    ['textDecorationStyle', null],
    ['textDecorationThickness', null],
  ],
  textEmphasis: (value: string): Array<[string, null | string]> => [
    ['textEmphasis', value],
    ['textEmphasisColor', null],
    ['textEmphasisStyle', null],
  ],
  transition: (value: string): Array<[string, null | string]> => [
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

  borderBlockStartColor: (value: string): Array<[string, null | string]> => [
    ['borderTopColor', value],
  ],
  borderBlockEndColor: (value: string): Array<[string, null | string]> => [
    ['borderBottomColor', value],
  ],
  borderBlockStartStyle: (value: string): Array<[string, null | string]> => [
    ['borderTopStyle', value],
  ],
  borderBlockEndStyle: (value: string): Array<[string, null | string]> => [
    ['borderBottomStyle', value],
  ],
  borderBlockStartWidth: (value: string): Array<[string, null | string]> => [
    ['borderTopWidth', value],
  ],
  borderBlockEndWidth: (value: string): Array<[string, null | string]> => [
    ['borderBottomWidth', value],
  ],

  borderStartColor: shorthands.borderInlineStartColor,
  borderEndColor: shorthands.borderInlineEndColor,
  borderStartStyle: shorthands.borderInlineStartStyle,
  borderEndStyle: shorthands.borderInlineEndStyle,
  borderStartWidth: shorthands.borderInlineStartWidth,
  borderEndWidth: shorthands.borderInlineEndWidth,

  borderTopStartRadius: (value: string): Array<[string, null | string]> => [
    ['borderStartStartRadius', value],
  ],
  borderTopEndRadius: (value: string): Array<[string, null | string]> => [
    ['borderStartEndRadius', value],
  ],
  borderBottomStartRadius: (value: string): Array<[string, null | string]> => [
    ['borderEndStartRadius', value],
  ],
  borderBottomEndRadius: (value: string): Array<[string, null | string]> => [
    ['borderEndEndRadius', value],
  ],

  marginBlockStart: (value: string): Array<[string, null | string]> => [
    ['marginTop', value],
  ],
  marginBlockEnd: (value: string): Array<[string, null | string]> => [
    ['marginBottom', value],
  ],
  marginStart: shorthands.marginInlineStart,
  marginEnd: shorthands.marginInlineEnd,
  marginHorizontal: shorthands.marginInline,
  marginVertical: shorthands.marginBlock,

  paddingBlockStart: (rawValue: string): Array<[string, null | string]> => [
    ['paddingTop', rawValue],
  ],
  paddingBlockEnd: (rawValue: string): Array<[string, null | string]> => [
    ['paddingBottom', rawValue],
  ],
  paddingStart: shorthands.paddingInlineStart,
  paddingEnd: shorthands.paddingInlineEnd,
  paddingHorizontal: shorthands.paddingInline,
  paddingVertical: shorthands.paddingBlock,

  insetBlockStart: (value: string): Array<[string, null | string]> => [
    ['top', value],
  ],
  insetBlockEnd: (value: string): Array<[string, null | string]> => [
    ['bottom', value],
  ],
  start: shorthands.insetInlineStart,
  end: shorthands.insetInlineEnd,
};

const expansions = {
  ...shorthands,
  ...aliases,
};

export default expansions;
