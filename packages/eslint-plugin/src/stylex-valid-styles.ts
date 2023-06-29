/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import namedColors from './reference/namedColors';
import getDistance from './utils/getDistance';
import type * as ESTree from 'estree';
import type { Rule } from 'eslint';
import isCSSVariable from './rules/isCSSVariable';
import makeLiteralRule from './rules/makeLiteralRule';
import makeRegExRule from './rules/makeRegExRule';
import isString from './rules/isString';
import isHexColor from './rules/isHexColor';
import makeUnionRule from './rules/makeUnionRule';
import isNumber from './rules/isNumber';
import isPercentage from './rules/isPercentage';
import isAnimationName from './rules/isAnimationName';
import { borderSplitter } from './utils/split-css-value';

export type Variables = Map<string, ESTree.Expression>;
export type RuleCheck = (
  node: ESTree.Expression,
  variables?: Variables,
  prop?: ESTree.Property
) => RuleResponse;
export type RuleResponse =
  | undefined
  | {
      message: string;
      distance?: number;
      suggest?: {
        fix: Rule.ReportFixer;
        desc: string;
      };
    };

const showError =
  (message: string): RuleCheck =>
  () => ({ message });

const isStringOrNumber = makeUnionRule(isString, isNumber);

const isNamedColor = makeUnionRule(
  ...Array.from(namedColors).map((color) => makeLiteralRule(color))
);

const absoluteLengthUnits = new Set(['px', 'mm', 'in', 'pc', 'pt']);
const isAbsoluteLength: RuleCheck = (
  node: ESTree.Node,
  variables?: Variables
): RuleResponse => {
  if (node.type === 'Literal') {
    const val = node.value;
    if (
      typeof val === 'string' &&
      Array.from(absoluteLengthUnits).some((unit) =>
        val.match(new RegExp(`^([-,+]?\\d+(\\.\\d+)?${unit})$`))
      )
    ) {
      return undefined;
    }
  }
  return {
    message: `a number ending in ${Array.from(absoluteLengthUnits).join(', ')}`,
  };
};

const relativeLengthUnits = new Set([
  // font units
  'ch',
  'em',
  'ex',
  'ic',
  'rem',
  // viewport units
  'vh',
  'vw',
  'vmin',
  'vmax',
  'svh',
  'dvh',
  'lvh',
  'svw',
  'dvw',
  'ldw',
  // container units
  'cqw',
  'cqh',
  'cqmin',
  'cqmax',
]);
const isRelativeLength: RuleCheck = (
  node: ESTree.Node,
  variables?: Variables
): RuleResponse => {
  if (node.type === 'Literal') {
    const val = node.value;
    if (
      typeof val === 'string' &&
      Array.from(relativeLengthUnits).some((unit) =>
        val.match(new RegExp(`^([-,+]?\\d+(\\.\\d+)?${unit})$`))
      )
    ) {
      return undefined;
    }
  }

  return {
    message: `a number ending in ${Array.from(relativeLengthUnits).join(', ')}`,
  };
};

const isLength = makeUnionRule(isAbsoluteLength, isRelativeLength);

// NOTE: converted from Flow types to function calls using this
// https://astexplorer.net/#/gist/87e64b378349f13e885f9b6968c1e556/4b4ff0358de33cf86b8b21d29c17504d789babf9
const all: RuleCheck = makeUnionRule(
  makeLiteralRule('initial'),
  makeLiteralRule('inherit'),
  makeLiteralRule('unset'),
  makeLiteralRule('revert')
);
const color = makeUnionRule(isString, isNamedColor, isHexColor);
const width = makeUnionRule(
  isString,
  isNumber,
  makeLiteralRule('available'),
  makeLiteralRule('min-content'),
  makeLiteralRule('max-content'),
  makeLiteralRule('fit-content'),
  makeLiteralRule('auto'),
  isLength,
  isPercentage
);
const borderWidth = makeUnionRule(
  isNumber,
  makeLiteralRule('thin'),
  makeLiteralRule('medium'),
  makeLiteralRule('thick'),
  isString,
  isLength
);
const lengthPercentage = isStringOrNumber;
const borderImageSource = makeUnionRule(makeLiteralRule('none'), isString);
const time = isString;
const singleAnimationDirection = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('reverse'),
  makeLiteralRule('alternate'),
  makeLiteralRule('alternate-reverse')
);
const singleAnimationFillMode = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('forwards'),
  makeLiteralRule('backwards'),
  makeLiteralRule('both')
);
const singleAnimationIterationCount = makeUnionRule(
  makeLiteralRule('infinite'),
  isNumber
);
// TODO change this to a special function that looks for stylex.keyframes call
const singleAnimationName = makeUnionRule(
  makeLiteralRule('none'),
  isAnimationName
);

const singleAnimationPlayState = makeUnionRule(
  makeLiteralRule('running'),
  makeLiteralRule('paused')
);
const singleTransitionTimingFunction = makeUnionRule(
  makeLiteralRule('ease'),
  makeLiteralRule('linear'),
  makeLiteralRule('ease-in'),
  makeLiteralRule('ease-out'),
  makeLiteralRule('ease-in-out'),
  makeLiteralRule('step-start'),
  makeLiteralRule('step-end'),
  isString
);
const attachment = makeUnionRule(
  makeLiteralRule('scroll'),
  makeLiteralRule('fixed'),
  makeLiteralRule('local')
);
const blendMode = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('multiply'),
  makeLiteralRule('screen'),
  makeLiteralRule('overlay'),
  makeLiteralRule('darken'),
  makeLiteralRule('lighten'),
  makeLiteralRule('color-dodge'),
  makeLiteralRule('color-burn'),
  makeLiteralRule('hard-light'),
  makeLiteralRule('soft-light'),
  makeLiteralRule('difference'),
  makeLiteralRule('exclusion'),
  makeLiteralRule('hue'),
  makeLiteralRule('saturation'),
  makeLiteralRule('color'),
  makeLiteralRule('luminosity')
);
const bgSize = makeUnionRule(
  isString,
  makeLiteralRule('cover'),
  makeLiteralRule('contain')
);
const boxAlign = makeUnionRule(
  makeLiteralRule('start'),
  makeLiteralRule('center'),
  makeLiteralRule('end'),
  makeLiteralRule('baseline'),
  makeLiteralRule('stretch')
);
const repeatStyle = makeUnionRule(
  makeLiteralRule('repeat-x'),
  makeLiteralRule('repeat-y'),
  isString
);
const backgroundPosition = makeUnionRule(
  isString,
  makeLiteralRule('top'),
  makeLiteralRule('bottom'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('center')
);
const backgroundPositionX = makeUnionRule(
  isString,
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('center')
);
const backgroundPositionY = makeUnionRule(
  isString,
  makeLiteralRule('top'),
  makeLiteralRule('bottom'),
  makeLiteralRule('center')
);
const borderImageOutset = isString;
const borderImageRepeat = makeUnionRule(
  isString,
  makeLiteralRule('stretch'),
  makeLiteralRule('repeat'),
  makeLiteralRule('round'),
  makeLiteralRule('space')
);
const borderImageWidth = isString;
const borderImageSlice = makeUnionRule(
  isStringOrNumber,
  makeLiteralRule('fill')
);
const box = makeUnionRule(
  makeLiteralRule('border-box'),
  makeLiteralRule('padding-box'),
  makeLiteralRule('content-box')
);
const brStyle = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('hidden'),
  makeLiteralRule('dotted'),
  makeLiteralRule('dashed'),
  makeLiteralRule('solid'),
  makeLiteralRule('double'),
  makeLiteralRule('groove'),
  makeLiteralRule('ridge'),
  makeLiteralRule('inset'),
  makeLiteralRule('outset')
);
const CSSCursor = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('default'),
  makeLiteralRule('none'),
  makeLiteralRule('context-menu'),
  makeLiteralRule('help'),
  makeLiteralRule('pointer'),
  makeLiteralRule('progress'),
  makeLiteralRule('wait'),
  makeLiteralRule('cell'),
  makeLiteralRule('crosshair'),
  makeLiteralRule('text'),
  makeLiteralRule('vertical-text'),
  makeLiteralRule('alias'),
  makeLiteralRule('copy'),
  makeLiteralRule('move'),
  makeLiteralRule('no-drop'),
  makeLiteralRule('not-allowed'),
  makeLiteralRule('e-resize'),
  makeLiteralRule('n-resize'),
  makeLiteralRule('ne-resize'),
  makeLiteralRule('nw-resize'),
  makeLiteralRule('s-resize'),
  makeLiteralRule('se-resize'),
  makeLiteralRule('sw-resize'),
  makeLiteralRule('w-resize'),
  makeLiteralRule('ew-resize'),
  makeLiteralRule('ns-resize'),
  makeLiteralRule('nesw-resize'),
  makeLiteralRule('nwse-resize'),
  makeLiteralRule('col-resize'),
  makeLiteralRule('row-resize'),
  makeLiteralRule('all-scroll'),
  makeLiteralRule('zoom-in'),
  makeLiteralRule('zoom-out'),
  makeLiteralRule('grab'),
  makeLiteralRule('grabbing'),
  makeLiteralRule('-webkit-grab'),
  makeLiteralRule('-webkit-grabbing')
);
const relativeSize = makeUnionRule(
  makeLiteralRule('larger'),
  makeLiteralRule('smaller')
);
const emptyCells = makeUnionRule(
  makeLiteralRule('show'),
  makeLiteralRule('hide')
);
const filter = makeUnionRule(makeLiteralRule('none'), isString);
// const flex = makeUnionRule(makeLiteralRule('none'), isString, isNumber);
const flexBasis = makeUnionRule(makeLiteralRule('content'), isNumber, isString);
const flexDirection = makeUnionRule(
  makeLiteralRule('row'),
  makeLiteralRule('row-reverse'),
  makeLiteralRule('column'),
  makeLiteralRule('column-reverse')
);
const flexWrap = makeUnionRule(
  makeLiteralRule('nowrap'),
  makeLiteralRule('wrap'),
  makeLiteralRule('wrap-reverse')
);
const flexGrow = isNumber;
const flexShrink = isNumber;
const flexFlow = makeUnionRule(flexDirection, flexWrap);
const float = makeUnionRule(
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('none'),
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('inline-start'),
  makeLiteralRule('inline-end')
);
const absoluteSize = makeUnionRule(
  makeLiteralRule('xx-small'),
  makeLiteralRule('x-small'),
  makeLiteralRule('small'),
  makeLiteralRule('medium'),
  makeLiteralRule('large'),
  makeLiteralRule('x-large'),
  makeLiteralRule('xx-large')
);
const baselinePosition = makeUnionRule(
  makeLiteralRule('baseline'),
  makeLiteralRule('first baseline'),
  makeLiteralRule('last baseline')
);
const fontFamily = isString;
const gridLine = makeUnionRule(makeLiteralRule('auto'), isString);
const gridTemplate = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('subgrid'),
  isString
);
const gridTemplateAreas = makeUnionRule(makeLiteralRule('none'), isString);
const gridTemplateColumns = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('subgrid'),
  isString
);
const gridTemplateRows = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('subgrid'),
  isString
);
const gridRowGap = lengthPercentage;
const trackBreadth = makeUnionRule(
  lengthPercentage,
  isString,
  makeLiteralRule('min-content'),
  makeLiteralRule('max-content'),
  makeLiteralRule('auto')
);
const selfPosition = makeUnionRule(
  makeLiteralRule('center'),
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('self-start'),
  makeLiteralRule('self-end'),
  makeLiteralRule('flex-start'),
  makeLiteralRule('flex-end')
);
const listStyleType = makeUnionRule(isString, makeLiteralRule('none'));
const trackSize = makeUnionRule(trackBreadth, isString);
const borderStyle = brStyle;
const columnRuleColor = color;
const columnRuleStyle = brStyle;
const columnRuleWidth = borderWidth;
const columnRule = makeUnionRule(
  columnRuleWidth,
  columnRuleStyle,
  columnRuleColor
);
const singleTimingFunction = singleTransitionTimingFunction;
const shapeBox = makeUnionRule(box, makeLiteralRule('margin-box'));
const geometryBox = makeUnionRule(
  shapeBox,
  makeLiteralRule('fill-box'),
  makeLiteralRule('stroke-box'),
  makeLiteralRule('view-box')
);
const maskReference = makeUnionRule(makeLiteralRule('none'), isString);
const compositeOperator = makeUnionRule(
  makeLiteralRule('add'),
  makeLiteralRule('subtract'),
  makeLiteralRule('intersect'),
  makeLiteralRule('exclude')
);
const maskingMode = makeUnionRule(
  makeLiteralRule('alpha'),
  makeLiteralRule('luminance'),
  makeLiteralRule('match-source')
);
const maskLayer = makeUnionRule(
  maskReference,
  maskingMode,
  isString,
  repeatStyle,
  geometryBox,
  compositeOperator
);

const alignContent = makeUnionRule(
  makeLiteralRule('flex-start'),
  makeLiteralRule('flex-end'),
  makeLiteralRule('center'),
  makeLiteralRule('space-between'),
  makeLiteralRule('space-around'),
  makeLiteralRule('stretch')
);
const alignItems = makeUnionRule(
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('flex-start'),
  makeLiteralRule('flex-end'),
  makeLiteralRule('center'),
  makeLiteralRule('baseline'),
  makeLiteralRule('stretch')
);
const alignSelf = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('flex-start'),
  makeLiteralRule('flex-end'),
  makeLiteralRule('center'),
  makeLiteralRule('baseline'),
  makeLiteralRule('stretch')
);
const animationDelay = time;
const animationDirection = singleAnimationDirection;
const animationDuration = time;
const animationFillMode = singleAnimationFillMode;
const animationIterationCount = singleAnimationIterationCount;
const animationName = singleAnimationName;
const animationPlayState = singleAnimationPlayState;
const animationTimingFunction = singleTimingFunction;
const appearance = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('none'),
  makeLiteralRule('textfield')
);
const backdropFilter = makeUnionRule(makeLiteralRule('none'), isString);
const backfaceVisibility = makeUnionRule(
  makeLiteralRule('visible'),
  makeLiteralRule('hidden')
);
// type background = string | finalBgLayer;
const backgroundAttachment = attachment;
const backgroundBlendMode = blendMode;
const backgroundClip = box;
const backgroundColor = color;
const backgroundImage = makeUnionRule(makeLiteralRule('none'), isString);
const backgroundOrigin = box;
const backgroundRepeat = repeatStyle;
const backgroundSize = bgSize;
const blockSize = width;
const quotedString = (val: number | string) =>
  typeof val === 'string' ? `'${val}'` : val;
const border =
  (suffix: string = ''): RuleCheck =>
  (node: ESTree.Expression, _variables?: Variables, prop?: ESTree.Property) => {
    const response: RuleResponse = {
      message: `The 'border${suffix}' property is not supported. Use the 'border${suffix}Width', 'border${suffix}Style' and 'border${suffix}Color' properties instead.`,
    };
    if (node.type !== 'Literal' || prop == null) {
      return response;
    }
    if (typeof node.value === 'number') {
      response.suggest = {
        desc: `Replace 'border${suffix}' set to a number with 'border${suffix}Width' instead?`,
        fix: (fixer: Rule.RuleFixer): Rule.Fix | null => {
          return fixer.replaceText(prop, `border${suffix}Width: ${node.value}`);
        },
      };
    }
    if (typeof node.value === 'string') {
      const [width, style, color] = borderSplitter(node.value);
      if (width != null || style != null || color != null) {
        response.suggest = {
          desc: `Replace 'border${suffix}' with 'border${suffix}Width', 'border${suffix}Style' and 'border${suffix}Color' instead?`,
          fix: (fixer: Rule.RuleFixer): Rule.Fix | null => {
            const newRules = [];
            if (width != null) {
              newRules.push(`border${suffix}Width: ${quotedString(width)}`);
            }
            if (style != null) {
              newRules.push(`border${suffix}Style: ${quotedString(style)}`);
            }
            if (color != null) {
              newRules.push(`border${suffix}Color: ${quotedString(color)}`);
            }
            return fixer.replaceText(prop, newRules.join(',\n    '));
          },
        };
      }
    }
    return response;
  };
// const borderBlockEnd = makeUnionRule(borderWidth, borderStyle, color);
// const borderBlockEndColor = color;
// const borderBlockEndStyle = borderStyle;
// const borderBlockEndWidth = borderWidth;
// const borderBlockStart = makeUnionRule(borderWidth, borderStyle, color);
// const borderBlockStartColor = color;
// const borderBlockStartStyle = borderStyle;
// const borderBlockStartWidth = borderWidth;
const borderBottomLeftRadius = lengthPercentage;
const borderBottomRightRadius = lengthPercentage;
const borderBottomStyle = brStyle;
const borderBottomWidth = borderWidth;
const borderCollapse = makeUnionRule(
  makeLiteralRule('collapse'),
  makeLiteralRule('separate')
);
const borderColor = color;
const borderImage = makeUnionRule(
  borderImageSource,
  borderImageSlice,
  isString,
  borderImageRepeat
);
// const borderInlineEnd = makeUnionRule(borderWidth, borderStyle, color);
// const borderInlineEndColor = color;
// const borderInlineEndStyle = borderStyle;
// const borderInlineEndWidth = borderWidth;
// const borderInlineStart = makeUnionRule(borderWidth, borderStyle, color);
// const borderInlineStartColor = color;
// const borderInlineStartStyle = borderStyle;
// const borderInlineStartWidth = borderWidth;
const borderLeftColor = color;
const borderLeftStyle = brStyle;
const borderLeftWidth = borderWidth;
const borderRightColor = color;
const borderRightStyle = brStyle;
const borderRightWidth = borderWidth;
const borderRadius = lengthPercentage;
const borderSpacing = isNumber;
const borderTopLeftRadius = lengthPercentage;
const borderTopRightRadius = lengthPercentage;
const borderTopStyle = brStyle;
const borderTopWidth = borderWidth;
const boxDecorationBreak = makeUnionRule(
  makeLiteralRule('slice'),
  makeLiteralRule('clone')
);
const boxDirection = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('reverse')
);
const boxFlex = isNumber;
const boxFlexGroup = isNumber;
const boxLines = makeUnionRule(
  makeLiteralRule('single'),
  makeLiteralRule('multiple')
);
const boxOrdinalGroup = isNumber;
const boxOrient = makeUnionRule(
  makeLiteralRule('horizontal'),
  makeLiteralRule('vertical'),
  makeLiteralRule('inline-axis'),
  makeLiteralRule('block-axis')
);
const boxShadow = makeUnionRule(makeLiteralRule('none'), isString);
const boxSizing = makeUnionRule(
  makeLiteralRule('content-box'),
  makeLiteralRule('border-box')
);
const boxSuppress = makeUnionRule(
  makeLiteralRule('show'),
  makeLiteralRule('discard'),
  makeLiteralRule('hide')
);
const breakAfter = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('avoid'),
  makeLiteralRule('avoid-page'),
  makeLiteralRule('page'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('recto'),
  makeLiteralRule('verso'),
  makeLiteralRule('avoid-column'),
  makeLiteralRule('column'),
  makeLiteralRule('avoid-region'),
  makeLiteralRule('region')
);
const breakBefore = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('avoid'),
  makeLiteralRule('avoid-page'),
  makeLiteralRule('page'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('recto'),
  makeLiteralRule('verso'),
  makeLiteralRule('avoid-column'),
  makeLiteralRule('column'),
  makeLiteralRule('avoid-region'),
  makeLiteralRule('region')
);
const breakInside = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('avoid'),
  makeLiteralRule('avoid-page'),
  makeLiteralRule('avoid-column'),
  makeLiteralRule('avoid-region')
);
const captionSide = makeUnionRule(
  makeLiteralRule('top'),
  makeLiteralRule('bottom'),
  makeLiteralRule('block-start'),
  makeLiteralRule('block-end'),
  makeLiteralRule('inline-start'),
  makeLiteralRule('inline-end')
);
const clear = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('both'),
  makeLiteralRule('inline-start'),
  makeLiteralRule('inline-end')
);
const clip = makeUnionRule(isString, makeLiteralRule('auto'));
const clipPath = makeUnionRule(isString, makeLiteralRule('none'));
const columnCount = makeUnionRule(isNumber, makeLiteralRule('auto'));
const columnFill = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('balance')
);
const columnGap = makeUnionRule(isNumber, isString, makeLiteralRule('normal'));
const columnSpan = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('all')
);
const columnWidth = makeUnionRule(isNumber, makeLiteralRule('auto'));
const columns = makeUnionRule(columnWidth, columnCount);
const contain = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('strict'),
  makeLiteralRule('content'),
  isString
);
const content = isString;
const counterIncrement = makeUnionRule(isString, makeLiteralRule('none'));
const counterReset = makeUnionRule(isString, makeLiteralRule('none'));
const cursor = CSSCursor;
const direction = makeUnionRule(makeLiteralRule('ltr'), makeLiteralRule('rtl'));
const display = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('inline'),
  makeLiteralRule('block'),
  makeLiteralRule('list-item'),
  makeLiteralRule('inline-list-item'),
  makeLiteralRule('inline-block'),
  makeLiteralRule('inline-table'),
  makeLiteralRule('table'),
  makeLiteralRule('table-cell'),
  makeLiteralRule('table-column'),
  makeLiteralRule('table-column-group'),
  makeLiteralRule('table-footer-group'),
  makeLiteralRule('table-header-group'),
  makeLiteralRule('table-row'),
  makeLiteralRule('table-row-group'),
  makeLiteralRule('flex'),
  makeLiteralRule('inline-flex'),
  makeLiteralRule('grid'),
  makeLiteralRule('inline-grid'),
  makeLiteralRule('run-in'),
  makeLiteralRule('ruby'),
  makeLiteralRule('ruby-base'),
  makeLiteralRule('ruby-text'),
  makeLiteralRule('ruby-base-container'),
  makeLiteralRule('ruby-text-container'),
  makeLiteralRule('contents')
);
const displayInside = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('block'),
  makeLiteralRule('table'),
  makeLiteralRule('flex'),
  makeLiteralRule('grid'),
  makeLiteralRule('ruby')
);
const displayList = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('list-item')
);
const displayOutside = makeUnionRule(
  makeLiteralRule('block-level'),
  makeLiteralRule('inline-level'),
  makeLiteralRule('run-in'),
  makeLiteralRule('contents'),
  makeLiteralRule('none'),
  makeLiteralRule('table-row-group'),
  makeLiteralRule('table-header-group'),
  makeLiteralRule('table-footer-group'),
  makeLiteralRule('table-row'),
  makeLiteralRule('table-cell'),
  makeLiteralRule('table-column-group'),
  makeLiteralRule('table-column'),
  makeLiteralRule('table-caption'),
  makeLiteralRule('ruby-base'),
  makeLiteralRule('ruby-text'),
  makeLiteralRule('ruby-base-container'),
  makeLiteralRule('ruby-text-container')
);
const fontFeatureSettings = makeUnionRule(makeLiteralRule('normal'), isString);
const fontKerning = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('normal'),
  makeLiteralRule('none')
);
const fontLanguageOverride = makeUnionRule(makeLiteralRule('normal'), isString);
const fontSize = makeUnionRule(absoluteSize, relativeSize, lengthPercentage);
const fontSizeAdjust = makeUnionRule(makeLiteralRule('none'), isNumber);
const fontStretch = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('ultra-condensed'),
  makeLiteralRule('extra-condensed'),
  makeLiteralRule('condensed'),
  makeLiteralRule('semi-condensed'),
  makeLiteralRule('semi-expanded'),
  makeLiteralRule('expanded'),
  makeLiteralRule('extra-expanded'),
  makeLiteralRule('ultra-expanded')
);
const fontStyle = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('italic'),
  makeLiteralRule('oblique')
);
const fontSynthesis = makeUnionRule(makeLiteralRule('none'), isString);
const fontVariant = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('none'),
  isString
);
const fontVariantAlternates = makeUnionRule(
  makeLiteralRule('normal'),
  isString
);
const fontVariantCaps = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('small-caps'),
  makeLiteralRule('all-small-caps'),
  makeLiteralRule('petite-caps'),
  makeLiteralRule('all-petite-caps'),
  makeLiteralRule('unicase'),
  makeLiteralRule('titling-caps')
);
const fontVariantEastAsian = makeUnionRule(makeLiteralRule('normal'), isString);
const fontVariantLigatures = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('none'),
  isString
);
const fontVariantNumeric = makeUnionRule(makeLiteralRule('normal'), isString);
const fontVariantPosition = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('sub'),
  makeLiteralRule('super')
);
const fontWeight = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('bold'),
  makeLiteralRule('bolder'),
  makeLiteralRule('lighter'),
  makeLiteralRule(100),
  makeLiteralRule(200),
  makeLiteralRule(300),
  makeLiteralRule(400),
  makeLiteralRule(500),
  makeLiteralRule(600),
  makeLiteralRule(700),
  makeLiteralRule(800),
  makeLiteralRule(900),
  isCSSVariable
);
const gap = isStringOrNumber;
const grid = makeUnionRule(gridTemplate, isString);
const gridArea = makeUnionRule(gridLine, isString);
const gridAutoColumns = trackSize;
const gridAutoFlow = makeUnionRule(isString, makeLiteralRule('dense'));
const gridAutoRows = trackSize;
const gridColumn = makeUnionRule(gridLine, isString);
const gridColumnEnd = gridLine;
const gridColumnGap = lengthPercentage;
const gridColumnStart = gridLine;
const gridGap = makeUnionRule(gridRowGap, gridColumnGap);
const gridRow = makeUnionRule(gridLine, isString);
const gridRowEnd = gridLine;
const gridRowStart = gridLine;
const hyphens = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('manual'),
  makeLiteralRule('auto')
);
const imageOrientation = makeUnionRule(
  makeLiteralRule('from-image'),
  isNumber,
  isString
);
const imageRendering = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('crisp-edges'),
  makeLiteralRule('pixelated'),
  makeLiteralRule('optimizeSpeed'),
  makeLiteralRule('optimizeQuality'),
  isString
);
const imageResolution = makeUnionRule(isString, makeLiteralRule('snap'));
const imeMode = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('normal'),
  makeLiteralRule('active'),
  makeLiteralRule('inactive'),
  makeLiteralRule('disabled')
);
const initialLetter = makeUnionRule(makeLiteralRule('normal'), isString);
const initialLetterAlign = isString;
const inlineSize = width;
const isolation = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('isolate')
);
const justifyContent = makeUnionRule(
  makeLiteralRule('flex-start'),
  makeLiteralRule('flex-end'),
  makeLiteralRule('center'),
  makeLiteralRule('stretch'),
  makeLiteralRule('space-between'),
  makeLiteralRule('space-around'),
  makeLiteralRule('space-evenly')
);
const justifyItems = makeUnionRule(
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('flex-start'),
  makeLiteralRule('flex-end'),
  makeLiteralRule('center'),
  makeLiteralRule('baseline'),
  makeLiteralRule('stretch')
);
// There's an optional overflowPosition (safe vs unsafe) prefix to
// [selfPosition | 'left' | 'right']. It's not used on www, so, it's not added
// here.
const justifySelf = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('normal'),
  makeLiteralRule('stretch'),
  baselinePosition,
  selfPosition,
  makeLiteralRule('left'),
  makeLiteralRule('right')
);
const letterSpacing = makeUnionRule(
  makeLiteralRule('normal'),
  lengthPercentage
);
const lineBreak = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('loose'),
  makeLiteralRule('normal'),
  makeLiteralRule('strict')
);
const lineHeight = isNumber;
const listStyleImage = makeUnionRule(isString, makeLiteralRule('none'));
const listStylePosition = makeUnionRule(
  makeLiteralRule('inside'),
  makeLiteralRule('outside')
);
const listStyle = makeUnionRule(
  listStyleType,
  listStylePosition,
  listStyleImage
);
const margin = isStringOrNumber;
const marginLeft = makeUnionRule(isNumber, isString, makeLiteralRule('auto'));
const marginRight = makeUnionRule(isNumber, isString, makeLiteralRule('auto'));
const marginTop = makeUnionRule(isNumber, isString, makeLiteralRule('auto'));
// const marginBlockEnd = marginLeft;
// const marginBlockStart = marginLeft;
const marginBottom = makeUnionRule(isNumber, isString, makeLiteralRule('auto'));
// const marginInlineEnd = marginLeft;
// const marginInlineStart = marginLeft;
const markerOffset = makeUnionRule(isNumber, makeLiteralRule('auto'));
const mask = maskLayer;
const maskClip = isString;
const maskComposite = compositeOperator;
const maskMode = maskingMode;
const maskOrigin = geometryBox;
const maskPosition = isString;
const maskRepeat = repeatStyle;
const maskSize = bgSize;
const maskType = makeUnionRule(
  makeLiteralRule('luminance'),
  makeLiteralRule('alpha')
);
const maxWidth = makeUnionRule(
  isNumber,
  isString,
  makeLiteralRule('none'),
  makeLiteralRule('max-content'),
  makeLiteralRule('min-content'),
  makeLiteralRule('fit-content'),
  makeLiteralRule('fill-available')
);
const maxBlockSize = maxWidth;
const maxHeight = makeUnionRule(
  isNumber,
  isString,
  makeLiteralRule('none'),
  makeLiteralRule('max-content'),
  makeLiteralRule('min-content'),
  makeLiteralRule('fit-content'),
  makeLiteralRule('fill-available')
);
const maxInlineSize = maxWidth;
const minWidth = makeUnionRule(
  isNumber,
  isString,
  makeLiteralRule('auto'),
  makeLiteralRule('max-content'),
  makeLiteralRule('min-content'),
  makeLiteralRule('fit-content'),
  makeLiteralRule('fill-available')
);
const minBlockSize = minWidth;
const minHeight = makeUnionRule(
  isNumber,
  isString,
  makeLiteralRule('auto'),
  makeLiteralRule('max-content'),
  makeLiteralRule('min-content'),
  makeLiteralRule('fit-content'),
  makeLiteralRule('fill-available')
);
const minInlineSize = minWidth;

const mixBlendMode = blendMode;
const motionPath = makeUnionRule(
  isString,
  geometryBox,
  makeLiteralRule('none')
);
const motionOffset = lengthPercentage;
const motionRotation = isStringOrNumber;
const motion = makeUnionRule(motionPath, motionOffset, motionRotation);
const objectFit = makeUnionRule(
  makeLiteralRule('fill'),
  makeLiteralRule('contain'),
  makeLiteralRule('cover'),
  makeLiteralRule('none'),
  makeLiteralRule('scale-down')
);
const objectPosition = isString;
const offsetBlockEnd = isString;
const offsetBlockStart = isString;
const offsetInlineEnd = isString;
const offsetInlineStart = isString;
const opacity = isNumber;
const order = isNumber;
const orphans = isNumber;
const outline = isString;
// const outlineColor = makeUnionRule(color, makeLiteralRule('invert'));
// const outlineOffset = isNumber;
// const outlineStyle = makeUnionRule(makeLiteralRule('auto'), brStyle);
// const outlineWidth = borderWidth;
const overflow = makeUnionRule(
  makeLiteralRule('visible'),
  makeLiteralRule('hidden'),
  makeLiteralRule('scroll'),
  makeLiteralRule('auto')
);
const overflowAnchor = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('none')
);
const overflowClipBox = makeUnionRule(
  makeLiteralRule('padding-box'),
  makeLiteralRule('content-box')
);
const overflowWrap = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('break-word'),
  makeLiteralRule('anywhere')
);
const overflowX = makeUnionRule(
  makeLiteralRule('visible'),
  makeLiteralRule('hidden'),
  makeLiteralRule('scroll'),
  makeLiteralRule('auto')
);
const overflowY = makeUnionRule(
  makeLiteralRule('visible'),
  makeLiteralRule('hidden'),
  makeLiteralRule('scroll'),
  makeLiteralRule('auto')
);
const overscrollBehavior = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('contain'),
  makeLiteralRule('auto')
);
const overscrollBehaviorX = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('contain'),
  makeLiteralRule('auto')
);
const overscrollBehaviorY = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('contain'),
  makeLiteralRule('auto')
);
const padding = isStringOrNumber;
const paddingLeft = isStringOrNumber;
// const paddingBlockEnd = paddingLeft;
// const paddingBlockStart = paddingLeft;
const paddingBottom = isStringOrNumber;
const paddingRight = isStringOrNumber;
const paddingTop = isStringOrNumber;
const pageBreakAfter = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('always'),
  makeLiteralRule('avoid'),
  makeLiteralRule('left'),
  makeLiteralRule('right')
);
const pageBreakBefore = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('always'),
  makeLiteralRule('avoid'),
  makeLiteralRule('left'),
  makeLiteralRule('right')
);
const pageBreakInside = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('avoid')
);
const perspective = makeUnionRule(makeLiteralRule('none'), isNumber);
const perspectiveOrigin = isString;
const pointerEvents = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('none'),
  makeLiteralRule('visiblePainted'),
  makeLiteralRule('visibleFill'),
  makeLiteralRule('visibleStroke'),
  makeLiteralRule('visible'),
  makeLiteralRule('painted'),
  makeLiteralRule('fill'),
  makeLiteralRule('stroke'),
  makeLiteralRule('all')
);
const position = makeUnionRule(
  makeLiteralRule('static'),
  makeLiteralRule('relative'),
  makeLiteralRule('absolute'),
  makeLiteralRule('sticky'),
  makeLiteralRule('fixed')
);
const quotes = makeUnionRule(isString, makeLiteralRule('none'));
const resize = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('both'),
  makeLiteralRule('horizontal'),
  makeLiteralRule('vertical')
);
const rowGap = isStringOrNumber;
const rubyAlign = makeUnionRule(
  makeLiteralRule('start'),
  makeLiteralRule('center'),
  makeLiteralRule('space-between'),
  makeLiteralRule('space-around')
);
const rubyMerge = makeUnionRule(
  makeLiteralRule('separate'),
  makeLiteralRule('collapse'),
  makeLiteralRule('auto')
);
const rubyPosition = makeUnionRule(
  makeLiteralRule('over'),
  makeLiteralRule('under'),
  makeLiteralRule('inter-character')
);
const scrollBehavior = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('smooth')
);
const scrollSnapPaddingBottom = isNumber;
const scrollSnapPaddingTop = isNumber;
const scrollSnapAlign = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('center')
);
const scrollSnapType = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('x mandatory'),
  makeLiteralRule('y mandatory')
);
const shapeImageThreshold = isNumber;
const shapeMargin = lengthPercentage;
const shapeOutside = makeUnionRule(makeLiteralRule('none'), shapeBox, isString);
const tabSize = isNumber;
const tableLayout = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('fixed')
);
const textAlign = makeUnionRule(
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('center'),
  makeLiteralRule('justify'),
  makeLiteralRule('match-parent')
);
const textAlignLast = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('start'),
  makeLiteralRule('end'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  makeLiteralRule('center'),
  makeLiteralRule('justify')
);
const textCombineUpright = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('all'),
  isString
);
const textDecorationColor = color;
const textDecorationLine = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('underline'),
  makeLiteralRule('overline'),
  makeLiteralRule('line-through'),
  makeLiteralRule('blink'),
  isString
);
// const textDecorationSkip = makeUnionRule(makeLiteralRule('none'), isString);
const textDecorationStyle = makeUnionRule(
  makeLiteralRule('solid'),
  makeLiteralRule('double'),
  makeLiteralRule('dotted'),
  makeLiteralRule('dashed'),
  makeLiteralRule('wavy')
);
const textDecoration = makeUnionRule(
  textDecorationLine,
  textDecorationStyle,
  textDecorationColor
);
const textEmphasisColor = color;
const textEmphasisPosition = isString;
const textEmphasisStyle = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('filled'),
  makeLiteralRule('open'),
  makeLiteralRule('dot'),
  makeLiteralRule('circle'),
  makeLiteralRule('double-circle'),
  makeLiteralRule('triangle'),
  makeLiteralRule('filled sesame'),
  makeLiteralRule('open sesame'),
  isString
);
const textEmphasis = makeUnionRule(textEmphasisStyle, textEmphasisColor);
const textIndent = makeUnionRule(
  lengthPercentage,
  makeLiteralRule('hanging'),
  makeLiteralRule('each-line')
);
const textOrientation = makeUnionRule(
  makeLiteralRule('mixed'),
  makeLiteralRule('upright'),
  makeLiteralRule('sideways')
);
const textOverflow = makeUnionRule(
  makeLiteralRule('clip'),
  makeLiteralRule('ellipsis'),
  isString
);
const textRendering = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('optimizeSpeed'),
  makeLiteralRule('optimizeLegibility'),
  makeLiteralRule('geometricPrecision')
);
const textShadow = makeUnionRule(makeLiteralRule('none'), isString);
const textSizeAdjust = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('auto'),
  isString
);
const textTransform = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('capitalize'),
  makeLiteralRule('uppercase'),
  makeLiteralRule('lowercase'),
  makeLiteralRule('full-width')
);
const textUnderlinePosition = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('under'),
  makeLiteralRule('left'),
  makeLiteralRule('right'),
  isString
);
const touchAction = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('none'),
  isString,
  makeLiteralRule('manipulation')
);
const transform = makeUnionRule(makeLiteralRule('none'), isString);
const transformBox = makeUnionRule(
  makeLiteralRule('border-box'),
  makeLiteralRule('fill-box'),
  makeLiteralRule('view-box'),
  makeLiteralRule('content-box'),
  makeLiteralRule('stroke-box')
);
const transformOrigin = isStringOrNumber;
const transformStyle = makeUnionRule(
  makeLiteralRule('flat'),
  makeLiteralRule('preserve-3d')
);
const transitionDelay = time;
const transitionDuration = time;
const transitionProperty = makeUnionRule(
  makeLiteralRule('opacity'),
  makeLiteralRule('transform'),
  makeLiteralRule('opacity, transform'),
  // All is bad for animation performance.
  // makeLiteralRule('all'),
  makeLiteralRule('none')
);
const transitionTimingFunction = singleTransitionTimingFunction;
const unicodeBidi = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('embed'),
  makeLiteralRule('isolate'),
  makeLiteralRule('bidi-override'),
  makeLiteralRule('isolate-override'),
  makeLiteralRule('plaintext')
);
const userSelect = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('text'),
  makeLiteralRule('none'),
  makeLiteralRule('contain'),
  makeLiteralRule('all')
);
const verticalAlign = makeUnionRule(
  makeLiteralRule('baseline'),
  makeLiteralRule('sub'),
  makeLiteralRule('super'),
  makeLiteralRule('text-top'),
  makeLiteralRule('text-bottom'),
  makeLiteralRule('middle'),
  makeLiteralRule('top'),
  makeLiteralRule('bottom'),
  isString,
  isNumber
);
const visibility = makeUnionRule(
  makeLiteralRule('visible'),
  makeLiteralRule('hidden'),
  makeLiteralRule('collapse')
);
const whiteSpace = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('pre'),
  makeLiteralRule('nowrap'),
  makeLiteralRule('pre-wrap'),
  makeLiteralRule('pre-line'),
  makeLiteralRule('break-spaces')
);
const widows = isNumber;
const animatableFeature = makeUnionRule(
  makeLiteralRule('scroll-position'),
  makeLiteralRule('contents'),
  isString
);
const willChange = makeUnionRule(makeLiteralRule('auto'), animatableFeature);
const nonStandardWordBreak = makeLiteralRule('break-word');
const wordBreak = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('break-all'),
  makeLiteralRule('keep-all'),
  nonStandardWordBreak
);
const wordSpacing = makeUnionRule(makeLiteralRule('normal'), lengthPercentage);
const wordWrap = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('break-word')
);
const svgWritingMode = makeUnionRule(
  makeLiteralRule('lr-tb'),
  makeLiteralRule('rl-tb'),
  makeLiteralRule('tb-rl'),
  makeLiteralRule('lr'),
  makeLiteralRule('rl'),
  makeLiteralRule('tb')
);
const writingMode = makeUnionRule(
  makeLiteralRule('horizontal-tb'),
  makeLiteralRule('vertical-rl'),
  makeLiteralRule('vertical-lr'),
  makeLiteralRule('sideways-rl'),
  makeLiteralRule('sideways-lr'),
  svgWritingMode
);
const zIndex = makeUnionRule(makeLiteralRule('auto'), isNumber);
const alignmentBaseline = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('baseline'),
  makeLiteralRule('before-edge'),
  makeLiteralRule('text-before-edge'),
  makeLiteralRule('middle'),
  makeLiteralRule('central'),
  makeLiteralRule('after-edge'),
  makeLiteralRule('text-after-edge'),
  makeLiteralRule('ideographic'),
  makeLiteralRule('alphabetic'),
  makeLiteralRule('hanging'),
  makeLiteralRule('mathematical')
);
const svgLength = isStringOrNumber;
const baselineShift = makeUnionRule(
  makeLiteralRule('baseline'),
  makeLiteralRule('sub'),
  makeLiteralRule('super'),
  svgLength
);
const behavior = isString;
const clipRule = makeUnionRule(
  makeLiteralRule('nonzero'),
  makeLiteralRule('evenodd')
);
const cueAfter = makeUnionRule(isStringOrNumber, makeLiteralRule('none'));
const cueBefore = makeUnionRule(isStringOrNumber, makeLiteralRule('none'));
const cue = makeUnionRule(cueBefore, cueAfter);
const dominantBaseline = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('use-script'),
  makeLiteralRule('no-change'),
  makeLiteralRule('reset-size'),
  makeLiteralRule('ideographic'),
  makeLiteralRule('alphabetic'),
  makeLiteralRule('hanging'),
  makeLiteralRule('mathematical'),
  makeLiteralRule('central'),
  makeLiteralRule('middle'),
  makeLiteralRule('text-after-edge'),
  makeLiteralRule('text-before-edge')
);
const paint = makeUnionRule(
  makeLiteralRule('none'),
  makeLiteralRule('currentColor'),
  color,
  isString
);
const fill = paint;
const fillOpacity = isNumber;
const fillRule = makeUnionRule(
  makeLiteralRule('nonzero'),
  makeLiteralRule('evenodd')
);
const glyphOrientationHorizontal = isNumber;
const glyphOrientationVertical = isNumber;
const kerning = makeUnionRule(makeLiteralRule('auto'), svgLength);
const marker = makeUnionRule(makeLiteralRule('none'), isString);
const markerEnd = makeUnionRule(makeLiteralRule('none'), isString);
const markerMid = makeUnionRule(makeLiteralRule('none'), isString);
const markerStart = makeUnionRule(makeLiteralRule('none'), isString);
const pauseAfter = makeUnionRule(
  isNumber,
  makeLiteralRule('none'),
  makeLiteralRule('x-weak'),
  makeLiteralRule('weak'),
  makeLiteralRule('medium'),
  makeLiteralRule('strong'),
  makeLiteralRule('x-strong')
);
const pauseBefore = makeUnionRule(
  isNumber,
  makeLiteralRule('none'),
  makeLiteralRule('x-weak'),
  makeLiteralRule('weak'),
  makeLiteralRule('medium'),
  makeLiteralRule('strong'),
  makeLiteralRule('x-strong')
);
const pause = makeUnionRule(pauseBefore, pauseAfter);
const restAfter = makeUnionRule(
  isNumber,
  makeLiteralRule('none'),
  makeLiteralRule('x-weak'),
  makeLiteralRule('weak'),
  makeLiteralRule('medium'),
  makeLiteralRule('strong'),
  makeLiteralRule('x-strong')
);
const restBefore = makeUnionRule(
  isNumber,
  makeLiteralRule('none'),
  makeLiteralRule('x-weak'),
  makeLiteralRule('weak'),
  makeLiteralRule('medium'),
  makeLiteralRule('strong'),
  makeLiteralRule('x-strong')
);
const rest = makeUnionRule(restBefore, restAfter);
const shapeRendering = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('optimizeSpeed'),
  makeLiteralRule('crispEdges'),
  makeLiteralRule('geometricPrecision')
);
const src = isString;
const speak = makeUnionRule(
  makeLiteralRule('auto'),
  makeLiteralRule('none'),
  makeLiteralRule('normal')
);
const speakAs = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('spell-out'),
  makeLiteralRule('digits'),
  isString
);
const stroke = paint;
const strokeDasharray = makeUnionRule(makeLiteralRule('none'), isString);
const strokeDashoffset = svgLength;
const strokeLinecap = makeUnionRule(
  makeLiteralRule('butt'),
  makeLiteralRule('round'),
  makeLiteralRule('square')
);
const strokeLinejoin = makeUnionRule(
  makeLiteralRule('miter'),
  makeLiteralRule('round'),
  makeLiteralRule('bevel')
);
const strokeMiterlimit = isNumber;
const strokeOpacity = isNumber;
const strokeWidth = svgLength;
const textAnchor = makeUnionRule(
  makeLiteralRule('start'),
  makeLiteralRule('middle'),
  makeLiteralRule('end')
);
const unicodeRange = isString;
const voiceBalance = makeUnionRule(
  isNumber,
  makeLiteralRule('left'),
  makeLiteralRule('center'),
  makeLiteralRule('right'),
  makeLiteralRule('leftwards'),
  makeLiteralRule('rightwards')
);
const voiceDuration = makeUnionRule(makeLiteralRule('auto'), time);
const voiceFamily = makeUnionRule(isString, makeLiteralRule('preserve'));
const voicePitch = makeUnionRule(
  isNumber,
  makeLiteralRule('absolute'),
  isString
);
const voiceRange = makeUnionRule(
  isNumber,
  makeLiteralRule('absolute'),
  isString
);
const voiceRate = isString;
const voiceStress = makeUnionRule(
  makeLiteralRule('normal'),
  makeLiteralRule('strong'),
  makeLiteralRule('moderate'),
  makeLiteralRule('none'),
  makeLiteralRule('reduced')
);
const voiceVolume = makeUnionRule(makeLiteralRule('silent'), isString);
const maskImage = maskReference;
const top = isStringOrNumber;

const SupportedVendorSpecificCSSProperties = {
  MozOsxFontSmoothing: makeLiteralRule('grayscale'),
  WebkitFontSmoothing: makeLiteralRule('antialiased'),
  WebkitAppearance: makeLiteralRule('textfield'),
  WebkitTapHighlightColor: color,
  WebkitOverflowScrolling: makeLiteralRule('touch'),
};

/* eslint-disable object-shorthand */
const CSSProperties: { [key: string]: RuleCheck } = {
  ...SupportedVendorSpecificCSSProperties,
  alignContent: alignContent,
  alignItems: alignItems,
  alignSelf: alignSelf,
  alignmentBaseline: alignmentBaseline,
  all: all,
  animationDelay: animationDelay,
  animationDirection: animationDirection,
  animationDuration: animationDuration,
  animationFillMode: animationFillMode,
  animationIterationCount: animationIterationCount,
  animationName: animationName,
  animationPlayState: animationPlayState,
  animationTimingFunction: animationTimingFunction,
  appearance: appearance,
  backdropFilter: backdropFilter,
  backfaceVisibility: backfaceVisibility,
  backgroundAttachment: backgroundAttachment,
  backgroundBlendMode: backgroundBlendMode,
  backgroundClip: backgroundClip,
  backgroundColor: backgroundColor,
  backgroundImage: backgroundImage,
  backgroundOrigin: backgroundOrigin,
  backgroundPosition: backgroundPosition,
  backgroundPositionX: backgroundPositionX,
  backgroundPositionY: backgroundPositionY,
  backgroundRepeat: backgroundRepeat,
  backgroundSize: backgroundSize,
  baselineShift: baselineShift,
  behavior: behavior,
  blockSize: blockSize,
  // borderHorizontal: border,
  // borderVertical: border,
  borderBlockEnd: showError(
    '`borderBlockEnd` is not supported. Please use `borderBottomWidth`, `borderBottomStyle` and `borderBottomColor` instead'
  ),
  borderBlockEndColor: showError(
    '`borderBlockEndColor` is not supported. Please use `borderBottomColor` instead'
  ),
  borderBlockEndStyle: showError(
    '`borderBlockEndStyle` is not supported. Please use `borderBottomStyle` instead'
  ),
  borderBlockEndWidth: showError(
    '`borderBlockEndWidth` is not supported. Please use `borderBottomWidth` instead'
  ),
  borderBlockStart: showError(
    '`borderBlockStart` is not supported. Please use `borderTopWidth`, `borderTopStyle` and `borderTopColor` instead'
  ),
  borderBlockStartColor: showError(
    '`borderBlockStartColor` is not supported. Please use `borderTopColor` instead'
  ),
  borderBlockStartStyle: showError(
    '`borderBlockStartStyle` is not supported. Please use `borderTopStyle` instead'
  ),
  borderBlockStartWidth: showError(
    '`borderBlockStartWidth` is not supported. Please use `borderTopWidth` instead'
  ),
  borderBottomColor: color,
  borderBottomEndRadius: borderBottomRightRadius,
  borderBottomLeftRadius: showError(
    '`borderBottomLeftRadius` is not supported. Please use `borderBottomStartRadius` instead'
  ),
  borderBottomRightRadius: showError(
    `'borderBottomRightRadius' is not supported. Please use 'borderBottomEndRadius' instead`
  ),
  borderBottomStartRadius: borderBottomLeftRadius,
  borderBottomStyle: borderBottomStyle,
  borderBottomWidth: borderBottomWidth,
  borderCollapse: borderCollapse,
  borderColor: borderColor,
  borderEndColor: borderRightColor,
  borderEndStyle: borderRightStyle,
  borderEndWidth: borderRightWidth,
  borderImage: borderImage,
  borderImageOutset: borderImageOutset,
  borderImageRepeat: borderImageRepeat,
  borderImageSlice: borderImageSlice,
  borderImageSource: borderImageSource,
  borderImageWidth: borderImageWidth,
  // borderInlineEnd: borderInlineEnd,
  // borderInlineEndColor: borderInlineEndColor,
  // borderInlineEndStyle: borderInlineEndStyle,
  // borderInlineEndWidth: borderInlineEndWidth,
  // borderInlineStart: borderInlineStart,
  // borderInlineStartColor: borderInlineStartColor,
  // borderInlineStartStyle: borderInlineStartStyle,
  // borderInlineStartWidth: borderInlineStartWidth,
  borderLeftColor: showError(
    '`borderLeftColor` is not supported. Please use `borderStartColor` instead'
  ),
  borderLeftStyle: showError(
    '`borderLeftStyle` is not supported. Please use `borderStartStyle` instead'
  ),
  borderLeftWidth: showError(
    '`borderLeftWidth` is not supported. Please use `borderStartWidth` instead'
  ),
  borderRadius: borderRadius,
  borderRightColor: showError(
    '`borderRightColor` is not supported. Please use `borderEndColor` instead'
  ),
  borderRightStyle: showError(
    '`borderRightStyle` is not supported. Please use `borderEndStyle` instead'
  ),
  borderRightWidth: showError(
    '`borderRightWidth` is not supported. Please use `borderEndWidth` instead'
  ),
  borderSpacing: borderSpacing,
  borderStartColor: borderLeftColor,
  borderStartStyle: borderLeftStyle,
  borderStartWidth: borderLeftWidth,
  borderStyle: borderStyle,
  borderTopColor: color,
  borderTopEndRadius: borderTopRightRadius,
  borderStartStartRadius: showError(
    '`borderStartStartRadius` is not supported. Please use `borderTopStartRadius` instead'
  ),
  borderTopLeftRadius: showError(
    '`borderTopLeftRadius` is not supported. Please use `borderTopStartRadius` instead'
  ),
  borderStartEndRadius: showError(
    '`borderStartEndRadius` is not supported. Please use `borderTopEndRadius` instead'
  ),
  borderTopRightRadius: showError(
    '`borderTopRightRadius` is not supported. Please use `borderTopEndRadius` instead'
  ),
  borderTopStartRadius: borderTopLeftRadius,
  borderTopStyle: borderTopStyle,
  borderTopWidth: borderTopWidth,
  borderWidth: borderWidth,
  bottom: isStringOrNumber,
  boxAlign: boxAlign,
  boxDecorationBreak: boxDecorationBreak,
  boxDirection: boxDirection,
  boxFlex: boxFlex,
  boxFlexGroup: boxFlexGroup,
  boxLines: boxLines,
  boxOrdinalGroup: boxOrdinalGroup,
  boxOrient: boxOrient,
  boxShadow: boxShadow,
  boxSizing: boxSizing,
  boxSuppress: boxSuppress,
  breakAfter: breakAfter,
  breakBefore: breakBefore,
  breakInside: breakInside,
  captionSide: captionSide,
  clear: clear,
  clip: clip,
  clipPath: clipPath,
  clipRule: clipRule,
  color: color,
  columnCount: columnCount,
  columnFill: columnFill,
  columnGap: columnGap,
  columnRule: columnRule,
  columnRuleColor: columnRuleColor,
  columnRuleStyle: columnRuleStyle,
  columnRuleWidth: columnRuleWidth,
  columnSpan: columnSpan,
  columnWidth: columnWidth,
  columns: columns,
  contain: contain,
  content: content,
  counterIncrement: counterIncrement,
  counterReset: counterReset,
  cue: cue,
  cueAfter: cueAfter,
  cueBefore: cueBefore,
  cursor: cursor,
  direction: direction,
  display: display,
  displayInside: displayInside,
  displayList: displayList,
  displayOutside: displayOutside,
  dominantBaseline: dominantBaseline,
  emptyCells: emptyCells,
  end: isStringOrNumber,
  fill: fill,
  fillOpacity: fillOpacity,
  fillRule: fillRule,
  filter: filter,
  flex: showError(
    '`flex` is not supported. Please use `flexGrow`, `flexShrink` and `flexBasis` instead'
  ),
  flexBasis: flexBasis,
  flexDirection: flexDirection,
  flexFlow: flexFlow,
  flexGrow: flexGrow,
  flexShrink: flexShrink,
  flexWrap: flexWrap,
  float: float,
  font: showError(
    '`font` is not supported. Please use `fontSize`, `fontFamily`, `fontStyle` etc. instead'
  ),
  fontFamily: fontFamily,
  fontFeatureSettings: fontFeatureSettings,
  fontKerning: fontKerning,
  fontLanguageOverride: fontLanguageOverride,
  fontSize: fontSize,
  fontSizeAdjust: fontSizeAdjust,
  fontStretch: fontStretch,
  fontStyle: fontStyle,
  fontSynthesis: fontSynthesis,
  fontVariant: fontVariant,
  fontVariantAlternates: fontVariantAlternates,
  fontVariantCaps: fontVariantCaps,
  fontVariantEastAsian: fontVariantEastAsian,
  fontVariantLigatures: fontVariantLigatures,
  fontVariantNumeric: fontVariantNumeric,
  fontVariantPosition: fontVariantPosition,
  fontWeight: fontWeight,
  gap: gap,
  glyphOrientationHorizontal: glyphOrientationHorizontal,
  glyphOrientationVertical: glyphOrientationVertical,

  grid: grid,
  gridArea: gridArea,
  gridAutoColumns: gridAutoColumns,
  gridAutoFlow: gridAutoFlow,
  gridAutoRows: gridAutoRows,
  gridColumn: gridColumn,
  gridColumnEnd: gridColumnEnd,
  gridColumnGap: gridColumnGap,
  gridColumnStart: gridColumnStart,

  gridRow: gridRow,
  gridRowEnd: gridRowEnd,
  gridGap: gridGap,
  gridRowGap: gridRowGap,

  gridRowStart: gridRowStart,
  gridTemplate: gridTemplate,
  gridTemplateAreas: gridTemplateAreas,
  gridTemplateColumns: gridTemplateColumns,
  gridTemplateRows: gridTemplateRows,

  height: isStringOrNumber,
  hyphens: hyphens,
  imageOrientation: imageOrientation,
  imageRendering: imageRendering,
  imageResolution: imageResolution,
  imeMode: imeMode,
  initialLetter: initialLetter,
  initialLetterAlign: initialLetterAlign,
  inlineSize: inlineSize,
  isolation: isolation,
  justifyContent: justifyContent,
  justifyItems: justifyItems,
  justifySelf: justifySelf,
  kerning: kerning,
  left: isStringOrNumber,
  letterSpacing: letterSpacing,
  lineBreak: lineBreak,
  lineHeight: lineHeight,
  listStyle: listStyle,
  listStyleImage: listStyleImage,
  listStylePosition: listStylePosition,
  listStyleType: listStyleType,
  margin: margin,
  marginBlockEnd: showError(
    '`marginBlockEnd` is not supported. Please use `marginBottom` instead'
  ),
  marginBlockStart: showError(
    '`marginBlockStart` is not supported. Please use `marginTop` instead'
  ),
  marginBottom: marginBottom,
  marginEnd: marginRight,
  marginHorizontal: marginLeft,
  // marginInlineEnd: marginInlineEnd,
  // marginInlineStart: marginInlineStart,
  marginLeft: marginLeft,
  marginRight: marginRight,
  marginStart: marginLeft,
  marginTop: marginTop,
  marginVertical: marginTop,

  marker: marker,
  markerEnd: markerEnd,
  markerMid: markerMid,
  markerOffset: markerOffset,
  markerStart: markerStart,
  mask: mask,
  maskClip: maskClip,
  maskComposite: maskComposite,
  maskImage: maskImage,
  maskMode: maskMode,
  maskOrigin: maskOrigin,
  maskPosition: maskPosition,
  maskRepeat: maskRepeat,
  maskSize: maskSize,
  maskType: maskType,
  maxBlockSize: maxBlockSize,
  maxHeight: maxHeight,
  maxInlineSize: maxInlineSize,
  maxWidth: maxWidth,
  minBlockSize: minBlockSize,
  minHeight: minHeight,
  minInlineSize: minInlineSize,
  minWidth: minWidth,
  mixBlendMode: mixBlendMode,
  motion: motion,
  motionOffset: motionOffset,
  motionPath: motionPath,
  motionRotation: motionRotation,
  objectFit: objectFit,
  objectPosition: objectPosition,
  offsetBlockEnd: offsetBlockEnd,
  offsetBlockStart: offsetBlockStart,
  offsetInlineEnd: offsetInlineEnd,
  offsetInlineStart: offsetInlineStart,
  opacity: opacity,
  order: order,
  orphans: orphans,
  outline: outline,
  outlineColor: showError(
    `'outlineColor' is not supported. Please use 'outline' instead`
  ),
  outlineOffset: showError(
    `'outlineOffset' is not supported. Please use 'outline' instead`
  ),
  outlineStyle: showError(
    `'outlineStyle' is not supported. Please use 'outline' instead`
  ),
  outlineWidth: showError(
    `'outlineWidth' is not supported. Please use 'outline' instead`
  ),
  overflow: overflow,
  overflowAnchor: overflowAnchor,
  overflowClipBox: overflowClipBox,
  overflowWrap: overflowWrap,
  overflowX: overflowX,
  overflowY: overflowY,
  overscrollBehavior: overscrollBehavior,
  overscrollBehaviorX: overscrollBehaviorX,
  overscrollBehaviorY: overscrollBehaviorY,
  padding: padding,
  // paddingBlockEnd: paddingBlockEnd,
  // paddingBlockStart: paddingBlockStart,
  paddingBottom: paddingBottom,
  paddingEnd: paddingRight,
  paddingHorizontal: paddingLeft,
  paddingLeft: paddingLeft,
  paddingRight: paddingRight,
  paddingStart: paddingLeft,
  paddingTop: paddingTop,
  paddingVertical: paddingTop,

  pageBreakAfter: pageBreakAfter,
  pageBreakBefore: pageBreakBefore,
  pageBreakInside: pageBreakInside,
  pause: pause,
  pauseAfter: pauseAfter,
  pauseBefore: pauseBefore,
  perspective: perspective,
  perspectiveOrigin: perspectiveOrigin,
  pointerEvents: pointerEvents,
  position: position,
  quotes: quotes,
  resize: resize,
  rest: rest,
  restAfter: restAfter,
  restBefore: restBefore,
  right: isStringOrNumber,
  rowGap: rowGap,
  rubyAlign: rubyAlign,
  rubyMerge: rubyMerge,
  rubyPosition: rubyPosition,
  scrollBehavior: scrollBehavior,
  scrollSnapPaddingBottom: scrollSnapPaddingBottom,
  scrollSnapPaddingTop: scrollSnapPaddingTop,
  scrollSnapAlign: scrollSnapAlign,
  scrollSnapType: scrollSnapType,
  shapeImageThreshold: shapeImageThreshold,
  shapeMargin: shapeMargin,
  shapeOutside: shapeOutside,
  shapeRendering: shapeRendering,
  speak: speak,
  speakAs: speakAs,
  src: src,
  start: isStringOrNumber,
  stroke: stroke,
  strokeDasharray: strokeDasharray,
  strokeDashoffset: strokeDashoffset,
  strokeLinecap: strokeLinecap,
  strokeLinejoin: strokeLinejoin,
  strokeMiterlimit: strokeMiterlimit,
  strokeOpacity: strokeOpacity,
  strokeWidth: strokeWidth,
  tabSize: tabSize,
  tableLayout: tableLayout,
  textAlign: textAlign,
  textAlignLast: textAlignLast,
  textAnchor: textAnchor,
  textCombineUpright: textCombineUpright,
  textDecoration: textDecoration,

  textDecorationColor: showError(
    '`textDecorationColor` is not supported. Please use `textDecoration` instead.'
  ),
  textDecorationLine: showError(
    '`textDecorationLine` is not supported. Please use `textDecoration` instead.'
  ),
  textDecorationSkip: showError(
    '`textDecorationSkip` is not supported. Please use `textDecoration` instead.'
  ),
  textDecorationStyle: showError(
    '`textDecorationStyle` is not supported. Please use `textDecoration` instead.'
  ),

  textEmphasis: textEmphasis,
  textEmphasisColor: textEmphasisColor,
  textEmphasisPosition: textEmphasisPosition,
  textEmphasisStyle: textEmphasisStyle,
  textIndent: textIndent,
  textOrientation: textOrientation,
  textOverflow: textOverflow,
  textRendering: textRendering,
  textShadow: textShadow,
  textSizeAdjust: textSizeAdjust,
  textTransform: textTransform,
  textUnderlinePosition: textUnderlinePosition,
  top: top,
  touchAction: touchAction,
  transform: transform,
  transformBox: transformBox,
  transformOrigin: transformOrigin,
  transformStyle: transformStyle,
  transitionDelay: transitionDelay,
  transitionDuration: transitionDuration,
  transitionProperty: transitionProperty,
  transitionTimingFunction: transitionTimingFunction,
  unicodeBidi: unicodeBidi,
  unicodeRange: unicodeRange,
  userSelect: userSelect,
  verticalAlign: verticalAlign,
  visibility: visibility,
  voiceBalance: voiceBalance,
  voiceDuration: voiceDuration,
  voiceFamily: voiceFamily,
  voicePitch: voicePitch,
  voiceRange: voiceRange,
  voiceRate: voiceRate,
  voiceStress: voiceStress,
  voiceVolume: voiceVolume,
  whiteSpace: whiteSpace,
  widows: widows,
  width: width,
  willChange: willChange,
  wordBreak: wordBreak,
  wordSpacing: wordSpacing,
  wordWrap: wordWrap,
  writingMode: writingMode,
  zIndex: zIndex,
};
const CSSPropertyKeys = Object.keys(CSSProperties);
for (const key of CSSPropertyKeys) {
  CSSProperties[key] = makeUnionRule(CSSProperties[key], all);
}

const CSSPropertyReplacements: { [key: string]: RuleCheck | undefined } = {
  border: border(),
  borderTop: border('Top'),
  borderEnd: border('End'),
  borderRight: border('Right'),
  borderBottom: border('Bottom'),
  borderStart: border('Start'),
  borderLeft: border('Left'),
};

const keyForNestedObject = makeUnionRule(
  makeLiteralRule(':first-child'),
  makeLiteralRule(':last-child'),
  makeLiteralRule(':only-child'),
  makeLiteralRule(':nth-child'),
  makeLiteralRule(':nth-of-type'),
  makeLiteralRule(':hover'),
  makeLiteralRule(':focus'),
  makeLiteralRule(':focus-visible'),
  makeLiteralRule(':active'),
  makeLiteralRule(':visited'),
  makeLiteralRule(':disabled'),
  makeLiteralRule('::placeholder'),
  makeLiteralRule('::thumb'),
  // For styling input[type=number]
  makeLiteralRule('::-webkit-inner-spin-button'),
  makeLiteralRule('::-webkit-outer-spin-button'),
  // For styling input[type=search]
  makeLiteralRule('::-webkit-search-decoration'),
  makeLiteralRule('::-webkit-search-cancel-button'),
  makeLiteralRule('::-webkit-search-results-button'),
  makeLiteralRule('::-webkit-search-results-decoration'),
  makeRegExRule(/^@media/, 'a media query'),
  makeRegExRule(/^@supports/, 'a supports query')
);

// Maybe add this later.
// const pseudoAllowlist = new Set([]);

const stylexValidStyles = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
  },
  create(context: Rule.RuleContext) {
    const variables = new Map<string, ESTree.Expression>();

    // TODO: Make this configurable
    const importsToLookFor = ['stylex', '@stylexjs/stylex'];
    const styleXDefaultImports = new Set<string>();
    const styleXCreateImports = new Set<string>();

    function isStylexCallee(node: ESTree.Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          styleXDefaultImports.has(node.object.name) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'create') ||
        (node.type === 'Identifier' && styleXCreateImports.has(node.name))
      );
    }

    function isStylexDeclaration(node: ESTree.Node) {
      return (
        node &&
        node.type === 'CallExpression' &&
        isStylexCallee(node.callee) &&
        node.arguments.length === 1 &&
        node.arguments[0].type === 'ObjectExpression'
      );
    }

    function checkStyleProperty(style: ESTree.Node, level = 0): void {
      // currently ignoring preset spreads.
      if (style.type === 'Property') {
        if (style.value.type === 'ObjectExpression') {
          // TODO: Remove this soon
          // But we want to make sure that the same "condition" isn't repeated
          if (level > 0) {
            return context.report({
              node: style.value as ESTree.Node,
              loc: style.value.loc,
              message: 'You cannot nest styles more than one level deep',
            } as Rule.ReportDescriptor);
          }
          if (style.key.type !== 'Literal') {
            return context.report({
              node: style.key as ESTree.Expression,
              loc: style.key.loc,
              message: 'Keys must be strings',
            } as Rule.ReportDescriptor);
          }
          const ruleCheck = keyForNestedObject(style.key, new Map());
          if (ruleCheck !== undefined) {
            return context.report({
              node: style.value,
              loc: style.value.loc,
              message:
                'Nested styles can only be used for the pseudo selectors in the stylex allowlist and for @media queries',
            } as Rule.ReportDescriptor);
          }
          return style.value.properties.forEach((prop) =>
            checkStyleProperty(prop, level + 1)
          );
        }
        if (style.computed && style.key.type !== 'Literal') {
          return context.report({
            node: style.key,
            loc: style.key.loc,
            message: 'Computed keys are not allowed within stylex.',
          } as Rule.ReportDescriptor);
        }
        if (style.key.type !== 'Literal' && style.key.type !== 'Identifier') {
          return context.report({
            node: style.key,
            loc: style.key.loc,
            message:
              'All keys in a stylex object must be static literal values.',
          } as Rule.ReportDescriptor);
        }
        const key =
          style.key.type === 'Identifier' ? style.key.name : style.key.value;
        if (typeof key !== 'string') {
          return context.report({
            node: style.key,
            loc: style.key.loc,
            message:
              'All keys in a stylex object must be static literal string values.',
          } as Rule.ReportDescriptor);
        }
        if (CSSPropertyReplacements[key] != null) {
          const propCheck = CSSPropertyReplacements[key] as RuleCheck;
          const check = propCheck(
            style.value as ESTree.Expression,
            variables,
            style
          );
          if (check != null) {
            const { message, suggest } = check;
            const diagnostic = {
              node: style,
              loc: style.loc,
              message,
              suggest: suggest != null ? [suggest] : undefined,
            } as Rule.ReportDescriptor;
            return context.report(diagnostic);
          }
        }
        const ruleChecker = CSSProperties[key];
        if (ruleChecker == null) {
          const closestKey = CSSPropertyKeys.find((cssProp) => {
            const distance = getDistance(key, cssProp, 2);
            return distance <= 2;
          });
          return context.report({
            node: style.key,
            loc: style.key.loc,
            message: 'This is not a key that is allowed by stylex',
            suggest:
              closestKey != null
                ? [
                    {
                      desc: `Did you mean "${closestKey}"?`,
                      fix: (fixer) => {
                        if (style.key.type === 'Identifier') {
                          return fixer.replaceText(style.key, closestKey);
                        } else if (style.key.type === 'Literal') {
                          const raw = style.key.raw;
                          if (raw != null) {
                            const quoteType = raw.substr(0, 1);
                            return fixer.replaceText(
                              style.key as ESTree.SimpleLiteral,
                              `${quoteType}${closestKey}${quoteType}`
                            );
                          }
                        }
                        return null;
                      },
                    },
                  ]
                : undefined,
          } as Rule.ReportDescriptor);
        }
        if (typeof ruleChecker !== 'function') {
          throw new TypeError(`CSSProperties[${key}] is not a function`);
        }
        const check = ruleChecker(
          style.value as ESTree.Expression,
          variables,
          style
        );
        if (check != null) {
          const { message, suggest } = check;
          return context.report({
            node: style.value,
            loc: style.value.loc,
            message: `${key} value must be one of:\n${message}${
              key === 'lineHeight'
                ? '\nBe careful when fixing: lineHeight: 10px is not the same as lineHeight: 10'
                : ''
            }`,
            suggest: suggest != null ? [suggest] : undefined,
          } as Rule.ReportDescriptor);
        }
      }
    }

    return {
      Program(node: ESTree.Program) {
        // Keep track of all the top-level local variable declarations
        // This is because stylex allows you to use local constants in your styles
        const vars = node.body
          .reduce(
            (
              collection: ESTree.VariableDeclaration[],
              node:
                | ESTree.Statement
                | ESTree.ModuleDeclaration
                | ESTree.Directive
            ) => {
              if (node.type === 'VariableDeclaration') {
                collection.push(node);
              }
              return collection;
            },
            []
          )
          .map(
            (constDecl: ESTree.VariableDeclaration) => constDecl.declarations
          )
          .reduce((arr, curr) => arr.concat(curr), []);

        const [requires, others] = vars.reduce(
          (acc, decl) => {
            if (
              decl.init != null &&
              decl.init.type === 'CallExpression' &&
              decl.init.callee.type === 'Identifier' &&
              decl.init.callee.name === 'require'
            ) {
              acc[0].push(decl);
            } else {
              acc[1].push(decl);
            }
            return acc;
          },
          [[] as ESTree.VariableDeclarator[], [] as ESTree.VariableDeclarator[]]
        );

        requires.forEach((decl: ESTree.VariableDeclarator) => {
          // detect requires of "stylex" and "@stylexjs/stylex"
          if (
            decl.init != null &&
            decl.init.type === 'CallExpression' &&
            decl.init.callee.type === 'Identifier' &&
            decl.init.callee.name === 'require' &&
            decl.init.arguments.length === 1 &&
            decl.init.arguments[0].type === 'Literal' &&
            importsToLookFor.includes(decl.init.arguments[0].value as string)
          ) {
            if (decl.id.type === 'Identifier') {
              styleXDefaultImports.add(decl.id.name);
            }
            if (decl.id.type === 'ObjectPattern') {
              decl.id.properties.forEach((prop) => {
                if (
                  prop.type === 'Property' &&
                  prop.key.type === 'Identifier' &&
                  prop.key.name === 'create' &&
                  !prop.computed &&
                  prop.value.type === 'Identifier'
                ) {
                  styleXCreateImports.add(prop.value.name);
                }
              });
            }
          }
        });

        others
          .filter((decl) => decl.id.type === 'Identifier')
          .forEach((decl: ESTree.VariableDeclarator) => {
            const id = decl.id as ESTree.Identifier;
            const init = decl.init;
            if (id != null && init != null) {
              variables.set(id.name, init);
            }
          });
      },
      ImportDeclaration(node: ESTree.ImportDeclaration) {
        if (
          node.source.type !== 'Literal' ||
          typeof node.source.value !== 'string'
        ) {
          return;
        }
        const sourceValue = node.source.value;
        if (!importsToLookFor.includes(sourceValue)) {
          return;
        }

        node.specifiers.forEach((specifier) => {
          if (
            specifier.type === 'ImportDefaultSpecifier' ||
            specifier.type === 'ImportNamespaceSpecifier'
          ) {
            styleXDefaultImports.add(specifier.local.name);
          }
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'create'
          ) {
            styleXCreateImports.add(specifier.local.name);
          }
        });
      },
      CallExpression(node: ESTree.CallExpression & Rule.NodeParentExtension) {
        if (!isStylexDeclaration(node)) {
          return;
        }

        const namespaces = node.arguments[0];
        if (namespaces.type !== 'ObjectExpression') {
          return context.report({
            node: namespaces,
            loc: namespaces.loc,
            message: 'Styles must be represented as javascript objects',
          } as Rule.ReportDescriptor);
        }

        namespaces.properties.forEach((property) => {
          if (property.type !== 'Property') {
            return context.report({
              node: property,
              loc: property.loc,
              message: 'Styles cannot be spread objects',
            } as Rule.ReportDescriptor);
          }

          if (property.value.type !== 'ObjectExpression') {
            return context.report({
              node: property.value,
              loc: property.value.loc,
              message: 'Styles must be represented as javascript objects',
            } as Rule.ReportDescriptor);
          }

          const styles = property.value;
          styles.properties.forEach((prop) => checkStyleProperty(prop));
        });
      },
      'Program:exit'() {
        variables.clear();
      },
    };
  },
};
export default stylexValidStyles;
/* eslint-enable object-shorthand */
