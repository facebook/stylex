/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from './common-types';

import normalizeValue from './utils/normalize-value';

/**
 * Convert a CSS value in JS to the final CSS string value
 */
export default function transformValue(
  key: string,
  rawValue: string | number,
  options: StyleXOptions,
): string {
  const value =
    typeof rawValue === 'number'
      ? String(Math.round(rawValue * 10000) / 10000) + getNumberSuffix(key)
      : rawValue;

  // content is one of the values that needs to wrapped in quotes.
  // Users may write `''` without thinking about it, so we fix that.
  if (
    (key === 'content' ||
      key === 'hyphenateCharacter' ||
      key === 'hyphenate-character') &&
    typeof value === 'string'
  ) {
    const val = value.trim();
    if (val.match(/^attr\([a-zA-Z0-9-]+\)$/)) {
      return val;
    }
    if (
      !(
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
    ) {
      return `"${val}"`;
    }
  }

  return normalizeValue(value, key, options);
}

export function getNumberSuffix(key: string): string {
  if (unitlessNumberProperties.has(key)) {
    return '';
  }
  if (!(key in numberPropertySuffixes)) {
    return 'px';
  }

  const suffix = numberPropertySuffixes[key];
  if (suffix == null) {
    return 'px';
  } else {
    return suffix;
  }
}

const unitlessNumberProperties = new Set([
  'WebkitLineClamp',
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'counterSet',
  'columnCount',
  'flex', // Unsupported
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexOrder',
  'gridRow',
  'gridColumn',
  'fontWeight',
  'hyphenateLimitChars',
  'lineClamp',
  'lineHeight',
  'maskBorderOutset',
  'maskBorderSlice',
  'maskBorderWidth',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'fillOpacity',
  'floodOpacity',
  'rotate',
  'scale',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'scale',

  'mathDepth',
]);

// List of properties that have custom suffixes for numbers
const numberPropertySuffixes: { +[key: string]: string } = {
  animationDelay: 'ms',
  animationDuration: 'ms',
  transitionDelay: 'ms',
  transitionDuration: 'ms',
  voiceDuration: 'ms',
};

export const timeUnits: Set<string> = new Set(
  Object.keys(numberPropertySuffixes),
);

export const lengthUnits: Set<string> = new Set([
  'backgroundPositionX',
  'backgroundPositionY',
  'blockSize',
  'borderBlockEndWidth',
  'borderBlockStartWidth',
  'borderBlockWidth',
  'borderVerticalWidth',
  'borderVerticalWidth',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomWidth',
  'borderEndEndRadius',
  'borderEndStartRadius',
  'borderImageWidth',
  'borderInlineEndWidth',
  'borderEndWidth',
  'borderInlineStartWidth',
  'borderStartWidth',
  'borderInlineWidth',
  'borderHorizontalWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderSpacing',
  'borderStartEndRadius',
  'borderStartStartRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopWidth',
  'bottom',
  'columnGap',
  'columnRuleWidth',
  'columnWidth',
  'containIntrinsicBlockSize',
  'containIntrinsicHeight',
  'containIntrinsicInlineSize',
  'containIntrinsicWidth',
  'flexBasis',
  'fontSize',
  'fontSmooth',
  'height',
  'inlineSize',
  'insetBlockEnd',
  'insetBlockStart',
  'insetInlineEnd',
  'insetInlineStart',
  'left',
  'letterSpacing',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInlineEnd',
  'marginEnd',
  'marginInlineStart',
  'marginStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maskBorderOutset',
  'maskBorderWidth',
  'maxBlockSize',
  'maxHeight',
  'maxInlineSize',
  'maxWidth',
  'minBlockSize',
  'minHeight',
  'minInlineSize',
  'minWidth',
  'offsetDistance',
  'outlineOffset',
  'outlineWidth',
  'overflowClipMargin',
  'paddingBlockEnd',
  'paddingBlockStart',
  'paddingBottom',
  'paddingInlineEnd',
  'paddingEnd',
  'paddingInlineStart',
  'paddingStart',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'perspective',
  'right',
  'rowGap',
  'scrollMarginBlockEnd',
  'scrollMarginBlockStart',
  'scrollMarginBottom',
  'scrollMarginInlineEnd',
  'scrollMarginInlineStart',
  'scrollMarginLeft',
  'scrollMarginRight',
  'scrollMarginTop',
  'scrollPaddingBlockEnd',
  'scrollPaddingBlockStart',
  'scrollPaddingBottom',
  'scrollPaddingInlineEnd',
  'scrollPaddingInlineStart',
  'scrollPaddingLeft',
  'scrollPaddingRight',
  'scrollPaddingTop',
  'scrollSnapMarginBottom',
  'scrollSnapMarginLeft',
  'scrollSnapMarginRight',
  'scrollSnapMarginTop',
  'shapeMargin',
  'tabSize',
  'textDecorationThickness',
  'textIndent',
  'textUnderlineOffset',
  'top',
  'transformOrigin',
  'translate',
  'verticalAlign',
  'width',
  'wordSpacing',
  'border',
  'borderBlock',
  'borderBlockEnd',
  'borderBlockStart',
  'borderBottom',
  'borderLeft',
  'borderRadius',
  'borderRight',
  'borderTop',
  'borderWidth',
  'columnRule',
  'containIntrinsicSize',
  'gap',
  'inset',
  'insetBlock',
  'insetInline',
  'margin',
  'marginBlock',
  'marginVertical',
  'marginInline',
  'marginHorizontal',
  'offset',
  'outline',
  'padding',
  'paddingBlock',
  'paddingVertical',
  'paddingInline',
  'paddingHorizontal',
  'scrollMargin',
  'scrollMarginBlock',
  'scrollMarginInline',
  'scrollPadding',
  'scrollPaddingBlock',
  'scrollPaddingInline',
  'scrollSnapMargin',
]);
