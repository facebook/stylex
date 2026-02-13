/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const t = require('@babel/types');

const ATOMS_SOURCE = '@stylexjs/atoms';

/**
 * Set of valid CSS property names in camelCase form.
 * Mirrors the keys of the CSSProperties type in @stylexjs/stylex.
 * If a new CSS property is added to CSSProperties, it should be added here too.
 */
// prettier-ignore
const VALID_CSS_PROPERTIES = new Set([
  'theme',
  'MozOsxFontSmoothing', 'WebkitAppearance', 'WebkitFontSmoothing',
  'WebkitTapHighlightColor', 'WebkitMaskImage', 'WebkitTextFillColor',
  'WebkitTextStrokeWidth', 'WebkitTextStrokeColor', 'WebkitBackgroundClip',
  'WebkitBoxOrient', 'WebkitLineClamp',
  'accentColor', 'aspectRatio', 'placeContent', 'alignContent',
  'justifyContent', 'placeItems', 'placeSelf', 'alignItems', 'justifyItems',
  'alignSelf', 'justifySelf', 'alignmentBaseline', 'alignTracks',
  'justifyTracks', 'masonryAutoFlow', 'anchorName', 'animation',
  'animationComposition', 'animationDelay', 'animationDirection',
  'animationDuration', 'animationFillMode', 'animationIterationCount',
  'animationName', 'animationPlayState', 'animationTimingFunction',
  'animationTimeline', 'animationRange', 'animationRangeStart',
  'animationRangeEnd', 'appearance', 'azimuth', 'backdropFilter',
  'backfaceVisibility', 'background', 'backgroundAttachment',
  'backgroundBlendMode', 'backgroundClip', 'backgroundColor',
  'backgroundImage', 'backgroundOrigin', 'backgroundPosition',
  'backgroundPositionX', 'backgroundPositionY', 'backgroundRepeat',
  'backgroundSize', 'baselineShift', 'behavior', 'blockSize', 'border',
  'borderBlock', 'borderBlockColor', 'borderBlockStyle', 'borderBlockWidth',
  'borderBlockEnd', 'borderBlockEndColor', 'borderBlockEndStyle',
  'borderBlockEndWidth', 'borderBlockStart', 'borderBlockStartColor',
  'borderBlockStartStyle', 'borderBlockStartWidth', 'borderBottom',
  'borderBottomColor', 'borderBottomStyle', 'borderBottomWidth',
  'borderCollapse', 'borderColor', 'borderImage', 'borderImageOutset',
  'borderImageRepeat', 'borderImageSlice', 'borderImageSource',
  'borderImageWidth', 'borderInline', 'borderInlineColor',
  'borderInlineStyle', 'borderInlineWidth', 'borderInlineEnd',
  'borderInlineEndColor', 'borderInlineEndStyle', 'borderInlineEndWidth',
  'borderInlineStart', 'borderInlineStartColor', 'borderInlineStartStyle',
  'borderInlineStartWidth', 'borderLeft', 'borderLeftColor',
  'borderLeftStyle', 'borderLeftWidth', 'borderRadius', 'borderEndStartRadius',
  'borderStartStartRadius', 'borderStartEndRadius', 'borderEndEndRadius',
  'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius',
  'borderBottomRightRadius', 'cornerShape', 'cornerStartStartShape',
  'cornerStartEndShape', 'cornerEndStartShape', 'cornerEndEndShape',
  'cornerTopLeftShape', 'cornerTopRightShape', 'cornerBottomLeftShape',
  'cornerBottomRightShape', 'borderRight', 'borderRightColor',
  'borderRightStyle', 'borderRightWidth', 'borderSpacing', 'borderStyle',
  'borderTop', 'borderTopColor', 'borderTopStyle', 'borderTopWidth',
  'borderWidth', 'bottom', 'boxAlign', 'boxDecorationBreak', 'boxDirection',
  'boxFlex', 'boxFlexGroup', 'boxLines', 'boxOrdinalGroup', 'boxOrient',
  'boxShadow', 'boxSizing', 'boxSuppress', 'breakAfter', 'breakBefore',
  'breakInside', 'captionSide', 'caret', 'caretColor', 'caretShape', 'clear',
  'clip', 'clipPath', 'clipRule', 'color', 'colorScheme', 'forcedColorAdjust',
  'printColorAdjust', 'columns', 'columnCount', 'columnWidth', 'columnRule',
  'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth', 'columnFill',
  'columnGap', 'columnSpan', 'contain', 'containIntrinsicSize',
  'containIntrinsicBlockSize', 'containIntrinsicInlineSize',
  'containIntrinsicHeight', 'containIntrinsicWidth', 'container',
  'containerName', 'containerType', 'contentVisibility', 'content',
  'counterIncrement', 'counterReset', 'counterSet', 'cue', 'cueAfter',
  'cueBefore', 'cursor', 'direction', 'display', 'displayInside',
  'displayList', 'displayOutside', 'dominantBaseline', 'emptyCells', 'end',
  'fill', 'fillOpacity', 'fillRule', 'filter', 'flex', 'flexBasis',
  'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap', 'float',
  'font', 'fontFamily', 'fontFeatureSettings', 'fontKerning',
  'fontLanguageOverride', 'fontSize', 'fontSizeAdjust', 'fontStretch',
  'fontStyle', 'fontSynthesis', 'fontSynthesisWeight', 'fontSynthesisStyle',
  'fontSynthesisSmallCaps', 'fontSynthesisPosition', 'fontVariant',
  'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian',
  'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition',
  'fontWeight', 'fontOpticalSizing', 'fontPalette', 'fontVariationSettings',
  'gap', 'glyphOrientationHorizontal', 'glyphOrientationVertical', 'grid',
  'gridArea', 'gridAutoColumns', 'gridAutoFlow', 'gridAutoRows', 'gridColumn',
  'gridColumnEnd', 'gridColumnGap', 'gridColumnStart', 'gridGap', 'gridRow',
  'gridRowEnd', 'gridRowGap', 'gridRowStart', 'gridTemplate',
  'gridTemplateAreas', 'gridTemplateColumns', 'gridTemplateRows',
  'hangingPunctuation', 'hyphenateCharacter', 'hyphenateLimitChars', 'hyphens',
  'height', 'imageOrientation', 'imageRendering', 'imageResolution', 'imeMode',
  'initialLetter', 'initialLetterAlign', 'inlineSize', 'interpolateSize',
  'inset', 'insetBlock', 'insetBlockEnd', 'insetBlockStart', 'insetInline',
  'insetInlineEnd', 'insetInlineStart', 'isolation', 'kerning', 'left',
  'letterSpacing', 'lineBreak', 'lineHeight', 'lineHeightStep', 'listStyle',
  'listStyleImage', 'listStylePosition', 'listStyleType', 'margin',
  'marginBlock', 'marginBlockEnd', 'marginBlockStart', 'marginBottom',
  'marginInline', 'marginInlineEnd', 'marginInlineStart', 'marginLeft',
  'marginRight', 'marginTop', 'marginTrim', 'marker', 'markerEnd',
  'markerMid', 'markerOffset', 'markerStart', 'mask', 'maskClip',
  'maskComposite', 'maskImage', 'maskMode', 'maskOrigin', 'maskPosition',
  'maskRepeat', 'maskSize', 'maskType', 'maskBorder', 'maskBorderMode',
  'maskBorderOutset', 'maskBorderRepeat', 'maskBorderSlice',
  'maskBorderSource', 'maskBorderWidth', 'maxBlockSize', 'maxHeight',
  'maxInlineSize', 'maxWidth', 'minBlockSize', 'minHeight', 'minInlineSize',
  'minWidth', 'mixBlendMode', 'motion', 'motionOffset', 'motionPath',
  'motionRotation', 'MsOverflowStyle', 'objectFit', 'objectPosition',
  'offset', 'offsetAnchor', 'offsetDistance', 'offsetPath', 'offsetPosition',
  'offsetRotate', 'opacity', 'order', 'orphans', 'outline', 'outlineColor',
  'outlineOffset', 'outlineStyle', 'outlineWidth', 'overflow', 'overflowBlock',
  'overflowBlockX', 'overflowX', 'overflowY', 'overflowAnchor',
  'overflowClipMargin', 'overflowWrap', 'overscrollBehavior',
  'overscrollBehaviorBlock', 'overscrollBehaviorY', 'overscrollBehaviorInline',
  'overscrollBehaviorX', 'padding', 'paddingBlock', 'paddingBlockEnd',
  'paddingBlockStart', 'paddingInline', 'paddingInlineEnd',
  'paddingInlineStart', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'paddingTop', 'page', 'pageBreakAfter', 'pageBreakBefore',
  'pageBreakInside', 'paintOrder', 'pause', 'pauseAfter', 'pauseBefore',
  'perspective', 'perspectiveOrigin', 'pointerEvents', 'position',
  'positionAnchor', 'positionArea', 'positionTry', 'positionTryFallbacks',
  'positionTryOptions', 'positionVisibility', 'quotes', 'resize', 'rest',
  'restAfter', 'restBefore', 'right', 'rowGap', 'rubyAlign', 'rubyMerge',
  'rubyPosition', 'mathDepth', 'mathShift', 'mathStyle', 'scrollBehavior',
  'scrollMargin', 'scrollMarginTop', 'scrollMarginRight',
  'scrollMarginBottom', 'scrollMarginLeft', 'scrollMarginBlock',
  'scrollMarginBlockEnd', 'scrollMarginBlockStart', 'scrollMarginInline',
  'scrollMarginInlineEnd', 'scrollMarginInlineStart', 'scrollPadding',
  'scrollPaddingTop', 'scrollPaddingRight', 'scrollPaddingBottom',
  'scrollPaddingLeft', 'scrollPaddingBlock', 'scrollPaddingBlockEnd',
  'scrollPaddingBlockStart', 'scrollPaddingInline', 'scrollPaddingInlineEnd',
  'scrollPaddingInlineStart', 'scrollSnapAlign', 'scrollSnapStop',
  'scrollSnapType', 'scrollTimeline', 'scrollTimelineAxis',
  'scrollTimelineName', 'scrollbarColor', 'scrollbarGutter', 'scrollbarWidth',
  'shapeImageThreshold', 'shapeMargin', 'shapeOutside', 'shapeRendering',
  'speak', 'speakAs', 'src', 'start', 'stroke', 'strokeDasharray',
  'strokeDashoffset', 'strokeLinecap', 'strokeLinejoin', 'strokeMiterlimit',
  'strokeOpacity', 'strokeWidth', 'tabSize', 'tableLayout', 'textAlign',
  'textAlignLast', 'textAnchor', 'textCombineUpright', 'textDecoration',
  'textDecorationColor', 'textDecorationLine', 'textDecorationSkip',
  'textDecorationSkipInk', 'textDecorationStyle', 'textDecorationThickness',
  'textEmphasis', 'textEmphasisColor', 'textEmphasisPosition',
  'textEmphasisStyle', 'textFillColor', 'textIndent', 'textJustify',
  'textOrientation', 'textOverflow', 'textRendering', 'textShadow',
  'textSizeAdjust', 'textTransform', 'textUnderlineOffset',
  'textUnderlinePosition', 'textWrap', 'timelineScope', 'top', 'touchAction',
  'transform', 'transformBox', 'transformOrigin', 'transformStyle', 'rotate',
  'scale', 'translate', 'transition', 'transitionDelay', 'transitionDuration',
  'transitionProperty', 'transitionTimingFunction', 'unicodeBidi',
  'unicodeRange', 'userSelect', 'verticalAlign', 'viewTimeline',
  'viewTimelineAxis', 'viewTimelineName', 'viewTimelineInset',
  'viewTransitionName', 'visibility', 'voiceBalance', 'voiceDuration',
  'voiceFamily', 'voicePitch', 'voiceRange', 'voiceRate', 'voiceStress',
  'voiceVolume', 'whiteSpace', 'widows', 'width', 'willChange', 'wordBreak',
  'wordSpacing', 'wordWrap', 'writingMode', 'zIndex', 'zoom',
]);

/**
 * Validates a CSS property name against the known set of valid properties.
 * Respects the propertyValidationMode option from the babel-plugin config.
 *
 * @param {string} property - The camelCase CSS property name to validate
 * @param {object} state - StateManager from babel-plugin
 */
function validatePropertyName(property, state) {
  if (VALID_CSS_PROPERTIES.has(property)) {
    return;
  }

  const mode = state.options?.propertyValidationMode ?? 'silent';
  const message =
    `@stylexjs/atoms: Unknown CSS property '${property}'. ` +
    'This will produce invalid CSS output.';

  if (mode === 'throw') {
    throw new Error(message);
  } else if (mode === 'warn') {
    console.warn(`[stylex] ${message}`);
  }
  // 'silent' mode: do nothing
}

/**
 * Creates a visitor that transforms utility style expressions into raw style objects.
 * The babel-plugin will handle compilation via stylexCreate.
 *
 * - css.display.flex -> { display: 'flex' }
 * - css.color(myVar) -> { color: myVar }
 *
 * @param {object} state - StateManager from babel-plugin
 * @returns {object} Babel visitor
 */
function createUtilityStylesVisitor(state) {
  return {
    MemberExpression(path) {
      if (path.node._utilityStyleProcessed) {
        return;
      }

      const staticStyle = getStaticStyleFromPath(path, state);
      if (staticStyle != null) {
        path.node._utilityStyleProcessed = true;
        transformStaticStyle(path, staticStyle);
      }
    },

    CallExpression(path) {
      if (path.node._utilityStyleProcessed) {
        return;
      }

      const dynamicStyle = getDynamicStyleFromPath(path, state);
      if (dynamicStyle != null) {
        path.node._utilityStyleProcessed = true;
        transformDynamicStyle(path, dynamicStyle);
      }
    },
  };
}

function isUtilityStylesIdentifier(ident, state, path) {
  if (state.atomImports && state.atomImports.has(ident.name)) {
    return true;
  }

  const binding = path.scope?.getBinding(ident.name);
  if (!binding) {
    return false;
  }

  if (
    binding.path.isImportSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === ATOMS_SOURCE
  ) {
    return true;
  }

  if (
    binding.path.isImportNamespaceSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === ATOMS_SOURCE
  ) {
    return true;
  }

  if (
    binding.path.isImportDefaultSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === ATOMS_SOURCE
  ) {
    return true;
  }

  return false;
}

function getPropKey(prop, computed) {
  if (!computed && t.isIdentifier(prop)) {
    return prop.name;
  }
  if (computed && t.isStringLiteral(prop)) {
    return prop.value;
  }
  if (computed && t.isNumericLiteral(prop)) {
    return String(prop.value);
  }
  return null;
}

/**
 * Strips a leading underscore from CSS values. This allows using underscore-
 * prefixed identifiers for CSS values that conflict with JS reserved words
 * or start with a digit (e.g., css.display._flex or css.zIndex._1).
 */
function normalizeValue(value) {
  if (typeof value === 'string' && value.startsWith('_')) {
    return value.slice(1);
  }
  return value;
}

function getStaticStyleFromPath(path, state) {
  const node = path.node;
  if (!t.isMemberExpression(node)) {
    return null;
  }

  if (
    path.parentPath?.isCallExpression() &&
    path.parentPath.node.callee === node
  ) {
    return null;
  }

  const valueKey = getPropKey(node.property, node.computed);
  if (valueKey == null) {
    return null;
  }

  const parent = node.object;

  if (t.isMemberExpression(parent)) {
    const propName = getPropKey(parent.property, parent.computed);
    const base = parent.object;
    if (
      propName != null &&
      t.isIdentifier(base) &&
      isUtilityStylesIdentifier(base, state, path)
    ) {
      validatePropertyName(propName, state);
      return { property: propName, value: normalizeValue(valueKey) };
    }
  }

  if (
    t.isIdentifier(parent) &&
    isUtilityStylesIdentifier(parent, state, path)
  ) {
    const importedName = state.atomImports?.get(parent.name);
    if (importedName == null) {
      return null;
    }
    const property = importedName === '*' ? valueKey : importedName;
    validatePropertyName(property, state);
    return { property, value: normalizeValue(valueKey) };
  }

  return null;
}

function getDynamicStyleFromPath(path, state) {
  const callee = path.get('callee');
  if (!callee.isMemberExpression()) {
    return null;
  }

  const valueKey = getPropKey(callee.node.property, callee.node.computed);
  if (valueKey == null) {
    return null;
  }

  if (path.node.arguments.length !== 1) {
    return null;
  }

  const argPath = path.get('arguments')[0];
  if (!argPath || !argPath.node || !argPath.isExpression()) {
    return null;
  }

  const parent = callee.node.object;

  if (
    t.isIdentifier(parent) &&
    isUtilityStylesIdentifier(parent, state, path)
  ) {
    validatePropertyName(valueKey, state);
    return {
      property: valueKey,
      value: argPath.node,
    };
  }

  if (t.isMemberExpression(parent)) {
    const propName = getPropKey(parent.property, parent.computed);
    const base = parent.object;
    if (
      propName != null &&
      t.isIdentifier(base) &&
      isUtilityStylesIdentifier(base, state, path)
    ) {
      validatePropertyName(propName, state);
      return {
        property: propName,
        value: argPath.node,
      };
    }
  }

  return null;
}

/**
 * Transform static utility style to raw style object
 * css.display.flex -> { display: 'flex' }
 */
function transformStaticStyle(path, styleInfo) {
  const { property, value } = styleInfo;

  const styleObj = t.objectExpression([
    t.objectProperty(
      t.stringLiteral(property),
      typeof value === 'number'
        ? t.numericLiteral(value)
        : t.stringLiteral(String(value)),
    ),
  ]);

  path.replaceWith(styleObj);
}

/**
 * Transform dynamic utility style to raw style object
 * css.color(myVar) -> { color: myVar }
 */
function transformDynamicStyle(path, styleInfo) {
  const { property, value } = styleInfo;

  const styleObj = t.objectExpression([
    t.objectProperty(t.stringLiteral(property), value),
  ]);

  path.replaceWith(styleObj);
}

module.exports = {
  createUtilityStylesVisitor,
  isUtilityStylesIdentifier,
  getStaticStyleFromPath,
  getDynamicStyleFromPath,
};
