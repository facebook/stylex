/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

type CSSCursor =
  | 'auto'
  | 'default'
  | 'none'
  | 'context-menu'
  | 'help'
  | 'inherit'
  | 'pointer'
  | 'progress'
  | 'wait'
  | 'cell'
  | 'crosshair'
  | 'text'
  | 'vertical-text'
  | 'alias'
  | 'copy'
  | 'move'
  | 'no-drop'
  | 'not-allowed'
  | 'e-resize'
  | 'n-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 's-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'w-resize'
  | 'ew-resize'
  | 'ns-resize'
  | 'nesw-resize'
  | 'nwse-resize'
  | 'col-resize'
  | 'row-resize'
  | 'all-scroll'
  | 'zoom-in'
  | 'zoom-out'
  | 'grab'
  | 'grabbing'
  | '-webkit-grab'
  | '-webkit-grabbing';

type alignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'stretch'
  | all;
type alignItems =
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'stretch'
  | all;
type alignSelf =
  | 'auto'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'stretch'
  | all;
type all = 'initial' | 'inherit' | 'unset';
type animationDelay = time;
type animationDirection = singleAnimationDirection;
type animationDuration = time;
type animationFillMode = singleAnimationFillMode;
type animationIterationCount = singleAnimationIterationCount;
type animationName = singleAnimationName;
type animationPlayState = singleAnimationPlayState;
type animationTimingFunction = singleTimingFunction;
type appearance = 'auto' | 'none' | 'textfield' | string;
type backdropFilter = 'none' | string;
type backfaceVisibility = 'visible' | 'hidden';
// type background = string | finalBgLayer;
type backgroundAttachment = attachment;
type backgroundBlendMode = blendMode;
type backgroundClip = box;
type backgroundColor = color;
type backgroundImage = bgImage;
type backgroundOrigin = box;
type backgroundPosition = string;
type backgroundPositionX = string;
type backgroundPositionY = string;
type backgroundRepeat = repeatStyle;
type backgroundSize = bgSize;
type blockSize = width;
type border = borderWidth | brStyle | color;
type borderBlockEnd = borderWidth | borderStyle | color;
type borderBlockEndColor = color;
type borderBlockEndStyle = borderStyle;
type borderBlockEndWidth = borderWidth;
type borderBlockStart = borderWidth | borderStyle | color;
type borderBlockStartColor = color;
type borderBlockStartStyle = borderStyle;
type borderBlockStartWidth = borderWidth;
type borderBottomLeftRadius = lengthPercentage;
type borderBottomRightRadius = lengthPercentage;
type borderBottomStyle = brStyle;
type borderBottomWidth = borderWidth;
type borderCollapse = 'collapse' | 'separate';
type borderColor = color;
type borderImage =
  | borderImageSource
  | borderImageSlice
  | string
  | borderImageRepeat;
type borderImageOutset = string;
type borderImageRepeat = string;
type borderImageSlice = string | number | 'fill';
type borderImageSource = 'none' | string;
type borderImageWidth = string;
type borderInlineEnd = borderWidth | borderStyle | color;
type borderInlineEndColor = color;
type borderInlineEndStyle = borderStyle;
type borderInlineEndWidth = borderWidth;
type borderInlineStart = borderWidth | borderStyle | color;
type borderInlineStartColor = color;
type borderInlineStartStyle = borderStyle;
type borderInlineStartWidth = borderWidth;
type borderLeftColor = color;
type borderLeftStyle = brStyle;
type borderLeftWidth = borderWidth;
type borderRightColor = color;
type borderRightStyle = brStyle;
type borderRightWidth = borderWidth;
type borderRadius = lengthPercentage;
type borderSpacing = number;
type borderStyle = brStyle;
type borderTopLeftRadius = lengthPercentage;
type borderTopRightRadius = lengthPercentage;
type borderTopStyle = brStyle;
type borderTopWidth = borderWidth;
type boxAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
type boxDecorationBreak = 'slice' | 'clone';
type boxDirection = 'normal' | 'reverse' | 'inherit';
type boxFlex = number;
type boxFlexGroup = number;
type boxLines = 'single' | 'multiple';
type boxOrdinalGroup = number;
type boxOrient =
  | 'horizontal'
  | 'vertical'
  | 'inline-axis'
  | 'block-axis'
  | 'inherit';
type boxShadow = 'none' | string;
type boxSizing = 'content-box' | 'border-box';
type boxSuppress = 'show' | 'discard' | 'hide';
type breakAfter =
  | 'auto'
  | 'avoid'
  | 'avoid-page'
  | 'page'
  | 'left'
  | 'right'
  | 'recto'
  | 'verso'
  | 'avoid-column'
  | 'column'
  | 'avoid-region'
  | 'region';
type breakBefore =
  | 'auto'
  | 'avoid'
  | 'avoid-page'
  | 'page'
  | 'left'
  | 'right'
  | 'recto'
  | 'verso'
  | 'avoid-column'
  | 'column'
  | 'avoid-region'
  | 'region';
type breakInside =
  | 'auto'
  | 'avoid'
  | 'avoid-page'
  | 'avoid-column'
  | 'avoid-region';
type captionSide =
  | 'top'
  | 'bottom'
  | 'block-start'
  | 'block-end'
  | 'inline-start'
  | 'inline-end';
type clear = 'none' | 'left' | 'right' | 'both' | 'inline-start' | 'inline-end';
type clip = string | 'auto';
type clipPath = string | 'none';
type columnCount = number | 'auto';
type columnFill = 'auto' | 'balance';
type columnGap = number | string | 'normal';
type columnRule = columnRuleWidth | columnRuleStyle | columnRuleColor;
type columnRuleColor = color;
type columnRuleStyle = brStyle;
type columnRuleWidth = borderWidth;
type columnSpan = 'none' | 'all';
type columnWidth = number | 'auto';
type columns = columnWidth | columnCount;
type contain = 'none' | 'strict' | 'content' | string;
type content = string;
type counterIncrement = string | 'none';
type counterReset = string | 'none';
type cursor = CSSCursor;
type direction = 'ltr' | 'rtl' | 'inherit';
type display =
  | 'none'
  | 'inherit'
  | 'inline'
  | 'block'
  | 'list-item'
  | 'inline-list-item'
  | 'inline-block'
  | 'inline-table'
  | 'table'
  | 'table-cell'
  | 'table-column'
  | 'table-column-group'
  | 'table-footer-group'
  | 'table-header-group'
  | 'table-row'
  | 'table-row-group'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'run-in'
  | 'ruby'
  | 'ruby-base'
  | 'ruby-text'
  | 'ruby-base-container'
  | 'ruby-text-container'
  | 'contents';
type displayInside = 'auto' | 'block' | 'table' | 'flex' | 'grid' | 'ruby';
type displayList = 'none' | 'list-item';
type displayOutside =
  | 'block-level'
  | 'inline-level'
  | 'run-in'
  | 'contents'
  | 'none'
  | 'table-row-group'
  | 'table-header-group'
  | 'table-footer-group'
  | 'table-row'
  | 'table-cell'
  | 'table-column-group'
  | 'table-column'
  | 'table-caption'
  | 'ruby-base'
  | 'ruby-text'
  | 'ruby-base-container'
  | 'ruby-text-container';
type emptyCells = 'show' | 'hide';
type filter = 'none' | string;
type flex = 'none' | string | number;
type flexBasis = 'content' | number | string | 'inherit';
type flexDirection =
  | 'row'
  | 'row-reverse'
  | 'column'
  | 'column-reverse'
  | 'inherit';
type flexFlow = flexDirection | flexWrap;
type flexGrow = number | 'inherit';
type flexShrink = number | 'inherit';
type flexWrap = 'nowrap' | 'wrap' | 'wrap-reverse' | 'inherit';
type float =
  | 'left'
  | 'right'
  | 'none'
  | 'start'
  | 'end'
  | 'inline-start'
  | 'inline-end'
  | 'inherit';
type fontFamily = string;
type fontFeatureSettings = 'normal' | string;
type fontKerning = 'auto' | 'normal' | 'none';
type fontLanguageOverride = 'normal' | string;
type fontSize = absoluteSize | relativeSize | lengthPercentage;
type fontSizeAdjust = 'none' | number;
type fontStretch =
  | 'normal'
  | 'ultra-condensed'
  | 'extra-condensed'
  | 'condensed'
  | 'semi-condensed'
  | 'semi-expanded'
  | 'expanded'
  | 'extra-expanded'
  | 'ultra-expanded';
type fontStyle = 'normal' | 'italic' | 'oblique';
type fontSynthesis = 'none' | string;
type fontVariant = 'normal' | 'none' | string;
type fontVariantAlternates = 'normal' | string;
type fontVariantCaps =
  | 'normal'
  | 'small-caps'
  | 'all-small-caps'
  | 'petite-caps'
  | 'all-petite-caps'
  | 'unicase'
  | 'titling-caps';
type fontVariantEastAsian = 'normal' | string;
type fontVariantLigatures = 'normal' | 'none' | string;
type fontVariantNumeric = 'normal' | string;
type fontVariantPosition = 'normal' | 'sub' | 'super';
type fontWeight =
  | 'inherit'
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;
type gap = number | string;
type grid = gridTemplate | string;
type gridArea = gridLine | string;
type gridAutoColumns = trackSize;
type gridAutoFlow = string | 'dense';
type gridAutoRows = trackSize;
type gridColumn = gridLine | string;
type gridColumnEnd = gridLine;
type gridColumnGap = lengthPercentage;
type gridColumnStart = gridLine;
type gridGap = gridRowGap | gridColumnGap;
type gridRow = gridLine | string;
type gridRowEnd = gridLine;
type gridRowGap = lengthPercentage;
type gridRowStart = gridLine;
type gridTemplate = 'none' | 'subgrid' | string;
type gridTemplateAreas = 'none' | string;
type gridTemplateColumns = 'none' | 'subgrid' | string;
type gridTemplateRows = 'none' | 'subgrid' | string;
type hyphens = 'none' | 'manual' | 'auto';
type imageOrientation = 'from-image' | number | string;
type imageRendering =
  | 'auto'
  | 'crisp-edges'
  | 'pixelated'
  | 'optimizeSpeed'
  | 'optimizeQuality'
  | string;
type imageResolution = string | 'snap';
type imeMode = 'auto' | 'normal' | 'active' | 'inactive' | 'disabled';
type initialLetter = 'normal' | string;
type initialLetterAlign = string;
type inlineSize = width;
type isolation = 'auto' | 'isolate';
type justifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'inherit';
type justifyItems =
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'stretch'
  | all;
// There's an optional overflowPosition (safe vs unsafe) prefix to
// [selfPosition | 'left' | 'right']. It's not used on www, so, it's not added
// here.
type justifySelf =
  | 'auto'
  | 'normal'
  | 'stretch'
  | baselinePosition
  | selfPosition
  | 'left'
  | 'right';
type letterSpacing = 'normal' | lengthPercentage;
type lineBreak = 'auto' | 'loose' | 'normal' | 'strict';
type lineHeight = 'inherit' | number;
type listStyle = listStyleType | listStylePosition | listStyleImage;
type listStyleImage = string | 'none';
type listStylePosition = 'inside' | 'outside';
type listStyleType = string | 'none';
type margin = number | string;
type marginBlockEnd = marginLeft;
type marginBlockStart = marginLeft;
type marginBottom = number | string | 'auto';
type marginInlineEnd = marginLeft;
type marginInlineStart = marginLeft;
type marginLeft = number | string | 'auto';
type marginRight = number | string | 'auto';
type marginTop = number | string | 'auto';
type markerOffset = number | 'auto';
type mask = maskLayer;
type maskClip = string;
type maskComposite = compositeOperator;
type maskMode = maskingMode;
type maskOrigin = geometryBox;
type maskPosition = string;
type maskRepeat = repeatStyle;
type maskSize = bgSize;
type maskType = 'luminance' | 'alpha';
type maxBlockSize = maxWidth;
type maxHeight =
  | number
  | string
  | 'none'
  | 'max-content'
  | 'min-content'
  | 'fit-content'
  | 'fill-available';
type maxInlineSize = maxWidth;
type maxWidth =
  | number
  | string
  | 'none'
  | 'max-content'
  | 'min-content'
  | 'fit-content'
  | 'fill-available';
type minBlockSize = minWidth;
type minHeight =
  | number
  | string
  | 'auto'
  | 'max-content'
  | 'min-content'
  | 'fit-content'
  | 'fill-available';
type minInlineSize = minWidth;
type minWidth =
  | number
  | string
  | 'auto'
  | 'max-content'
  | 'min-content'
  | 'fit-content'
  | 'fill-available';
type mixBlendMode = blendMode;
type motion = motionPath | motionOffset | motionRotation;
type motionOffset = lengthPercentage;
type motionPath = string | geometryBox | 'none';
type motionRotation = string | number;
type MsOverflowStyle =
  | 'auto'
  | 'none'
  | 'scrollbar'
  | '-ms-autohiding-scrollbar';
type objectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
type objectPosition = string;
type opacity = number;
type order = number;
type orphans = number;
type outline = string;
type outlineColor = color | 'invert';
type outlineOffset = number;
type outlineStyle = 'auto' | brStyle;
type outlineWidth = borderWidth;
type overflow = 'visible' | 'hidden' | 'scroll' | 'auto';
type overflowAnchor = 'auto' | 'none';
type overflowWrap = 'normal' | 'break-word';
type overflowX = 'visible' | 'hidden' | 'scroll' | 'auto';
type overflowY = 'visible' | 'hidden' | 'scroll' | 'auto';
type overscrollBehavior = 'none' | 'contain' | 'auto';
type overscrollBehaviorX = 'none' | 'contain' | 'auto';
type overscrollBehaviorY = 'none' | 'contain' | 'auto';
type padding = number | string;
type paddingBlockEnd = paddingLeft;
type paddingBlockStart = paddingLeft;
type paddingBottom = number | string;
type paddingLeft = number | string;
type paddingRight = number | string;
type paddingTop = number | string;
type pageBreakAfter = 'auto' | 'always' | 'avoid' | 'left' | 'right';
type pageBreakBefore = 'auto' | 'always' | 'avoid' | 'left' | 'right';
type pageBreakInside = 'auto' | 'avoid';
type perspective = 'none' | number;
type perspectiveOrigin = string;
type pointerEvents =
  | 'auto'
  | 'none'
  | 'visiblePainted'
  | 'visibleFill'
  | 'visibleStroke'
  | 'visible'
  | 'painted'
  | 'fill'
  | 'stroke'
  | 'all'
  | 'inherit';
type position = 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed';
type quotes = string | 'none';
type resize = 'none' | 'both' | 'horizontal' | 'vertical';
type rowGap = number | string;
type rubyAlign = 'start' | 'center' | 'space-between' | 'space-around';
type rubyMerge = 'separate' | 'collapse' | 'auto';
type rubyPosition = 'over' | 'under' | 'inter-character';
type scrollBehavior = 'auto' | 'smooth';
type scrollSnapAlign = 'none' | 'start' | 'end' | 'center';
type scrollSnapType = 'none' | 'x mandatory' | 'y mandatory';
type selfPosition =
  | 'center'
  | 'start'
  | 'end'
  | 'self-start'
  | 'self-end'
  | 'flex-start'
  | 'flex-end';
type shapeImageThreshold = number;
type shapeMargin = lengthPercentage;
type shapeOutside = 'none' | shapeBox | string;
type tabSize = number;
type tableLayout = 'auto' | 'fixed';
type textAlign =
  | 'start'
  | 'end'
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'match-parent'
  | 'inherit';
type textAlignLast =
  | 'auto'
  | 'start'
  | 'end'
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'inherit';
type textCombineUpright = 'none' | 'all' | string;
type textDecoration =
  | textDecorationLine
  | textDecorationStyle
  | textDecorationColor;
type textDecorationColor = color;
type textDecorationLine = 'none' | string;
type textDecorationSkip = 'none' | string;
type textDecorationStyle = 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
type textEmphasis = textEmphasisStyle | textEmphasisColor;
type textEmphasisColor = color;
type textEmphasisPosition = string;
type textEmphasisStyle = 'none' | string;
type textIndent = lengthPercentage | 'hanging' | 'each-line';
type textOrientation = 'mixed' | 'upright' | 'sideways';
type textOverflow = string;
type textRendering =
  | 'auto'
  | 'optimizeSpeed'
  | 'optimizeLegibility'
  | 'geometricPrecision';
type textShadow = 'none' | string;
type textSizeAdjust = 'none' | 'auto' | string;
type textTransform =
  | 'none'
  | 'capitalize'
  | 'uppercase'
  | 'lowercase'
  | 'full-width';
type textUnderlinePosition = 'auto' | string;
type touchAction = 'auto' | 'none' | string | 'manipulation';
type transform = 'none' | string;
type transformBox = 'border-box' | 'fill-box' | 'view-box';
type transformOrigin = string | number;
type transformStyle = 'flat' | 'preserve-3d';
type transition = singleTransition;
type transitionDelay = time;
type transitionDuration = time;
type transitionProperty = 'none' | singleTransitionProperty;
type transitionTimingFunction = singleTransitionTimingFunction;
type unicodeBidi =
  | 'normal'
  | 'embed'
  | 'isolate'
  | 'bidi-override'
  | 'isolate-override'
  | 'plaintext';
type userSelect = 'auto' | 'text' | 'none' | 'contain' | 'all';
type verticalAlign =
  | 'baseline'
  | 'sub'
  | 'super'
  | 'text-top'
  | 'text-bottom'
  | 'middle'
  | 'top'
  | 'bottom'
  | string
  | number;
type visibility = 'visible' | 'hidden' | 'collapse';
type whiteSpace =
  | 'normal'
  | 'pre'
  | 'nowrap'
  | 'pre-wrap'
  | 'pre-line'
  | 'initial'
  | 'inherit';
type widows = number;
type width =
  | string
  | number
  | 'available'
  | 'min-content'
  | 'max-content'
  | 'fit-content'
  | 'auto';
type willChange = 'auto' | animatableFeature;
type wordBreak = 'normal' | 'break-all' | 'keep-all' | nonStandardWordBreak;
type wordSpacing = 'normal' | lengthPercentage;
type wordWrap = 'normal' | 'break-word';
type writingMode =
  | 'horizontal-tb'
  | 'vertical-rl'
  | 'vertical-lr'
  | 'sideways-rl'
  | 'sideways-lr'
  | svgWritingMode;
type zIndex = 'auto' | number;
type alignmentBaseline =
  | 'auto'
  | 'baseline'
  | 'before-edge'
  | 'text-before-edge'
  | 'middle'
  | 'central'
  | 'after-edge'
  | 'text-after-edge'
  | 'ideographic'
  | 'alphabetic'
  | 'hanging'
  | 'mathematical';
type baselinePosition = 'baseline' | 'first baseline' | 'last baseline';
type baselineShift = 'baseline' | 'sub' | 'super' | svgLength;
type behavior = string;
type clipRule = 'nonzero' | 'evenodd';
type cue = cueBefore | cueAfter;
type cueAfter = string | number | 'none';
type cueBefore = string | number | 'none';
type dominantBaseline =
  | 'auto'
  | 'use-script'
  | 'no-change'
  | 'reset-size'
  | 'ideographic'
  | 'alphabetic'
  | 'hanging'
  | 'mathematical'
  | 'central'
  | 'middle'
  | 'text-after-edge'
  | 'text-before-edge';
type fill = paint;
type fillOpacity = number;
type fillRule = 'nonzero' | 'evenodd';
type glyphOrientationHorizontal = number;
type glyphOrientationVertical = number;
type kerning = 'auto' | svgLength;
type marker = 'none' | string;
type markerEnd = 'none' | string;
type markerMid = 'none' | string;
type markerStart = 'none' | string;
type pause = pauseBefore | pauseAfter;
type pauseAfter =
  | number
  | 'none'
  | 'x-weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'x-strong';
type pauseBefore =
  | number
  | 'none'
  | 'x-weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'x-strong';
type rest = restBefore | restAfter;
type restAfter =
  | number
  | 'none'
  | 'x-weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'x-strong';
type restBefore =
  | number
  | 'none'
  | 'x-weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'x-strong';
type shapeRendering =
  | 'auto'
  | 'optimizeSpeed'
  | 'crispEdges'
  | 'geometricPrecision';
type src = string;
type speak = 'auto' | 'none' | 'normal';
type speakAs = 'normal' | 'spell-out' | 'digits' | string;
type stroke = paint;
type strokeDasharray = 'none' | string;
type strokeDashoffset = svgLength;
type strokeLinecap = 'butt' | 'round' | 'square';
type strokeLinejoin = 'miter' | 'round' | 'bevel';
type strokeMiterlimit = number;
type strokeOpacity = number;
type strokeWidth = svgLength;
type textAnchor = 'start' | 'middle' | 'end';
type unicodeRange = string;
type voiceBalance =
  | number
  | 'left'
  | 'center'
  | 'right'
  | 'leftwards'
  | 'rightwards';
type voiceDuration = 'auto' | time;
type voiceFamily = string | 'preserve';
type voicePitch = number | 'absolute' | string;
type voiceRange = number | 'absolute' | string;
type voiceRate = string;
type voiceStress = 'normal' | 'strong' | 'moderate' | 'none' | 'reduced';
type voiceVolume = 'silent' | string;
type absoluteSize =
  | 'xx-small'
  | 'x-small'
  | 'small'
  | 'medium'
  | 'large'
  | 'x-large'
  | 'xx-large';
type animatableFeature = 'scroll-position' | 'contents' | string;
type attachment = 'scroll' | 'fixed' | 'local';
type bgImage = 'none' | string;
type bgSize = string | 'cover' | 'contain';
type box = 'border-box' | 'padding-box' | 'content-box';
type brStyle =
  | 'none'
  | 'hidden'
  | 'dotted'
  | 'dashed'
  | 'solid'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset';
type borderWidth = number | 'thin' | 'medium' | 'thick' | string;
type color = string;
type compositeOperator = 'add' | 'subtract' | 'intersect' | 'exclude';
// type finalBgLayer =
//   | bgImage
//   | string
//   | repeatStyle
//   | attachment
//   | box
//   | backgroundColor;
type geometryBox = shapeBox | 'fill-box' | 'stroke-box' | 'view-box';
type gridLine = 'auto' | string;
type lengthPercentage = number | string;
type maskLayer =
  | maskReference
  | maskingMode
  | string
  | repeatStyle
  | geometryBox
  | compositeOperator;
type maskReference = 'none' | string;
type maskingMode = 'alpha' | 'luminance' | 'match-source';
type relativeSize = 'larger' | 'smaller';
type repeatStyle = 'repeat-x' | 'repeat-y' | string;
type shapeBox = box | 'margin-box';
type singleAnimationDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse';
type singleAnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
type singleAnimationIterationCount = 'infinite' | number;
type singleAnimationName = 'none' | string;
type singleAnimationPlayState = 'running' | 'paused';
type singleTimingFunction = singleTransitionTimingFunction;
type singleTransition = singleTransitionTimingFunction | string | number;
type singleTransitionTimingFunction =
  | 'ease'
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'step-start'
  | 'step-end'
  | string;
type singleTransitionProperty = 'all' | string;
type time = string;
type trackBreadth =
  | lengthPercentage
  | string
  | 'min-content'
  | 'max-content'
  | 'auto';
type trackSize = trackBreadth | string;
type nonStandardWordBreak = 'break-word';
type blendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';
type maskImage = maskReference;
type paint = 'none' | 'currentColor' | color | string;
type svgLength = string | number;
type svgWritingMode = 'lr-tb' | 'rl-tb' | 'tb-rl' | 'lr' | 'rl' | 'tb';
type top = number | string;

type OptionalArray<T> = Array<T> | T;

export type SupportedVendorSpecificCSSProperties = $ReadOnly<{
  MozOsxFontSmoothing?: null | 'grayscale',
  WebkitAppearance?: null | appearance,
  WebkitFontSmoothing?: null | 'antialiased',
  WebkitTapHighlightColor?: null | color,
}>;

export type CSSProperties = $ReadOnly<{
  // NOTE: adding a non-CSS property here for support themes in Stylex.
  theme?: null | string,

  // ...$Exact<SupportedVendorSpecificCSSProperties>, for Typescript compatibility
  MozOsxFontSmoothing?: null | 'grayscale',
  WebkitAppearance?: null | appearance,
  WebkitFontSmoothing?: null | 'antialiased',
  WebkitTapHighlightColor?: null | color,

  WebkitBoxOrient?:
    | null
    | 'vertical'
    | 'horizontal'
    | 'inline-axis'
    | 'block-axis',
  WebkitLineClamp?: null | number,
  // ENDOF ...$Exact<SupportedVendorSpecificCSSProperties>,

  accentColor?: null | color,

  aspectRatio?: null | number | string,

  placeContent?: null | string,
  alignContent?: null | alignContent,
  justifyContent?: null | justifyContent,
  placeItems?: null | string,
  alignItems?: null | alignItems,
  justifyItems?: null | justifyItems,
  alignSelf?: null | alignSelf,
  justifySelf?: null | justifySelf,

  alignmentBaseline?: null | alignmentBaseline,
  alignTracks?: null | string,
  justifyTracks?: null | string,
  masonryAutoFlow?: null | string,

  // Not Allowed:
  // all?: null | all,
  animation?: null | string,
  animationComposition?: null | string,
  animationDelay?: null | OptionalArray<animationDelay>,
  animationDirection?: null | OptionalArray<animationDirection>,
  animationDuration?: null | OptionalArray<animationDuration>,
  animationFillMode?: null | OptionalArray<animationFillMode>,
  animationIterationCount?: null | OptionalArray<animationIterationCount>,
  animationName?: null | OptionalArray<animationName>,
  animationPlayState?: null | OptionalArray<animationPlayState>,
  animationTimingFunction?: null | OptionalArray<animationTimingFunction>,
  animationTimeline?: null | string,
  animationRange?: null | string,
  animationRangeStart?: null | string,
  animationRangeEnd?: null | string,
  appearance?: null | appearance,
  azimuth?: null | string,

  backdropFilter?: null | backdropFilter,
  backfaceVisibility?: null | backfaceVisibility,
  background?: null | string,
  backgroundAttachment?: null | OptionalArray<backgroundAttachment>,
  backgroundBlendMode?: null | OptionalArray<backgroundBlendMode>,
  backgroundClip?: null | OptionalArray<backgroundClip>,
  backgroundColor?: null | backgroundColor,
  backgroundImage?: null | OptionalArray<backgroundImage>,
  backgroundOrigin?: null | OptionalArray<backgroundOrigin>,
  backgroundPosition?: null | OptionalArray<backgroundPosition>,
  backgroundPositionX?: null | OptionalArray<backgroundPositionX>,
  backgroundPositionY?: null | OptionalArray<backgroundPositionY>,
  backgroundRepeat?: null | OptionalArray<backgroundRepeat>,
  backgroundSize?: null | OptionalArray<backgroundSize>,
  baselineShift?: null | baselineShift,
  behavior?: null | behavior,
  blockSize?: null | blockSize,
  border?: null | border,
  borderBlock?: null | borderBlockEnd,
  borderBlockColor?: null | borderBlockEndColor,
  borderBlockStyle?: null | borderBlockEndStyle,
  borderBlockWidth?: null | borderBlockEndWidth,
  borderBlockEnd?: null | borderBlockEnd,
  borderBlockEndColor?: null | borderBlockEndColor,
  borderBlockEndStyle?: null | borderBlockEndStyle,
  borderBlockEndWidth?: null | borderBlockEndWidth,
  borderBlockStart?: null | borderBlockStart,
  borderBlockStartColor?: null | borderBlockStartColor,
  borderBlockStartStyle?: null | borderBlockStartStyle,
  borderBlockStartWidth?: null | borderBlockStartWidth,
  borderBottom?: null | border,
  borderBottomColor?: null | color,
  borderBottomStyle?: null | borderBottomStyle,
  borderBottomWidth?: null | borderBottomWidth,
  borderCollapse?: null | borderCollapse,
  borderColor?: null | borderColor,
  borderEnd?: null | border,
  borderEndColor?: null | borderRightColor,
  borderEndStyle?: null | borderRightStyle,
  borderEndWidth?: null | borderRightWidth,
  borderImage?: null | borderImage,
  borderImageOutset?: null | borderImageOutset,
  borderImageRepeat?: null | borderImageRepeat,
  borderImageSlice?: null | borderImageSlice,
  borderImageSource?: null | borderImageSource,
  borderImageWidth?: null | borderImageWidth,
  borderInline?: null | borderInlineEnd,
  borderInlineColor?: null | borderInlineEndColor,
  borderInlineStyle?: null | borderInlineEndStyle,
  borderInlineWidth?: null | borderInlineEndWidth,
  borderInlineEnd?: null | borderInlineEnd,
  borderInlineEndColor?: null | borderInlineEndColor,
  borderInlineEndStyle?: null | borderInlineEndStyle,
  borderInlineEndWidth?: null | borderInlineEndWidth,
  borderInlineStart?: null | borderInlineStart,
  borderInlineStartColor?: null | borderInlineStartColor,
  borderInlineStartStyle?: null | borderInlineStartStyle,
  borderInlineStartWidth?: null | borderInlineStartWidth,
  borderLeft?: null | border,
  borderLeftColor?: null | borderLeftColor,
  borderLeftStyle?: null | borderLeftStyle,
  borderLeftWidth?: null | borderLeftWidth,
  borderRight?: null | border,
  borderRightColor?: null | borderRightColor,
  borderRightStyle?: null | borderRightStyle,
  borderRightWidth?: null | borderRightWidth,
  borderSpacing?: null | borderSpacing,
  borderStart?: null | border,
  borderStartColor?: null | borderLeftColor,
  borderStartStyle?: null | borderLeftStyle,
  borderStartWidth?: null | borderLeftWidth,
  borderStyle?: null | borderStyle,
  borderTop?: null | border,
  borderTopColor?: null | color,

  borderRadius?: null | borderRadius,
  borderEndStartRadius?: null | borderBottomLeftRadius,
  borderStartStartRadius?: null | borderTopLeftRadius,
  borderStartEndRadius?: null | borderTopRightRadius,
  borderEndEndRadius?: null | borderBottomRightRadius,
  borderTopLeftRadius?: null | borderTopLeftRadius,
  borderTopRightRadius?: null | borderTopRightRadius,
  borderBottomLeftRadius?: null | borderBottomLeftRadius,
  borderBottomRightRadius?: null | borderBottomRightRadius,

  borderTopStyle?: null | borderTopStyle,
  borderTopWidth?: null | borderTopWidth,
  borderWidth?: null | borderWidth,
  bottom?: null | number | string,
  boxAlign?: null | boxAlign,
  boxDecorationBreak?: null | boxDecorationBreak,
  boxDirection?: null | boxDirection,
  boxFlex?: null | boxFlex,
  boxFlexGroup?: null | boxFlexGroup,
  boxLines?: null | boxLines,
  boxOrdinalGroup?: null | boxOrdinalGroup,
  boxOrient?: null | boxOrient,
  boxShadow?: null | OptionalArray<boxShadow>,
  boxSizing?: null | boxSizing,
  boxSuppress?: null | boxSuppress,
  breakAfter?: null | breakAfter,
  breakBefore?: null | breakBefore,
  breakInside?: null | breakInside,

  captionSide?: null | captionSide,
  caret?: null | string,
  caretColor?: null | color,
  caretShape?: null | string,
  clear?: null | clear,
  clip?: null | clip,
  clipPath?: null | clipPath,
  clipRule?: null | clipRule,
  color?: null | color,

  colorScheme?:
    | null
    | 'normal'
    | 'light'
    | 'dark'
    | 'light dark'
    | 'only light'
    | 'only dark',
  forcedColorAdjust?: null | 'auto' | 'none',
  printColorAdjust?: null | 'economy' | 'exact',

  columns?: null | columns,
  columnCount?: null | columnCount,
  columnWidth?: null | columnWidth,

  columnRule?: null | columnRule,
  columnRuleColor?: null | columnRuleColor,
  columnRuleStyle?: null | columnRuleStyle,
  columnRuleWidth?: null | columnRuleWidth,

  columnFill?: null | columnFill,
  columnGap?: null | columnGap,
  columnSpan?: null | columnSpan,

  contain?: null | contain,
  containIntrinsicSize?: null | number | string,
  containIntrinsicBlockSize?: null | number | string,
  containIntrinsicInlineSize?: null | number | string,
  containIntrinsicHeightSize?: null | number | string,
  containIntrinsicWidthSize?: null | number | string,

  container?: null | string,
  containerName?: null | string,
  containerType?: null | 'size' | 'inline-size' | 'normal',

  contentVisibility?: null | 'visible' | 'hidden' | 'auto',

  content?: null | content,

  counterIncrement?: null | counterIncrement,
  counterReset?: null | counterReset,
  counterSet?: null | string | number,

  cue?: null | cue,
  cueAfter?: null | cueAfter,
  cueBefore?: null | cueBefore,
  cursor?: null | OptionalArray<cursor>,
  direction?: null | direction,
  display?: null | display,
  displayInside?: null | displayInside,
  displayList?: null | displayList,
  displayOutside?: null | displayOutside,
  dominantBaseline?: null | dominantBaseline,
  emptyCells?: null | emptyCells,
  end?: null | number | string,
  fill?: null | fill,
  fillOpacity?: null | fillOpacity,
  fillRule?: null | fillRule,
  filter?: null | filter,
  flex?: null | flex,
  flexBasis?: null | flexBasis,
  flexDirection?: null | flexDirection,
  flexFlow?: null | flexFlow,
  flexGrow?: null | flexGrow,
  flexShrink?: null | flexShrink,
  flexWrap?: null | flexWrap,
  float?: null | float,

  font?: null | string,
  fontFamily?: null | fontFamily,
  fontFeatureSettings?: null | fontFeatureSettings,
  fontKerning?: null | fontKerning,
  fontLanguageOverride?: null | fontLanguageOverride,
  fontSize?: null | fontSize,
  fontSizeAdjust?: null | fontSizeAdjust,
  fontStretch?: null | fontStretch,
  fontStyle?: null | fontStyle,
  fontSynthesis?: null | fontSynthesis,
  fontSynthesisWeight?: null | 'auto' | 'none',
  fontSynthesisStyle?: null | 'auto' | 'none',
  fontSynthesisSmallCaps?: null | 'auto' | 'none',
  fontSynthesisPosition?: null | 'auto' | 'none',

  fontVariant?: null | fontVariant,
  fontVariantAlternates?: null | fontVariantAlternates,
  fontVariantCaps?: null | fontVariantCaps,
  fontVariantEastAsian?: null | fontVariantEastAsian,
  fontVariantLigatures?: null | fontVariantLigatures,
  fontVariantNumeric?: null | fontVariantNumeric,
  fontVariantPosition?: null | fontVariantPosition,
  fontWeight?: null | fontWeight,
  // fontHeight?: null | number | string,
  // fontWidth?: null | number | string,
  fontFeatureSettings?: null | string,
  fontKerning?: null | 'auto' | 'normal' | 'none',
  fontLanguageOverride?: null | string,
  fontOpticalSizing?: null | 'auto' | 'none',
  fontPalette?: null | 'light' | 'dark' | string,
  fontVariationSettings?: null | string,

  gap?: null | gap,
  glyphOrientationHorizontal?: null | glyphOrientationHorizontal,
  glyphOrientationVertical?: null | glyphOrientationVertical,
  grid?: null | grid,
  gridArea?: null | gridArea,
  gridAutoColumns?: null | gridAutoColumns,
  gridAutoFlow?: null | gridAutoFlow,
  gridAutoRows?: null | gridAutoRows,
  gridColumn?: null | gridColumn,
  gridColumnEnd?: null | gridColumnEnd,
  gridColumnGap?: null | gridColumnGap,
  gridColumnStart?: null | gridColumnStart,
  gridGap?: null | gridGap,
  gridRow?: null | gridRow,
  gridRowEnd?: null | gridRowEnd,
  gridRowGap?: null | gridRowGap,
  gridRowStart?: null | gridRowStart,
  gridTemplate?: null | gridTemplate,
  gridTemplateAreas?: null | gridTemplateAreas,
  gridTemplateColumns?: null | gridTemplateColumns,
  gridTemplateRows?: null | gridTemplateRows,

  hangingPunctuation?: null | string,
  hyphenateCharacter?: null | string,
  hyphenateLimitChars?: null | string | number,
  hyphens?: null | hyphens,

  height?: null | number | string,

  imageOrientation?: null | imageOrientation,
  imageRendering?: null | imageRendering,
  imageResolution?: null | imageResolution,
  imeMode?: null | imeMode,
  // inputSecurity?: null | string,
  initialLetter?: null | initialLetter,
  initialLetterAlign?: null | initialLetterAlign,
  inlineSize?: null | inlineSize,

  inset?: null | number | string,
  insetBlock?: null | number | string,
  insetBlockEnd?: null | number | string,
  insetBlockStart?: null | number | string,
  insetInline?: null | number | string,
  insetInlineEnd?: null | number | string,
  insetInlineStart?: null | number | string,

  isolation?: null | isolation,
  kerning?: null | kerning,
  left?: null | number | string,
  letterSpacing?: null | letterSpacing,
  lineBreak?: null | lineBreak,
  lineHeight?: null | lineHeight,
  lineHeightStep?: null | number | string,
  listStyle?: null | listStyle,
  listStyleImage?: null | listStyleImage,
  listStylePosition?: null | listStylePosition,
  listStyleType?: null | listStyleType,
  margin?: null | margin,
  marginBlock?: null | marginBlockEnd,
  marginBlockEnd?: null | marginBlockEnd,
  marginBlockStart?: null | marginBlockStart,
  marginBottom?: null | marginBottom,
  marginEnd?: null | marginRight,
  // @deprecated
  marginHorizontal?: null | marginLeft,
  marginInline?: null | marginInlineEnd,
  marginInlineEnd?: null | marginInlineEnd,
  marginInlineStart?: null | marginInlineStart,
  marginLeft?: null | marginLeft,
  marginRight?: null | marginRight,
  marginStart?: null | marginLeft,
  marginTop?: null | marginTop,
  // @deprecated
  marginVertical?: null | marginTop,

  marginTrim?:
    | null
    | 'none'
    | 'block'
    | 'block-start'
    | 'block-end'
    | 'inline'
    | 'inline-start'
    | 'inline-end',

  marker?: null | marker,
  markerEnd?: null | markerEnd,
  markerMid?: null | markerMid,
  markerOffset?: null | markerOffset,
  markerStart?: null | markerStart,
  mask?: null | mask,
  maskClip?: null | maskClip,
  maskComposite?: null | maskComposite,
  maskImage?: null | maskImage,
  maskMode?: null | maskMode,
  maskOrigin?: null | maskOrigin,
  maskPosition?: null | maskPosition,
  maskRepeat?: null | maskRepeat,
  maskSize?: null | maskSize,
  maskType?: null | maskType,

  maskBorder?: null | string,
  maskBorderMode?: null | 'alpha' | 'luminance',
  maskBorderOutset?: null | string | number,
  maskBorderRepeat?: null | 'stretch' | 'repeat' | 'round' | 'space',
  maskBorderSlice?: null | string | number,
  maskBorderSource?: null | string,
  maskBorderWidth?: null | string | number,

  maxBlockSize?: null | maxBlockSize,
  maxHeight?: null | maxHeight,
  maxInlineSize?: null | maxInlineSize,
  maxWidth?: null | maxWidth,
  minBlockSize?: null | minBlockSize,
  minHeight?: null | minHeight,
  minInlineSize?: null | minInlineSize,
  minWidth?: null | minWidth,
  mixBlendMode?: null | mixBlendMode,
  motion?: null | motion,
  motionOffset?: null | motionOffset,
  motionPath?: null | motionPath,
  motionRotation?: null | motionRotation,
  MsOverflowStyle?: null | MsOverflowStyle,
  objectFit?: null | objectFit,
  objectPosition?: null | objectPosition,

  offset?: null | string,
  offsetAnchor?: null | string,
  offsetDistance?: null | string | number,
  offsetPath?: null | string,
  offsetPosition?: null | string,
  offsetRotate?: null | string,

  opacity?: null | opacity,
  order?: null | order,
  orphans?: null | orphans,
  outline?: null | outline,
  outlineColor?: null | outlineColor,
  outlineOffset?: null | outlineOffset,
  outlineStyle?: null | outlineStyle,
  outlineWidth?: null | outlineWidth,

  overflow?: null | overflow,
  overflowBlock?: null | overflowY,
  overflowBlockX?: null | overflowX,
  overflowX?: null | overflowX,
  overflowY?: null | overflowY,

  overflowAnchor?: null | overflowAnchor,
  // overflowClipBox?: null | overflowClipBox,
  overflowClipMargin?: null | string,

  overflowWrap?: null | overflowWrap,

  overscrollBehavior?: null | overscrollBehavior,
  overscrollBehaviorBlock?: null | overscrollBehaviorY,
  overscrollBehaviorY?: null | overscrollBehaviorY,
  overscrollBehaviorInline?: null | overscrollBehaviorX,
  overscrollBehaviorX?: null | overscrollBehaviorX,

  padding?: null | padding,
  paddingBlock?: null | paddingBlockEnd,
  paddingBlockEnd?: null | paddingBlockEnd,
  paddingBlockStart?: null | paddingBlockStart,
  paddingInline?: null | paddingBlockEnd,
  paddingInlineEnd?: null | paddingBlockEnd,
  paddingInlineStart?: null | paddingBlockStart,
  paddingBottom?: null | paddingBottom,
  paddingEnd?: null | paddingBottom,
  paddingHorizontal?: null | paddingLeft,
  paddingLeft?: null | paddingLeft,
  paddingRight?: null | paddingRight,
  paddingStart?: null | paddingLeft,
  paddingTop?: null | paddingTop,
  paddingVertical?: null | paddingTop,

  page?: null | string,
  pageBreakAfter?: null | pageBreakAfter,
  pageBreakBefore?: null | pageBreakBefore,
  pageBreakInside?: null | pageBreakInside,
  paintOrder?:
    | null
    | 'normal'
    | 'stroke'
    | 'fill'
    | 'markers'
    | 'stroke fill'
    | 'stroke markers'
    | 'fill markers'
    | 'stroke fill markers',
  pause?: null | pause,
  pauseAfter?: null | pauseAfter,
  pauseBefore?: null | pauseBefore,
  perspective?: null | perspective,
  perspectiveOrigin?: null | perspectiveOrigin,
  pointerEvents?: null | pointerEvents,
  position?: null | position,
  quotes?: null | quotes,
  resize?: null | resize,
  rest?: null | rest,
  restAfter?: null | restAfter,
  restBefore?: null | restBefore,
  right?: null | number | string,
  rowGap?: null | rowGap,

  // Ruby properties.
  rubyAlign?: null | rubyAlign,
  rubyMerge?: null | rubyMerge,
  rubyPosition?: null | rubyPosition,
  // Math properties
  mathDepth?: null | number | string,
  mathShift?: null | 'normal' | 'compact',
  mathStyle?: null | 'normal' | 'compact',

  scrollbarWidth?: null | string | number,
  scrollBehavior?: null | scrollBehavior,

  scrollMargin?: null | number | string,
  scrollMarginTop?: null | number | string,
  scrollMarginRight?: null | number | string,
  scrollMarginBottom?: null | number | string,
  scrollMarginLeft?: null | number | string,
  scrollMarginBlock?: null | number | string,
  scrollMarginBlockEnd?: null | number | string,
  scrollMarginBlockStart?: null | number | string,
  scrollMarginInline?: null | number | string,
  scrollMarginInlineEnd?: null | number | string,
  scrollMarginInlineStart?: null | number | string,

  scrollPadding?: null | number | string,
  scrollPaddingTop?: null | number | string,
  scrollPaddingRight?: null | number | string,
  scrollPaddingBottom?: null | number | string,
  scrollPaddingLeft?: null | number | string,
  scrollPaddingBlock?: null | number | string,
  scrollPaddingBlockEnd?: null | number | string,
  scrollPaddingBlockStart?: null | number | string,
  scrollPaddingInline?: null | number | string,
  scrollPaddingInlineEnd?: null | number | string,
  scrollPaddingInlineStart?: null | number | string,

  scrollSnapAlign?: null | scrollSnapAlign,
  scrollSnapStop?: null | 'normal' | 'always',
  scrollSnapType?: null | scrollSnapType,

  scrollTimeline?: null | string,
  scrollTimelineAxis?: null | 'block' | 'inline' | 'x' | 'y',
  scrollTimelineName?: null | string,

  scrollbarColor?: null | color,
  scrollbarWidth?: null | width,

  shapeImageThreshold?: null | shapeImageThreshold,
  shapeMargin?: null | shapeMargin,
  shapeOutside?: null | shapeOutside,
  shapeRendering?: null | shapeRendering,
  speak?: null | speak,
  speakAs?: null | speakAs,
  src?: null | src,
  start?: null | number | string,
  stroke?: null | stroke,
  strokeDasharray?: null | strokeDasharray,
  strokeDashoffset?: null | strokeDashoffset,
  strokeLinecap?: null | strokeLinecap,
  strokeLinejoin?: null | strokeLinejoin,
  strokeMiterlimit?: null | strokeMiterlimit,
  strokeOpacity?: null | strokeOpacity,
  strokeWidth?: null | strokeWidth,
  tabSize?: null | tabSize,
  tableLayout?: null | tableLayout,
  textAlign?: null | textAlign,
  textAlignLast?: null | textAlignLast,
  textAnchor?: null | textAnchor,
  textCombineUpright?: null | textCombineUpright,

  textDecoration?: null | textDecoration,
  textDecorationColor?: null | textDecorationColor,
  textDecorationLine?: null | textDecorationLine,
  textDecorationSkip?: null | textDecorationSkip,
  textDecorationSkipInk?: null | 'auto' | 'none' | 'all',
  textDecorationStyle?: null | textDecorationStyle,
  textDecorationThickness?: null | number | string,

  textEmphasis?: null | textEmphasis,
  textEmphasisColor?: null | textEmphasisColor,
  textEmphasisPosition?: null | textEmphasisPosition,
  textEmphasisStyle?: null | textEmphasisStyle,
  textIndent?: null | textIndent,
  textJustify?:
    | null
    | 'none'
    | 'auto'
    | 'inter-word'
    | 'inter-character'
    | 'distribute',
  textOrientation?: null | textOrientation,
  textOverflow?: null | textOverflow,
  textRendering?: null | textRendering,
  textShadow?: null | OptionalArray<textShadow>,
  textSizeAdjust?: null | textSizeAdjust,
  textTransform?: null | textTransform,
  textUnderlineOffset?: null | number | string,
  textUnderlinePosition?: null | textUnderlinePosition,
  textWrap?: null | 'wrap' | 'nowrap' | 'balance',

  timelineScope?: null | string,
  top?: null | top,
  touchAction?: null | touchAction,

  transform?: null | transform,
  transformBox?: null | transformBox,
  transformOrigin?: null | transformOrigin,
  transformStyle?: null | transformStyle,
  rotate?: null | number | string,
  scale?: null | number | string,
  translate?: null | number | string,

  transition?: null | OptionalArray<transition>,
  transitionDelay?: null | OptionalArray<transitionDelay>,
  transitionDuration?: null | OptionalArray<transitionDuration>,
  transitionProperty?: null | OptionalArray<transitionProperty>,
  transitionTimingFunction?: null | OptionalArray<transitionTimingFunction>,
  unicodeBidi?: null | unicodeBidi,
  unicodeRange?: null | unicodeRange,
  userSelect?: null | userSelect,
  verticalAlign?: null | verticalAlign,

  viewTimeline?: null | string,
  viewTimelineAxis?: null | 'block' | 'inline' | 'x' | 'y',
  viewTimelineName?: null | string,
  viewTimelineInset?: null | number | string,

  viewTransitionName?: null | string,

  visibility?: null | visibility,
  voiceBalance?: null | voiceBalance,
  voiceDuration?: null | voiceDuration,
  voiceFamily?: null | voiceFamily,
  voicePitch?: null | voicePitch,
  voiceRange?: null | voiceRange,
  voiceRate?: null | voiceRate,
  voiceStress?: null | voiceStress,
  voiceVolume?: null | voiceVolume,
  whiteSpace?: null | whiteSpace,
  // whiteSpaceCollapse?: null | string,

  widows?: null | widows,
  width?: null | width,
  willChange?: null | willChange,
  wordBreak?: null | wordBreak,
  wordSpacing?: null | wordSpacing,
  wordWrap?: null | wordWrap,
  writingMode?: null | writingMode,
  zIndex?: null | zIndex,
}>;
