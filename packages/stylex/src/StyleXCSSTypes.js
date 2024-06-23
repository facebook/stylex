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
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'normal'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'safe center'
  | 'unsafe center'
  | all;
type alignItems =
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center'
  | all;
type alignSelf =
  | 'auto'
  | 'normal'
  | 'center'
  | 'start'
  | 'end'
  | 'self-start'
  | 'self-end'
  | 'flex-start'
  | 'flex-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'stretch'
  | 'safe center'
  | 'unsafe center'
  | all;
type all = null | 'initial' | 'inherit' | 'unset';
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
type borderSpacing = number | string;
type borderStyle = brStyle;
type borderTopLeftRadius = lengthPercentage;
type borderTopRightRadius = lengthPercentage;
type borderTopStyle = brStyle;
type borderTopWidth = borderWidth;
type boxAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
type boxDecorationBreak = 'slice' | 'clone';
type boxDirection = 'normal' | 'reverse' | 'inherit';
type boxFlex = number | string;
type boxFlexGroup = number | string;
type boxLines = 'single' | 'multiple';
type boxOrdinalGroup = number | string;
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
type columnCount = number | 'auto' | string;
type columnFill = 'auto' | 'balance';
type columnGap = number | string | 'normal';
type columnRule = columnRuleWidth | columnRuleStyle | columnRuleColor;
type columnRuleColor = color;
type columnRuleStyle = brStyle;
type columnRuleWidth = borderWidth;
type columnSpan = 'none' | 'all';
type columnWidth = number | 'auto' | string;
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
  | '-webkit-box'
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
type flexGrow = all | number | string;
type flexShrink = all | number | string;
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
  | 'ultra-expanded'
  | string;
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
  | 900
  | string
  | number;
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
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'left'
  | 'right'
  | 'normal'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'safe center'
  | 'unsafe center'
  | 'inherit';
type justifyItems =
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'left'
  | 'right'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center'
  | 'legacy right'
  | 'legacy left'
  | 'legacy center'
  | all;
// There's an optional overflowPosition (safe vs unsafe) prefix to
// [selfPosition | 'left' | 'right']. It's not used on www, so, it's not added
// here.
type justifySelf =
  | 'auto'
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'left'
  | 'right'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center';

type letterSpacing = 'normal' | lengthPercentage;
type lineBreak = 'auto' | 'loose' | 'normal' | 'strict';
type lineHeight = 'inherit' | number | string;
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
type markerOffset = number | 'auto' | string;
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
type opacity = number | string;
type order = number | string;
type orphans = number | string;
type outline = string;
type outlineColor = color | 'invert';
type outlineOffset = number | string;
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
type shapeImageThreshold = number | string;
type shapeMargin = lengthPercentage;
type shapeOutside = 'none' | shapeBox | string;
type tabSize = number | string;
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
type widows = number | string;
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
type fillOpacity = number | string;
type fillRule = 'nonzero' | 'evenodd';
type glyphOrientationHorizontal = number | string;
type glyphOrientationVertical = number | string;
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
type strokeMiterlimit = number | string;
type strokeOpacity = number | string;
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
  theme?: all | string,

  // ...$Exact<SupportedVendorSpecificCSSProperties>, for TypeScript compatibility
  MozOsxFontSmoothing?: all | 'grayscale',
  WebkitAppearance?: all | appearance,
  WebkitFontSmoothing?: all | 'antialiased',
  WebkitTapHighlightColor?: all | color,

  WebkitMaskImage?: all | maskImage,

  WebkitTextFillColor?: all | color,
  textFillColor?: all | color,
  WebkitTextStrokeWidth?: all | number | string,
  WebkitTextStrokeColor?: all | color,
  WebkitBackgroundClip?:
    | null
    | 'border-box'
    | 'padding-box'
    | 'content-box'
    | 'text',

  WebkitBoxOrient?:
    | null
    | 'vertical'
    | 'horizontal'
    | 'inline-axis'
    | 'block-axis',
  WebkitLineClamp?: all | number | string,
  // ENDOF ...$Exact<SupportedVendorSpecificCSSProperties>,

  accentColor?: all | color,

  aspectRatio?: all | number | string,

  placeContent?: all | string,
  alignContent?: all | alignContent,
  justifyContent?: all | justifyContent,
  placeItems?: all | string,
  placeSelf?: all | string,
  alignItems?: all | alignItems,
  justifyItems?: all | justifyItems,
  alignSelf?: all | alignSelf,
  justifySelf?: all | justifySelf,

  alignmentBaseline?: all | alignmentBaseline,
  alignTracks?: all | string,
  justifyTracks?: all | string,
  masonryAutoFlow?: all | string,

  // Not Allowed:
  // all?: all | all,
  animation?: all | string,
  animationComposition?: all | string,
  animationDelay?: all | OptionalArray<animationDelay>,
  animationDirection?: all | OptionalArray<animationDirection>,
  animationDuration?: all | OptionalArray<animationDuration>,
  animationFillMode?: all | OptionalArray<animationFillMode>,
  animationIterationCount?: all | OptionalArray<animationIterationCount>,
  animationName?: all | OptionalArray<animationName>,
  animationPlayState?: all | OptionalArray<animationPlayState>,
  animationTimingFunction?: all | OptionalArray<animationTimingFunction>,
  animationTimeline?: all | string,
  animationRange?: all | string,
  animationRangeStart?: all | string,
  animationRangeEnd?: all | string,
  appearance?: all | appearance,
  azimuth?: all | string,

  backdropFilter?: all | backdropFilter,
  backfaceVisibility?: all | backfaceVisibility,
  background?: all | string,
  backgroundAttachment?: all | OptionalArray<backgroundAttachment>,
  backgroundBlendMode?: all | OptionalArray<backgroundBlendMode>,
  backgroundClip?: all | OptionalArray<backgroundClip>,
  backgroundColor?: all | backgroundColor,
  backgroundImage?: all | OptionalArray<backgroundImage>,
  backgroundOrigin?: all | OptionalArray<backgroundOrigin>,
  backgroundPosition?: all | OptionalArray<backgroundPosition>,
  backgroundPositionX?: all | OptionalArray<backgroundPositionX>,
  backgroundPositionY?: all | OptionalArray<backgroundPositionY>,
  backgroundRepeat?: all | OptionalArray<backgroundRepeat>,
  backgroundSize?: all | OptionalArray<backgroundSize>,
  baselineShift?: all | baselineShift,
  behavior?: all | behavior,
  blockSize?: all | blockSize,
  border?: all | border,
  borderBlock?: all | borderBlockEnd,
  borderBlockColor?: all | borderBlockEndColor,
  borderBlockStyle?: all | borderBlockEndStyle,
  borderBlockWidth?: all | borderBlockEndWidth,
  borderBlockEnd?: all | borderBlockEnd,
  borderBlockEndColor?: all | borderBlockEndColor,
  borderBlockEndStyle?: all | borderBlockEndStyle,
  borderBlockEndWidth?: all | borderBlockEndWidth,
  borderBlockStart?: all | borderBlockStart,
  borderBlockStartColor?: all | borderBlockStartColor,
  borderBlockStartStyle?: all | borderBlockStartStyle,
  borderBlockStartWidth?: all | borderBlockStartWidth,
  borderBottom?: all | border,
  borderBottomColor?: all | color,
  borderBottomStyle?: all | borderBottomStyle,
  borderBottomWidth?: all | borderBottomWidth,
  borderCollapse?: all | borderCollapse,
  borderColor?: all | borderColor,
  borderImage?: all | borderImage,
  borderImageOutset?: all | borderImageOutset,
  borderImageRepeat?: all | borderImageRepeat,
  borderImageSlice?: all | borderImageSlice,
  borderImageSource?: all | borderImageSource,
  borderImageWidth?: all | borderImageWidth,
  borderInline?: all | borderInlineEnd,
  borderInlineColor?: all | borderInlineEndColor,
  borderInlineStyle?: all | borderInlineEndStyle,
  borderInlineWidth?: all | borderInlineEndWidth,
  borderInlineEnd?: all | borderInlineEnd,
  borderInlineEndColor?: all | borderInlineEndColor,
  borderInlineEndStyle?: all | borderInlineEndStyle,
  borderInlineEndWidth?: all | borderInlineEndWidth,
  borderInlineStart?: all | borderInlineStart,
  borderInlineStartColor?: all | borderInlineStartColor,
  borderInlineStartStyle?: all | borderInlineStartStyle,
  borderInlineStartWidth?: all | borderInlineStartWidth,
  borderLeft?: all | border,
  borderLeftColor?: all | borderLeftColor,
  borderLeftStyle?: all | borderLeftStyle,
  borderLeftWidth?: all | borderLeftWidth,
  borderRight?: all | border,
  borderRightColor?: all | borderRightColor,
  borderRightStyle?: all | borderRightStyle,
  borderRightWidth?: all | borderRightWidth,
  borderSpacing?: all | borderSpacing,
  borderStyle?: all | borderStyle,
  borderTop?: all | border,
  borderTopColor?: all | color,

  borderRadius?: all | borderRadius,
  borderEndStartRadius?: all | borderBottomLeftRadius,
  borderStartStartRadius?: all | borderTopLeftRadius,
  borderStartEndRadius?: all | borderTopRightRadius,
  borderEndEndRadius?: all | borderBottomRightRadius,
  borderTopLeftRadius?: all | borderTopLeftRadius,
  borderTopRightRadius?: all | borderTopRightRadius,
  borderBottomLeftRadius?: all | borderBottomLeftRadius,
  borderBottomRightRadius?: all | borderBottomRightRadius,

  borderTopStyle?: all | borderTopStyle,
  borderTopWidth?: all | borderTopWidth,
  borderWidth?: all | borderWidth,
  bottom?: all | number | string,
  boxAlign?: all | boxAlign,
  boxDecorationBreak?: all | boxDecorationBreak,
  boxDirection?: all | boxDirection,
  boxFlex?: all | boxFlex,
  boxFlexGroup?: all | boxFlexGroup,
  boxLines?: all | boxLines,
  boxOrdinalGroup?: all | boxOrdinalGroup,
  boxOrient?: all | boxOrient,
  boxShadow?: all | OptionalArray<boxShadow>,
  boxSizing?: all | boxSizing,
  boxSuppress?: all | boxSuppress,
  breakAfter?: all | breakAfter,
  breakBefore?: all | breakBefore,
  breakInside?: all | breakInside,

  captionSide?: all | captionSide,
  caret?: all | string,
  caretColor?: all | color,
  caretShape?: all | string,
  clear?: all | clear,
  clip?: all | clip,
  clipPath?: all | clipPath,
  clipRule?: all | clipRule,
  color?: all | color,

  colorScheme?:
    | null
    | 'normal'
    | 'light'
    | 'dark'
    | 'light dark'
    | 'only light'
    | 'only dark',
  forcedColorAdjust?: all | 'auto' | 'none',
  printColorAdjust?: all | 'economy' | 'exact',

  columns?: all | columns,
  columnCount?: all | columnCount,
  columnWidth?: all | columnWidth,

  columnRule?: all | columnRule,
  columnRuleColor?: all | columnRuleColor,
  columnRuleStyle?: all | columnRuleStyle,
  columnRuleWidth?: all | columnRuleWidth,

  columnFill?: all | columnFill,
  columnGap?: all | columnGap,
  columnSpan?: all | columnSpan,

  contain?: all | contain,
  containIntrinsicSize?: all | number | string,
  containIntrinsicBlockSize?: all | number | string,
  containIntrinsicInlineSize?: all | number | string,
  containIntrinsicHeightSize?: all | number | string,
  containIntrinsicWidthSize?: all | number | string,

  container?: all | string,
  containerName?: all | string,
  containerType?: all | 'size' | 'inline-size' | 'normal',

  contentVisibility?: all | 'visible' | 'hidden' | 'auto',

  content?: all | content,

  counterIncrement?: all | counterIncrement,
  counterReset?: all | counterReset,
  counterSet?: all | string | number,

  cue?: all | cue,
  cueAfter?: all | cueAfter,
  cueBefore?: all | cueBefore,
  cursor?: all | OptionalArray<cursor>,
  direction?: all | direction,
  display?: all | display,
  displayInside?: all | displayInside,
  displayList?: all | displayList,
  displayOutside?: all | displayOutside,
  dominantBaseline?: all | dominantBaseline,
  emptyCells?: all | emptyCells,
  end?: all | number | string,
  fill?: all | fill,
  fillOpacity?: all | fillOpacity,
  fillRule?: all | fillRule,
  filter?: all | filter,
  flex?: all | flex,
  flexBasis?: all | flexBasis,
  flexDirection?: all | flexDirection,
  flexFlow?: all | flexFlow,
  flexGrow?: all | flexGrow,
  flexShrink?: all | flexShrink,
  flexWrap?: all | flexWrap,
  float?: all | float,

  font?: all | string,
  fontFamily?: all | fontFamily,
  fontFeatureSettings?: all | fontFeatureSettings,
  fontKerning?: all | fontKerning,
  fontLanguageOverride?: all | fontLanguageOverride,
  fontSize?: all | fontSize,
  fontSizeAdjust?: all | fontSizeAdjust,
  fontStretch?: all | fontStretch,
  fontStyle?: all | fontStyle,
  fontSynthesis?: all | fontSynthesis,
  fontSynthesisWeight?: all | 'auto' | 'none',
  fontSynthesisStyle?: all | 'auto' | 'none',
  fontSynthesisSmallCaps?: all | 'auto' | 'none',
  fontSynthesisPosition?: all | 'auto' | 'none',

  fontVariant?: all | fontVariant,
  fontVariantAlternates?: all | fontVariantAlternates,
  fontVariantCaps?: all | fontVariantCaps,
  fontVariantEastAsian?: all | fontVariantEastAsian,
  fontVariantLigatures?: all | fontVariantLigatures,
  fontVariantNumeric?: all | fontVariantNumeric,
  fontVariantPosition?: all | fontVariantPosition,
  fontWeight?: all | fontWeight,
  // fontHeight?: all | number | string,
  // fontWidth?: all | number | string,
  fontOpticalSizing?: all | 'auto' | 'none',
  fontPalette?: all | 'light' | 'dark' | string,
  fontVariationSettings?: all | string,

  gap?: all | gap,
  glyphOrientationHorizontal?: all | glyphOrientationHorizontal,
  glyphOrientationVertical?: all | glyphOrientationVertical,
  grid?: all | grid,
  gridArea?: all | gridArea,
  gridAutoColumns?: all | gridAutoColumns,
  gridAutoFlow?: all | gridAutoFlow,
  gridAutoRows?: all | gridAutoRows,
  gridColumn?: all | gridColumn,
  gridColumnEnd?: all | gridColumnEnd,
  gridColumnGap?: all | gridColumnGap,
  gridColumnStart?: all | gridColumnStart,
  gridGap?: all | gridGap,
  gridRow?: all | gridRow,
  gridRowEnd?: all | gridRowEnd,
  gridRowGap?: all | gridRowGap,
  gridRowStart?: all | gridRowStart,
  gridTemplate?: all | gridTemplate,
  gridTemplateAreas?: all | gridTemplateAreas,
  gridTemplateColumns?: all | gridTemplateColumns,
  gridTemplateRows?: all | gridTemplateRows,

  hangingPunctuation?: all | string,
  hyphenateCharacter?: all | string,
  hyphenateLimitChars?: all | string | number,
  hyphens?: all | hyphens,

  height?: all | number | string,

  imageOrientation?: all | imageOrientation,
  imageRendering?: all | imageRendering,
  imageResolution?: all | imageResolution,
  imeMode?: all | imeMode,
  // inputSecurity?: all | string,
  initialLetter?: all | initialLetter,
  initialLetterAlign?: all | initialLetterAlign,
  inlineSize?: all | inlineSize,

  inset?: all | number | string,
  insetBlock?: all | number | string,
  insetBlockEnd?: all | number | string,
  insetBlockStart?: all | number | string,
  insetInline?: all | number | string,
  insetInlineEnd?: all | number | string,
  insetInlineStart?: all | number | string,

  isolation?: all | isolation,
  kerning?: all | kerning,
  left?: all | number | string,
  letterSpacing?: all | letterSpacing,
  lineBreak?: all | lineBreak,
  lineHeight?: all | lineHeight,
  lineHeightStep?: all | number | string,
  listStyle?: all | listStyle,
  listStyleImage?: all | listStyleImage,
  listStylePosition?: all | listStylePosition,
  listStyleType?: all | listStyleType,
  margin?: all | margin,
  marginBlock?: all | marginBlockEnd,
  marginBlockEnd?: all | marginBlockEnd,
  marginBlockStart?: all | marginBlockStart,
  marginBottom?: all | marginBottom,
  marginInline?: all | marginInlineEnd,
  marginInlineEnd?: all | marginInlineEnd,
  marginInlineStart?: all | marginInlineStart,
  marginLeft?: all | marginLeft,
  marginRight?: all | marginRight,
  marginTop?: all | marginTop,

  marginTrim?:
    | null
    | 'none'
    | 'block'
    | 'block-start'
    | 'block-end'
    | 'inline'
    | 'inline-start'
    | 'inline-end',

  marker?: all | marker,
  markerEnd?: all | markerEnd,
  markerMid?: all | markerMid,
  markerOffset?: all | markerOffset,
  markerStart?: all | markerStart,
  mask?: all | mask,
  maskClip?: all | maskClip,
  maskComposite?: all | maskComposite,
  maskImage?: all | maskImage,
  maskMode?: all | maskMode,
  maskOrigin?: all | maskOrigin,
  maskPosition?: all | maskPosition,
  maskRepeat?: all | maskRepeat,
  maskSize?: all | maskSize,
  maskType?: all | maskType,

  maskBorder?: all | string,
  maskBorderMode?: all | 'alpha' | 'luminance',
  maskBorderOutset?: all | string | number,
  maskBorderRepeat?: all | 'stretch' | 'repeat' | 'round' | 'space',
  maskBorderSlice?: all | string | number,
  maskBorderSource?: all | string,
  maskBorderWidth?: all | string | number,

  maxBlockSize?: all | maxBlockSize,
  maxHeight?: all | maxHeight,
  maxInlineSize?: all | maxInlineSize,
  maxWidth?: all | maxWidth,
  minBlockSize?: all | minBlockSize,
  minHeight?: all | minHeight,
  minInlineSize?: all | minInlineSize,
  minWidth?: all | minWidth,
  mixBlendMode?: all | mixBlendMode,
  motion?: all | motion,
  motionOffset?: all | motionOffset,
  motionPath?: all | motionPath,
  motionRotation?: all | motionRotation,
  MsOverflowStyle?: all | MsOverflowStyle,
  objectFit?: all | objectFit,
  objectPosition?: all | objectPosition,

  offset?: all | string,
  offsetAnchor?: all | string,
  offsetDistance?: all | string | number,
  offsetPath?: all | string,
  offsetPosition?: all | string,
  offsetRotate?: all | string,

  opacity?: all | opacity,
  order?: all | order,
  orphans?: all | orphans,
  outline?: all | outline,
  outlineColor?: all | outlineColor,
  outlineOffset?: all | outlineOffset,
  outlineStyle?: all | outlineStyle,
  outlineWidth?: all | outlineWidth,

  overflow?: all | overflow,
  overflowBlock?: all | overflowY,
  overflowBlockX?: all | overflowX,
  overflowX?: all | overflowX,
  overflowY?: all | overflowY,

  overflowAnchor?: all | overflowAnchor,
  // overflowClipBox?: all | overflowClipBox,
  overflowClipMargin?: all | string,

  overflowWrap?: all | overflowWrap,

  overscrollBehavior?: all | overscrollBehavior,
  overscrollBehaviorBlock?: all | overscrollBehaviorY,
  overscrollBehaviorY?: all | overscrollBehaviorY,
  overscrollBehaviorInline?: all | overscrollBehaviorX,
  overscrollBehaviorX?: all | overscrollBehaviorX,

  padding?: all | padding,
  paddingBlock?: all | paddingBlockEnd,
  paddingBlockEnd?: all | paddingBlockEnd,
  paddingBlockStart?: all | paddingBlockStart,
  paddingInline?: all | paddingBlockEnd,
  paddingInlineEnd?: all | paddingBlockEnd,
  paddingInlineStart?: all | paddingBlockStart,
  paddingBottom?: all | paddingBottom,
  paddingLeft?: all | paddingLeft,
  paddingRight?: all | paddingRight,
  paddingTop?: all | paddingTop,

  page?: all | string,
  pageBreakAfter?: all | pageBreakAfter,
  pageBreakBefore?: all | pageBreakBefore,
  pageBreakInside?: all | pageBreakInside,
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
  pause?: all | pause,
  pauseAfter?: all | pauseAfter,
  pauseBefore?: all | pauseBefore,
  perspective?: all | perspective,
  perspectiveOrigin?: all | perspectiveOrigin,
  pointerEvents?: all | pointerEvents,
  position?: all | position,
  quotes?: all | quotes,
  resize?: all | resize,
  rest?: all | rest,
  restAfter?: all | restAfter,
  restBefore?: all | restBefore,
  right?: all | number | string,
  rowGap?: all | rowGap,

  // Ruby properties.
  rubyAlign?: all | rubyAlign,
  rubyMerge?: all | rubyMerge,
  rubyPosition?: all | rubyPosition,
  // Math properties
  mathDepth?: all | number | string,
  mathShift?: all | 'normal' | 'compact',
  mathStyle?: all | 'normal' | 'compact',

  scrollBehavior?: all | scrollBehavior,

  scrollMargin?: all | number | string,
  scrollMarginTop?: all | number | string,
  scrollMarginRight?: all | number | string,
  scrollMarginBottom?: all | number | string,
  scrollMarginLeft?: all | number | string,
  scrollMarginBlock?: all | number | string,
  scrollMarginBlockEnd?: all | number | string,
  scrollMarginBlockStart?: all | number | string,
  scrollMarginInline?: all | number | string,
  scrollMarginInlineEnd?: all | number | string,
  scrollMarginInlineStart?: all | number | string,

  scrollPadding?: all | number | string,
  scrollPaddingTop?: all | number | string,
  scrollPaddingRight?: all | number | string,
  scrollPaddingBottom?: all | number | string,
  scrollPaddingLeft?: all | number | string,
  scrollPaddingBlock?: all | number | string,
  scrollPaddingBlockEnd?: all | number | string,
  scrollPaddingBlockStart?: all | number | string,
  scrollPaddingInline?: all | number | string,
  scrollPaddingInlineEnd?: all | number | string,
  scrollPaddingInlineStart?: all | number | string,

  scrollSnapAlign?: all | scrollSnapAlign,
  scrollSnapStop?: all | 'normal' | 'always',
  scrollSnapType?: all | scrollSnapType,

  scrollTimeline?: all | string,
  scrollTimelineAxis?: all | 'block' | 'inline' | 'x' | 'y',
  scrollTimelineName?: all | string,

  scrollbarColor?: all | color,
  scrollbarGutter?: all | 'auto' | 'stable' | 'stable both-edges',
  scrollbarWidth?: all | 'auto' | 'thin' | 'none',

  shapeImageThreshold?: all | shapeImageThreshold,
  shapeMargin?: all | shapeMargin,
  shapeOutside?: all | shapeOutside,
  shapeRendering?: all | shapeRendering,
  speak?: all | speak,
  speakAs?: all | speakAs,
  src?: all | src,
  start?: all | number | string,
  stroke?: all | stroke,
  strokeDasharray?: all | strokeDasharray,
  strokeDashoffset?: all | strokeDashoffset,
  strokeLinecap?: all | strokeLinecap,
  strokeLinejoin?: all | strokeLinejoin,
  strokeMiterlimit?: all | strokeMiterlimit,
  strokeOpacity?: all | strokeOpacity,
  strokeWidth?: all | strokeWidth,
  tabSize?: all | tabSize,
  tableLayout?: all | tableLayout,
  textAlign?: all | textAlign,
  textAlignLast?: all | textAlignLast,
  textAnchor?: all | textAnchor,
  textCombineUpright?: all | textCombineUpright,

  textDecoration?: all | textDecoration,
  textDecorationColor?: all | textDecorationColor,
  textDecorationLine?: all | textDecorationLine,
  textDecorationSkip?: all | textDecorationSkip,
  textDecorationSkipInk?: all | 'auto' | 'none' | 'all',
  textDecorationStyle?: all | textDecorationStyle,
  textDecorationThickness?: all | number | string,

  textEmphasis?: all | textEmphasis,
  textEmphasisColor?: all | textEmphasisColor,
  textEmphasisPosition?: all | textEmphasisPosition,
  textEmphasisStyle?: all | textEmphasisStyle,
  textIndent?: all | textIndent,
  textJustify?:
    | null
    | 'none'
    | 'auto'
    | 'inter-word'
    | 'inter-character'
    | 'distribute',
  textOrientation?: all | textOrientation,
  textOverflow?: all | textOverflow,
  textRendering?: all | textRendering,
  textShadow?: all | OptionalArray<textShadow>,
  textSizeAdjust?: all | textSizeAdjust,
  textTransform?: all | textTransform,
  textUnderlineOffset?: all | number | string,
  textUnderlinePosition?: all | textUnderlinePosition,
  textWrap?: all | 'wrap' | 'nowrap' | 'balance',

  timelineScope?: all | string,
  top?: all | top,
  touchAction?: all | touchAction,

  transform?: all | transform,
  transformBox?: all | transformBox,
  transformOrigin?: all | transformOrigin,
  transformStyle?: all | transformStyle,
  rotate?: all | number | string,
  scale?: all | number | string,
  translate?: all | number | string,

  transition?: all | OptionalArray<transition>,
  transitionDelay?: all | OptionalArray<transitionDelay>,
  transitionDuration?: all | OptionalArray<transitionDuration>,
  transitionProperty?: all | OptionalArray<transitionProperty>,
  transitionTimingFunction?: all | OptionalArray<transitionTimingFunction>,
  unicodeBidi?: all | unicodeBidi,
  unicodeRange?: all | unicodeRange,
  userSelect?: all | userSelect,
  verticalAlign?: all | verticalAlign,

  viewTimeline?: all | string,
  viewTimelineAxis?: all | 'block' | 'inline' | 'x' | 'y',
  viewTimelineName?: all | string,
  viewTimelineInset?: all | number | string,

  viewTransitionName?: all | string,

  visibility?: all | visibility,
  voiceBalance?: all | voiceBalance,
  voiceDuration?: all | voiceDuration,
  voiceFamily?: all | voiceFamily,
  voicePitch?: all | voicePitch,
  voiceRange?: all | voiceRange,
  voiceRate?: all | voiceRate,
  voiceStress?: all | voiceStress,
  voiceVolume?: all | voiceVolume,
  whiteSpace?: all | whiteSpace,
  // whiteSpaceCollapse?: all | string,

  widows?: all | widows,
  width?: all | width,
  willChange?: all | willChange,
  wordBreak?: all | wordBreak,
  wordSpacing?: all | wordSpacing,
  wordWrap?: all | wordWrap,
  writingMode?: all | writingMode,
  zIndex?: all | zIndex,

  zoom?: all | 'normal' | number | string,
}>;
