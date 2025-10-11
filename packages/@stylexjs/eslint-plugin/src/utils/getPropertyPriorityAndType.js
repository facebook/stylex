/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

type PriorityAndType = {
  priority: number,
  type:
    | 'string'
    | 'pseudoClass'
    | 'pseudoElement'
    | 'atRule'
    | 'knownCssProperty',
};

// Based on https://github.com/kutsan/stylelint-config-clean-order/tree/v7.0.0
const CLEAN_ORDER_PRIORITIES = [
  '', // index 0 - unused

  // Priority 1: composes
  'composes',

  // Priority 2: all
  'all',

  // Priority 3+: interaction (starting at 3)
  'pointerEvents',
  'touchAction',
  'willChange',
  'cursor',
  'captionSide',
  'content',
  'quotes',
  'counterSet',
  'counterIncrement',
  'counterReset',
  'resize',
  'userSelect',
  'overflowAnchor',
  'navIndex',
  'navUp',
  'navRight',
  'navDown',
  'navLeft',
  'scrollBehavior',
  'scrollbarColor',
  'scrollbarWidth',
  'scrollbarGutter',
  'scrollMargin',
  'scrollMarginBlock',
  'scrollMarginBlockStart',
  'scrollMarginBlockEnd',
  'scrollMarginInline',
  'scrollMarginInlineStart',
  'scrollMarginInlineEnd',
  'scrollMarginTop',
  'scrollMarginRight',
  'scrollMarginBottom',
  'scrollMarginLeft',
  'scrollPadding',
  'scrollPaddingBlock',
  'scrollPaddingBlockStart',
  'scrollPaddingBlockEnd',
  'scrollPaddingInline',
  'scrollPaddingInlineStart',
  'scrollPaddingInlineEnd',
  'scrollPaddingTop',
  'scrollPaddingRight',
  'scrollPaddingBottom',
  'scrollPaddingLeft',
  'scrollSnapType',
  'scrollSnapAlign',
  'scrollSnapStop',
  'contentVisibility',
  'containIntrinsicSize',
  'containIntrinsicWidth',
  'containIntrinsicHeight',
  'containIntrinsicInlineSize',
  'containIntrinsicBlockSize',
  'speak',
  'speakAs',

  // positioning (starting at 58)
  'isolation',
  'position',
  'zIndex',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'insetBlock',
  'insetBlockStart',
  'insetBlockEnd',
  'insetInline',
  'insetInlineStart',
  'insetInlineEnd',
  'zoom',
  'transformOrigin',
  'transformBox',
  'transformStyle',
  'transform',
  'translate',
  'rotate',
  'scale',
  'offsetPath',
  'offsetDistance',
  'offsetRotate',

  // layout (starting at 83)
  'container',
  'containerName',
  'containerType',
  'size',
  'direction',
  'unicodeBidi',
  'float',
  'clear',
  'contain',
  'overflow',
  'overflowX',
  'overflowY',
  'overflowBlock',
  'overflowInline',
  'overflowClipMargin',
  'overscrollBehavior',
  'overscrollBehaviorX',
  'overscrollBehaviorY',
  'overscrollBehaviorInline',
  'overscrollBehaviorBlock',
  'display',
  'tableLayout',
  'borderSpacing',
  'borderCollapse',
  'emptyCells',
  'columns',
  'columnCount',
  'columnWidth',
  'columnFill',
  'columnRule',
  'columnRuleColor',
  'columnRuleStyle',
  'columnRuleWidth',
  'columnSpan',
  'widows',
  'orphans',
  'grid',
  'gridArea',
  'gridAutoColumns',
  'gridAutoFlow',
  'gridAutoRows',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnGap',
  'gridColumnStart',
  'gridGap',
  'gridRow',
  'gridRowEnd',
  'gridRowGap',
  'gridRowStart',
  'gridTemplate',
  'gridTemplateAreas',
  'gridTemplateColumns',
  'gridTemplateRows',
  'flex',
  'flexFlow',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'boxOrient',
  'lineClamp',
  'gap',
  'rowGap',
  'columnGap',
  'placeContent',
  'placeItems',
  'placeSelf',
  'alignContent',
  'alignItems',
  'alignSelf',
  'justifyContent',
  'justifyItems',
  'justifySelf',
  'order',
  'breakInside',
  'breakBefore',
  'breakAfter',
  'shapeOutside',
  'shapeImageThreshold',
  'shapeMargin',

  // boxModel (starting at 165)
  'boxSizing',
  'aspectRatio',
  'width',
  'inlineSize',
  'minWidth',
  'maxWidth',
  'minInlineSize',
  'maxInlineSize',
  'height',
  'blockSize',
  'minHeight',
  'maxHeight',
  'minBlockSize',
  'maxBlockSize',
  'margin',
  'marginBlock', //
  'marginBlockStart', //
  'marginBlockEnd', //
  'marginInline', //
  'marginInlineStart', //
  'marginInlineEnd', //
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingBlock', //
  'paddingBlockStart', //
  'paddingBlockEnd', //
  'paddingInline', //
  'paddingInlineStart', //
  'paddingInlineEnd', //
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'border',
  'borderColor',
  'borderStyle',
  'borderWidth',
  'borderBlock', //
  'borderBlockColor', //
  'borderBlockStyle', //
  'borderBlockWidth', //
  'borderBlockStart', //
  'borderBlockStartColor', //
  'borderBlockStartStyle', //
  'borderBlockStartWidth', //
  'borderBlockEnd', //
  'borderBlockEndColor', //
  'borderBlockEndStyle', //
  'borderBlockEndWidth', //
  'borderInline', //
  'borderInlineColor', //
  'borderInlineStyle', //
  'borderInlineWidth', //
  'borderInlineStart', //
  'borderInlineStartColor', //
  'borderInlineStartStyle', //
  'borderInlineStartWidth', //
  'borderInlineEnd', //
  'borderInlineEndColor', //
  'borderInlineEndStyle', //
  'borderInlineEndWidth', //
  'borderTop',
  'borderTopColor',
  'borderTopStyle',
  'borderTopWidth',
  'borderRight',
  'borderRightColor',
  'borderRightStyle',
  'borderRightWidth',
  'borderBottom',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderLeft',
  'borderLeftColor',
  'borderLeftStyle',
  'borderLeftWidth',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndEndRadius',
  'borderImage',
  'borderImageSource',
  'borderImageSlice',
  'borderImageWidth',
  'borderImageOutset',
  'borderImageRepeat',

  // typography (starting at 260)
  'writingMode',
  'font',
  'fontFamily',
  'fontSize',
  'fontFeatureSettings',
  'fontVariationSettings',
  'fontOpticalSizing',
  'fontWeight',
  'fontStyle',
  'fontDisplay',
  'fontKerning',
  'fontVariant',
  'fontVariantLigatures',
  'fontVariantCaps',
  'fontVariantAlternates',
  'fontVariantNumeric',
  'fontVariantEastAsian',
  'fontVariantPosition',
  'fontSizeAdjust',
  'fontStretch',
  'fontEffect',
  'fontEmphasize',
  'fontEmphasizePosition',
  'fontEmphasizeStyle',
  'fontSmoothing',
  'WebkitFontSmoothing',
  'MozOsxFontSmoothing',
  'fontSmooth',
  'rubyPosition',
  'lineHeight',
  'hyphens',
  'color',
  'textAlign',
  'textAlignLast',
  'textEmphasis',
  'textEmphasisColor',
  'textEmphasisStyle',
  'textEmphasisPosition',
  'textDecoration',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textDecorationThickness',
  'textDecorationSkipInk',
  'textUnderlinePosition',
  'textUnderlineOffset',
  'textIndent',
  'textJustify',
  'textOutline',
  'textOverflow',
  'textOverflowEllipsis',
  'textOverflowMode',
  'textShadow',
  'textTransform',
  'textWrap',
  'textSizeAdjust',
  'textCombineUpright',
  'textOrientation',
  'textRendering',
  'WebkitTextFillColor',
  'WebkitTextStrokeColor',
  'letterSpacing',
  'wordBreak',
  'wordSpacing',
  'wordWrap',
  'lineBreak',
  'overflowWrap',
  'tabSize',
  'whiteSpace',
  'verticalAlign',
  'paintOrder',
  'hangingPunctuation',
  'listStyle',
  'listStylePosition',
  'listStyleType',
  'listStyleImage',
  'src',
  'unicodeRange',
  'ascentOverride',
  'descentOverride',
  'lineGapOverride',

  // appearance (starting at 341)
  'appearance',
  'visibility',
  'colorScheme',
  'forcedColorAdjust',
  'accentColor',
  'perspective',
  'perspectiveOrigin',
  'backfaceVisibility',
  'opacity',
  'objectFit',
  'objectPosition',
  'imageOrientation',
  'background',
  'backgroundColor',
  'backgroundImage',
  'backgroundRepeat',
  'backgroundRepeatX',
  'backgroundRepeatY',
  'backgroundAttachment',
  'backgroundPosition',
  'backgroundPositionX',
  'backgroundPositionY',
  'backgroundClip',
  'backgroundOrigin',
  'backgroundSize',
  'backgroundBlendMode',
  'clip',
  'clipPath',
  'filter',
  'backdropFilter',
  'WebkitBoxDecorationBreak',
  'boxDecorationBreak',
  'outline',
  'outlineColor',
  'outlineStyle',
  'outlineWidth',
  'outlineOffset',
  'boxShadow',
  'mixBlendMode',
  'caretColor',

  // svgPresentation (starting at 381)
  'alignmentBaseline',
  'baselineShift',
  'dominantBaseline',
  'textAnchor',
  'cx',
  'cy',
  'd',
  'r',
  'rx',
  'ry',
  'fill',
  'fillOpacity',
  'fillRule',
  'floodColor',
  'floodOpacity',
  'stopColor',
  'stopOpacity',
  'stroke',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'vectorEffect',
  'colorInterpolation',
  'colorInterpolationFilters',
  'colorProfile',
  'colorRendering',
  'imageRendering',
  'lightingColor',
  'markerStart',
  'markerMid',
  'markerEnd',
  'mask',
  'maskType',
  'shapeRendering',
  'clipRule',

  // transition (starting at 420)
  'transition',
  'transitionDelay',
  'transitionTimingFunction',
  'transitionDuration',
  'transitionProperty',
  'animation',
  'animationName',
  'animationDuration',
  'animationPlayState',
  'animationTimingFunction',
  'animationFillMode',
  'animationDelay',
  'animationIterationCount',
  'animationDirection',
  'animationTimeline',
  'timelineScope',
  'scrollTimeline',
  'scrollTimelineName',
  'scrollTimelineAxis',
  'viewTimeline',
  'viewTimelineName',
  'viewTimelineAxis',
  'viewTimelineInset',
  'viewTransitionName',
];

export default function getPropertyPriorityAndType(
  key: string,
  order: 'asc' | 'clean-order' | 'recess-order',
): PriorityAndType {
  let BASE_PRIORITY = 0;
  if (order === 'clean-order') {
    BASE_PRIORITY = CLEAN_ORDER_PRIORITIES.length - 1;
  } else if (order === 'recess-order') {
    BASE_PRIORITY = 0;
  }

  const AT_CONTAINER_PRIORITY = BASE_PRIORITY + 300;
  const AT_MEDIA_PRIORITY = BASE_PRIORITY + 200;
  const AT_SUPPORT_PRIORITY = BASE_PRIORITY + 30;
  const PSEUDO_CLASS_PRIORITY = BASE_PRIORITY + 40;
  const PSEUDO_ELEMENT_PRIORITY = BASE_PRIORITY + 5000;

  if (key.startsWith('@supports')) {
    return { priority: AT_SUPPORT_PRIORITY, type: 'atRule' };
  }

  if (key.startsWith('::')) {
    return { priority: PSEUDO_ELEMENT_PRIORITY, type: 'pseudoElement' };
  }

  if (key.startsWith(':')) {
    // TODO: Consider restoring pseudo-specific priorities
    return {
      priority: PSEUDO_CLASS_PRIORITY,
      type: 'pseudoClass',
    };
  }

  if (key.startsWith('@media')) {
    return { priority: AT_MEDIA_PRIORITY, type: 'atRule' };
  }

  if (key.startsWith('@container')) {
    return { priority: AT_CONTAINER_PRIORITY, type: 'atRule' };
  }

  if (order === 'clean-order') {
    const index = CLEAN_ORDER_PRIORITIES.indexOf(key);
    if (index !== -1) {
      return { priority: index, type: 'knownCssProperty' };
    }
  }

  return { priority: 1, type: 'string' };
}
