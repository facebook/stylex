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
  'containIntrinsicInlineSize', //
  'containIntrinsicBlockSize', //
  'containIntrinsicSize',
  'containIntrinsicWidth',
  'containIntrinsicHeight',
  'speak',
  'speakAs',

  // positioning (starting at 58)
  'isolation',
  'position',
  'zIndex',
  'inset', //
  'insetBlock', //
  'insetBlockStart', //
  'insetBlockEnd', //
  'insetInline', //
  'insetInlineStart', //
  'insetInlineEnd', //
  'top',
  'right',
  'bottom',
  'left',
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
  'overflowBlock', //
  'overflowInline', //
  'overflowX',
  'overflowY',
  'overflowClipMargin',
  'overscrollBehavior',
  'overscrollBehaviorInline', //
  'overscrollBehaviorBlock', //
  'overscrollBehaviorX',
  'overscrollBehaviorY',
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
  'minInlineSize', //
  'maxInlineSize', //
  'minWidth',
  'maxWidth',
  'height',
  'blockSize',
  'minBlockSize', //
  'maxBlockSize', //
  'minHeight',
  'maxHeight',
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
  'borderStartStartRadius', //
  'borderStartEndRadius', //
  'borderEndStartRadius', //
  'borderEndEndRadius', //
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
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

// Based on https://github.com/stormwarning/stylelint-config-recess-order/blob/293c244a8aea70f4abd81f0daa6653cae1c89351/groups.js
const RECESS_ORDER_PRIORITIES = [
  'composes',

  'all',

  // positioned layout
  'position',
  'inset',
  'insetBlock',
  'insetBlockStart',
  'insetBlockEnd',
  'insetInline',
  'insetInlineStart',
  'insetInlineEnd',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'float',
  'clear',

  // display
  'boxSizing',
  'display',
  'visibility',

  // flexible box layout
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'flexFlow',
  'flexDirection',
  'flexWrap',
  'WebkitBoxOrient',

  // grid layout
  'grid',
  'gridArea',
  'gridTemplate',
  'gridTemplateAreas',
  'gridTemplateRows',
  'gridTemplateColumns',
  'gridRow',
  'gridRowStart',
  'gridRowEnd',
  'gridColumn',
  'gridColumnStart',
  'gridColumnEnd',
  'gridAutoRows',
  'gridAutoColumns',
  'gridAutoFlow',
  'gridGap',
  'gridRowGap',
  'gridColumnGap',

  // box alignment
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

  // order
  'order',

  // box sizing
  'inlineSize',
  'minInlineSize',
  'maxInlineSize',
  'width',
  'minWidth',
  'maxWidth',
  'blockSize',
  'minBlockSize',
  'maxBlockSize',
  'height',
  'minHeight',
  'maxHeight',
  'aspectRatio',
  'containIntrinsicInlineSize',
  'containIntrinsicBlockSize',
  'containIntrinsicSize',
  'containIntrinsicWidth',
  'containIntrinsicHeight',

  // box model
  'padding',
  'paddingBlock',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInline',
  'paddingInlineStart',
  'paddingInlineEnd',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',

  // containment
  'contain',
  'container',
  'containerName',
  'containerType',
  'contentVisibility',

  // overflow
  'overflow',
  'overflowInline',
  'overflowBlock',
  'overflowX',
  'overflowY',
  'scrollbarGutter',
  'WebkitOverflowScrolling',
  'MsOverflowX',
  'MsOverflowY',
  'MsOverflowStyle',
  'textOverflow',
  'WebkitLineClamp',
  'lineClamp',
  'scrollBehaviour',

  // overscroll behavior
  'overscrollBehavior',
  'overscrollBehaviorInline',
  'overscrollBehaviorBlock',
  'overscrollBehaviorX',
  'overscrollBehaviorY',

  // fonts
  'font',
  'fontFamily',
  'fontSize',
  'fontSizeAdjust',
  'fontVariationSettings',
  'fontStyle',
  'fontWeight',
  'fontOpticalSizing',
  'fontStretch',
  'fontFeatureSettings',
  'fontKerning',
  'fontVariant',
  'fontVariantLigatures',
  'fontVariantCaps',
  'fontVariantAlternates',
  'fontVariantNumeric',
  'fontVariantEastAsian',
  'fontVariantPosition',
  'WebkitFontSmoothing',
  'MozOsxFontSmoothing',
  'fontSmooth',
  'fontSynthesis',
  'fontSynthesisWeight',
  'fontSynthesisStyle',
  'fontSynthesisSmallCaps',

  // inline layout
  'lineHeight',
  'verticalAlign',
  'alignmentBaseline',
  'baselineShift',
  'dominantBaseline',

  // colors
  'basePalette',
  'overrideColors',
  'fontPalette',
  'color',
  'WebkitTextFillColor',
  'WebkitTextStroke',
  'WebkitTextStrokeWidth',
  'WebkitTextStrokeColor',

  // text
  'textAlign',
  'textAlignLast',
  'textJustify',
  'textIndent',
  'textTransform',
  'wordSpacing',
  'letterSpacing',
  'hyphens',
  'hyphenateCharacter',
  'lineBreak',
  'wordBreak',
  'textWrap',
  'textWrapMode',
  'textWrapStyle',
  'wordWrap',
  'overflowWrap',
  'tabSize',
  'whiteSpace',
  'whiteSpaceCollapse',

  // text decoration
  'textEmphasis',
  'textEmphasisColor',
  'textEmphasisStyle',
  'textEmphasisPosition',
  'textDecoration',
  'textDecorationLine',
  'textDecorationThickness',
  'textDecorationStyle',
  'textDecorationColor',
  'textDecorationSkipInk',
  'textUnderlinePosition',
  'textUnderlineOffset',
  'textShadow',

  // ruby layout
  'rubyPosition',
  'rubyAlign',

  // font loading
  'src',
  'fontDisplay',
  'unicodeRange',
  'sizeAdjust',
  'ascentOverride',
  'descentOverride',
  'lineGapOverride',

  // basic user interface
  'appearance',
  'accentColor',
  'pointerEvents',
  'MsTouchAction',
  'touchAction',
  'cursor',
  'caretColor',
  'zoom',
  'resize',
  'userSelect',
  'WebkitUserSelect',
  'navIndex',
  'navUp',
  'navRight',
  'navDown',
  'navLeft',
  'outline',
  'outlineWidth',
  'outlineStyle',
  'outlineColor',
  'outlineOffset',

  // color adjustment
  'colorScheme',
  'forcedColorAdjust',
  'printColorAdjust',

  // table
  'tableLayout',
  'emptyCells',
  'captionSide',
  'borderSpacing',
  'borderCollapse',

  // generated content
  'content',
  'quotes',

  // lists and counters
  'listStyle',
  'listStylePosition',
  'listStyleType',
  'listStyleImage',
  'counterReset',
  'counterSet',
  'counterIncrement',

  // scroll snap
  'scrollSnapType',
  'scrollSnapAlign',
  'scrollSnapStop',
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

  // scrollbars styling
  'scrollbarColor',
  'scrollbarWidth',

  // images
  'objectFit',
  'objectPosition',
  'MsInterpolationMode',
  'imageOrientation',
  'imageRendering',
  'imageResolution',

  // backgrounds and borders
  'background',
  'backgroundColor',
  'backgroundImage',
  'backgroundRepeat',
  'backgroundAttachment',
  'backgroundPosition',
  'backgroundPositionX',
  'backgroundPositionY',
  'backgroundClip',
  'backgroundOrigin',
  'backgroundSize',
  'border',
  'borderColor',
  'borderStyle',
  'borderWidth',
  'borderBlock',
  'borderBlockStart',
  'borderBlockStartColor',
  'borderBlockStartStyle',
  'borderBlockStartWidth',
  'borderBlockEnd',
  'borderBlockEndColor',
  'borderBlockEndStyle',
  'borderBlockEndWidth',
  'borderInline',
  'borderInlineStart',
  'borderInlineStartColor',
  'borderInlineStartStyle',
  'borderInlineStartWidth',
  'borderInlineEnd',
  'borderInlineEndColor',
  'borderInlineEndStyle',
  'borderInlineEndWidth',
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
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'borderImage',
  'borderImageSource',
  'borderImageSlice',
  'borderImageWidth',
  'borderImageOutset',
  'borderImageRepeat',
  'boxShadow',

  // compositing and blending
  'backgroundBlendMode',
  'isolation',
  'mixBlendMode',
  'opacity',

  // filter effects
  'filter',
  'backdropFilter',

  // masking
  'clip',
  'clipPath',
  'clipRule',
  'maskBorder',
  'maskBorderSource',
  'maskBorderSlice',
  'maskBorderWidth',
  'maskBorderOutset',
  'maskBorderRepeat',
  'maskBorderMode',
  'mask',
  'maskImage',
  'maskMode',
  'maskRepeat',
  'maskPosition',
  'maskClip',
  'maskOrigin',
  'maskSize',
  'maskComposite',
  'maskType',

  // shapes
  'shapeOutside',
  'shapeImageThreshold',
  'shapeMargin',

  // writing modes
  'direction',
  'unicodeBidi',
  'writingMode',
  'textOrientation',
  'textCombineUpright',

  // svg presentation attributes
  'textAnchor',
  'fill',
  'fillRule',
  'fillOpacity',
  'stroke',
  'strokeOpacity',
  'strokeWidth',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeMiterlimit',
  'strokeDasharray',
  'strokeDashoffset',
  'colorInterpolation',
  'colorInterpolationFilters',
  'floodColor',
  'floodOpacity',
  'lightingColor',
  'marker',
  'markerStart',
  'markerMid',
  'markerEnd',
  'stopColor',
  'stopOpacity',
  'paintOrder',
  'shapeRendering',
  'textRendering',

  // transforms
  'transform',
  'transformOrigin',
  'transformBox',
  'transformStyle',
  'rotate',
  'scale',
  'translate',
  'perspective',
  'perspectiveOrigin',
  'backfaceVisibility',

  // transitions
  'transition',
  'transitionDelay',
  'transitionTimingFunction',
  'transitionDuration',
  'transitionProperty',

  // view transitions
  'viewTransitionName',
  'viewTransitionClass',

  // animations
  'animation',
  'animationName',
  'animationDuration',
  'animationTimingFunction',
  'animationDelay',
  'animationIterationCount',
  'animationDirection',
  'animationFillMode',
  'animationPlayState',
  'animationComposition',

  // motion path
  'offset',
  'offsetPosition',
  'offsetPath',
  'offsetDistance',
  'offsetRotate',
  'offsetAnchor',

  // will change
  'willChange',

  // fragmentation
  'breakBefore',
  'breakAfter',
  'breakInside',
  'widows',
  'orphans',
];

const ORDER_PRIORITIES = {
  'clean-order': CLEAN_ORDER_PRIORITIES,
  'recess-order': RECESS_ORDER_PRIORITIES,
};

export default function getPropertyPriorityAndType(
  key: string,
  order: 'asc' | 'clean-order' | 'recess-order',
): PriorityAndType {
  let BASE_PRIORITY = ORDER_PRIORITIES[order]
    ? ORDER_PRIORITIES[order].length - 1
    : 0;

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

  if (ORDER_PRIORITIES[order]) {
    const index = ORDER_PRIORITIES[order].indexOf(key);
    if (index !== -1) {
      return { priority: index, type: 'knownCssProperty' };
    }
  }

  return { priority: 1, type: 'string' };
}
