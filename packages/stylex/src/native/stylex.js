/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  CSSCustomPropertyValue,
  isCustomPropertyValue,
} from './CSSCustomPropertyValue';
import { CSSLengthUnitValue } from './CSSLengthUnitValue';
import { CSSMediaQuery } from './CSSMediaQuery';
import { errorMsg, warnMsg } from './errorMsg';
import { flattenStyle } from './flattenStyle';
import { parseShadow } from './parseShadow';
import { parseTimeValue } from './parseTimeValue';

const stylePropertyAllowlistSet = new Set<string>([
  'alignContent',
  'alignItems',
  'alignSelf',
  'animationDelay',
  'animationDuration',
  'aspectRatio',
  'backfaceVisibility',
  'backgroundColor',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderColor',
  'borderLeftColor',
  'borderLeftStyle',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightStyle',
  'borderRightWidth',
  'borderStyle',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStyle',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'color',
  'direction',
  'display',
  'end',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'fontVariant',
  'gap',
  'gapColumn',
  'gapRow',
  'height',
  // 'includeFontPadding', Android Only
  'justifyContent',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'opacity',
  'overflow',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'pointerEvents',
  'position',
  'resizeMode',
  'right',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'shadowWidth',
  'start',
  'textAlign',
  'textDecorationLine',
  'textDecorationColor', // iOS Only
  'textDecorationStyle', // iOS Only
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'tintColor',
  'transform',
  'transitionDelay',
  'transitionDuration',
  'top',
  'userSelect',
  'verticalAlign', // Android Only
  'width',
  // 'writingDirection', // iOS Only
  'zIndex',

  // DESKTOP: no built-in support for logical properties.
  // Comment out all the logical properties so they can be converted to fallbacks
  // and legacy non-standard properties.
  //'blockSize',
  //'inlineSize',
  //'maxBlockSize',
  //'minBlockSize',
  //'maxInlineSize',
  //'minInlineSize',
  //'borderBlockColor',
  //'borderBlockStyle',
  //'borderBlockWidth',
  //'borderBlockEndColor',
  //'borderBlockEndStyle',
  //'borderBlockEndWidth',
  //'borderBlockStartColor',
  //'borderBlockStartStyle',
  //'borderBlockStartWidth',
  //'borderInlineColor',
  //'borderInlineStyle',
  //'borderInlineWidth',
  //'borderInlineEndColor',
  //'borderInlineEndStyle',
  //'borderInlineEndWidth',
  //'borderInlineStartColor',
  //'borderInlineStartStyle',
  //'borderInlineStartWidth',
  //'borderEndEndRadius',
  //'borderEndStartRadius',
  //'borderStartEndRadius',
  //'borderStartStartRadius',
  //'inset',
  //'insetBlock',
  //'insetBlockEnd',
  //'insetBlockStart',
  //'insetInline',
  //'insetInlineEnd',
  //'insetInlineStart',
  //'marginBlock',
  //'marginBlockEnd',
  //'marginBlockStart',
  //'marginInline',
  //'marginInlineEnd',
  //'marginInlineStart',
  //'paddingBlock',
  //'paddingBlockEnd',
  //'paddingBlockStart',
  //'paddingInline',
  //'paddingInlineEnd',
  //'paddingInlineStart',
]);

function isReactNativeStyleProp(propName: string): boolean {
  return stylePropertyAllowlistSet.has(propName) || propName.startsWith('--');
}

function isReactNativeStyleValue(propValue: mixed): boolean {
  if (typeof propValue === 'string') {
    // RN doesn't have an inherit keyword
    if (propValue === 'inherit') {
      return false;
    }
    // RN doesn't have an inherit keyword
    if (propValue === 'initial') {
      return false;
    }
    //if (propValue.endsWith('em')) {
    //  return false;
    //}
    //if (propValue.endsWith('rem')) {
    //  return false;
    //}
    // RN on android doesn't like explicitly specified px units
    if (propValue.endsWith('px')) {
      return false;
    }
    // RN doesn't support calc functions
    if (propValue.includes('calc(')) {
      return false;
    }
  }

  return true;
}

function preprocessPropertyValue(propValue: mixed): mixed {
  if (typeof propValue === 'string') {
    if (isCustomPropertyValue(propValue)) {
      return new CSSCustomPropertyValue(propValue);
    }

    const maybeViewportValue = CSSLengthUnitValue.parse(propValue);
    if (maybeViewportValue != null) {
      return maybeViewportValue;
    }
  }

  return propValue;
}

function preprocessCreate<S: { [string]: mixed }>(style: S): S {
  const processedStyle: S = ({}: $FlowFixMe);
  for (const propName in style) {
    const styleValue = style[propName];

    if (
      CSSMediaQuery.isMediaQueryString(propName) &&
      typeof styleValue === 'object' &&
      styleValue != null
    ) {
      // have to spread styleValue into a copied object to appease flow
      const processsedSubStyle = preprocessCreate({ ...styleValue });
      processedStyle[propName] = new CSSMediaQuery(
        propName,
        processsedSubStyle,
      );
      continue;
    }

    // React Native only supports non-standard box-shadow styles
    if (propName === 'boxShadow' && typeof styleValue === 'string') {
      const parsedShadow = parseShadow(styleValue);
      if (parsedShadow.length > 1) {
        warnMsg(
          'Multiple "boxShadow" values are not supported in React Native.',
        );
      }
      const { inset, offsetX, offsetY, blurRadius, color } = parsedShadow[0];
      // TODO: parse alpha color inputs => alpha + color
      // errorMsg('"boxShadow" opacity is not implemented in React Native.');
      if (inset) {
        warnMsg(
          '"boxShadow" value of "inset" is not supported in React Native.',
        );
      }
      processedStyle.shadowColor = color;
      processedStyle.shadowOffset = { height: offsetY, width: offsetX };
      processedStyle.shadowOpacity = 1;
      processedStyle.shadowRadius = blurRadius;
    }
    // React Native only supports non-standard text-shadow styles
    else if (propName === 'textShadow' && typeof styleValue === 'string') {
      const parsedShadow = parseShadow(styleValue);
      if (parsedShadow.length > 1) {
        warnMsg(
          'Multiple "textShadow" values are not supported in React Native.',
        );
      }
      const { offsetX, offsetY, blurRadius, color } = parsedShadow[0];
      processedStyle.textShadowColor = color;
      processedStyle.textShadowOffset = { height: offsetY, width: offsetX };
      processedStyle.textShadowRadius = blurRadius;
    } else {
      processedStyle[propName] = styleValue;
    }
  }

  // Process values that need to be resolved during render
  for (const prop in processedStyle) {
    const processedStyleValue = preprocessPropertyValue(processedStyle[prop]);
    processedStyle[prop] = processedStyleValue;
  }

  return processedStyle;
}

/**
 * The create method shim should do initial transforms like
 * renaming/expanding/validating properties, essentially all the steps
 * which can be done at initialization-time (could potentially be done at
 * compile-time in the future).
 */
export function create<S: { [string]: { ... } }>(styles: S): {
  [string]: { ... },
} {
  const result: { [string]: { ... } } = {};
  for (const styleName in styles) {
    result[styleName] = preprocessCreate(styles[styleName]);
  }
  return result;
}

export const firstThatWorks = <T: string | number>(
  ...values: $ReadOnlyArray<T>
): T => {
  return values[0];
};

export function keyframes(): void {
  errorMsg('keyframes are not supported in React Native.');
}

const timeValuedProperties = [
  'animationDelay',
  'animationDuration',
  'transitionDelay',
  'transitionDuration',
];

/**
 * The spread method shim
 */
type SpreadOptions = {|
  customProperties: {},
  inheritedFontSize: ?number,
  fontScale: number | void,
  passthroughProperties: Array<string>,
  viewportHeight: number,
  viewportWidth: number,
  writingDirection: 'ltr' | 'rtl',
|};

export function spread(
  style: ?{ [key: string]: mixed },
  {
    customProperties = {},
    inheritedFontSize,
    fontScale = 1,
    passthroughProperties = [],
    viewportHeight,
    viewportWidth,
    writingDirection,
  }: SpreadOptions,
): { [string]: { ... } } {
  /* eslint-disable prefer-const */
  let { lineClamp, ...flatStyle }: { [key: string]: mixed } =
    flattenStyle(style);
  let prevStyle = { ...flatStyle };
  /* eslint-enable prefer-const */

  const nativeProps = {};

  for (const styleProp in flatStyle) {
    let styleValue = flatStyle[styleProp];

    // resolve media queries
    if (styleValue instanceof CSSMediaQuery) {
      const maybeExistingMediaQuery = flatStyle[styleProp];
      if (maybeExistingMediaQuery instanceof CSSMediaQuery) {
        const s = flattenStyle([
          maybeExistingMediaQuery.matchedStyle,
          styleValue.matchedStyle,
        ]);
        if (s != null) {
          maybeExistingMediaQuery.matchedStyle = s;
        }
        continue;
      }
    }
    // resolve custom property references
    if (styleValue instanceof CSSCustomPropertyValue) {
      const resolvedValue = customProperties[styleValue.name];
      if (resolvedValue == null) {
        errorMsg(`Unrecognized custom property "--${styleValue.name}"`);
        delete flatStyle[styleProp];
        continue;
      }
      styleValue = resolvedValue;
    }
    // resolve viewport units
    if (styleValue instanceof CSSLengthUnitValue) {
      const resolvedValue = styleValue.resolvePixelValue(
        viewportWidth,
        viewportHeight,
        fontScale,
        inheritedFontSize,
      );
      styleValue = resolvedValue;
    }

    // Filter out any unexpected style property names so RN doesn't crash but give
    // the developer a warning to let them know that there's a new prop we should either
    // explicitly ignore or process in some way.
    // NOTE: Any kind of prop name transformations should happen before this check.
    if (
      !isReactNativeStyleProp(styleProp) &&
      passthroughProperties.indexOf(styleProp) === -1
    ) {
      // block/inlineSize
      if (styleProp === 'blockSize') {
        flatStyle.height = flatStyle.height ?? styleValue;
      } else if (styleProp === 'inlineSize') {
        flatStyle.width = flatStyle.width ?? styleValue;
      } else if (styleProp === 'maxBlockSize') {
        flatStyle.maxHeight = flatStyle.maxHeight ?? styleValue;
      } else if (styleProp === 'minBlockSize') {
        flatStyle.minHeight = flatStyle.minHeight ?? styleValue;
      } else if (styleProp === 'maxInlineSize') {
        flatStyle.maxWidth = flatStyle.maxWidth ?? styleValue;
      } else if (styleProp === 'minInlineSize') {
        flatStyle.minWidth = flatStyle.minWidth ?? styleValue;
      }
      // borderBlock
      else if (styleProp === 'borderBlockColor') {
        flatStyle.borderTopColor = flatStyle.borderTopColor ?? styleValue;
        flatStyle.borderBottomColor = flatStyle.borderBottomColor ?? styleValue;
      } else if (styleProp === 'borderBlockStyle') {
        flatStyle.borderTopStyle = flatStyle.borderTopStyle ?? styleValue;
        flatStyle.borderBottomStyle = flatStyle.borderBottomStyle ?? styleValue;
      } else if (styleProp === 'borderBlockWidth') {
        flatStyle.borderTopWidth = flatStyle.borderTopWidth ?? styleValue;
        flatStyle.borderBottomWidth = flatStyle.borderBottomWidth ?? styleValue;
      } else if (styleProp === 'borderBlockEndColor') {
        flatStyle.borderBottomColor = prevStyle.borderBottomColor ?? styleValue;
      } else if (styleProp === 'borderBlockEndStyle') {
        flatStyle.borderBottomStyle = prevStyle.borderBottomStyle ?? styleValue;
      } else if (styleProp === 'borderBlockEndWidth') {
        flatStyle.borderBottomWidth = prevStyle.borderBottomWidth ?? styleValue;
      } else if (styleProp === 'borderBlockStartColor') {
        flatStyle.borderTopColor = prevStyle.borderTopColor ?? styleValue;
      } else if (styleProp === 'borderBlockStartStyle') {
        flatStyle.borderTopStyle = prevStyle.borderTopStyle ?? styleValue;
      } else if (styleProp === 'borderBlockStartWidth') {
        flatStyle.borderTopWidth = prevStyle.borderTopWidth ?? styleValue;
      }
      // borderInline
      else if (styleProp === 'borderInlineColor') {
        flatStyle.borderStartColor = flatStyle.borderStartColor ?? styleValue;
        flatStyle.borderEndColor = flatStyle.borderEndColor ?? styleValue;
      } else if (styleProp === 'borderInlineStyle') {
        flatStyle.borderStartStyle = flatStyle.borderStartStyle ?? styleValue;
        flatStyle.borderEndStyle = flatStyle.borderEndStyle ?? styleValue;
      } else if (styleProp === 'borderInlineWidth') {
        flatStyle.borderStartWidth = flatStyle.borderStartWidth ?? styleValue;
        flatStyle.borderEndWidth = flatStyle.borderEndWidth ?? styleValue;
      } else if (styleProp === 'borderInlineEndColor') {
        flatStyle.borderEndColor = styleValue;
      } else if (styleProp === 'borderInlineEndStyle') {
        flatStyle.borderEndStyle = styleValue;
      } else if (styleProp === 'borderInlineEndWidth') {
        flatStyle.borderEndWidth = styleValue;
      } else if (styleProp === 'borderInlineStartColor') {
        flatStyle.borderStartColor = styleValue;
      } else if (styleProp === 'borderInlineStartStyle') {
        flatStyle.borderStartStyle = styleValue;
      } else if (styleProp === 'borderInlineStartWidth') {
        flatStyle.borderStartWidth = styleValue;
      }
      // borderRadius
      else if (styleProp === 'borderStartStartRadius') {
        flatStyle.borderTopStartRadius = styleValue;
      } else if (styleProp === 'borderEndStartRadius') {
        flatStyle.borderBottomStartRadius = styleValue;
      } else if (styleProp === 'borderStartEndRadius') {
        flatStyle.borderTopEndRadius = styleValue;
      } else if (styleProp === 'borderEndEndRadius') {
        flatStyle.borderBottomEndRadius = styleValue;
      }
      // inset
      else if (styleProp === 'inset') {
        flatStyle.top = flatStyle.top ?? styleValue;
        flatStyle.start = flatStyle.start ?? styleValue;
        flatStyle.end = flatStyle.end ?? styleValue;
        flatStyle.bottom = flatStyle.bottom ?? styleValue;
      } else if (styleProp === 'insetBlock') {
        flatStyle.top = flatStyle.top ?? styleValue;
        flatStyle.bottom = flatStyle.bottom ?? styleValue;
      } else if (styleProp === 'insetBlockEnd') {
        flatStyle.bottom = prevStyle.bottom ?? styleValue;
      } else if (styleProp === 'insetBlockStart') {
        flatStyle.top = prevStyle.top ?? styleValue;
      } else if (styleProp === 'insetInline') {
        flatStyle.end = flatStyle.end ?? styleValue;
        flatStyle.start = flatStyle.start ?? styleValue;
      } else if (styleProp === 'insetInlineEnd') {
        flatStyle.end = prevStyle.end ?? styleValue;
      } else if (styleProp === 'insetInlineStart') {
        flatStyle.start = prevStyle.start ?? styleValue;
      }
      // marginBlock
      else if (styleProp === 'marginBlock') {
        flatStyle.marginVertical = styleValue;
      } else if (styleProp === 'marginBlockStart') {
        flatStyle.marginTop = flatStyle.marginTop ?? styleValue;
      } else if (styleProp === 'marginBlockEnd') {
        flatStyle.marginBottom = flatStyle.marginBottom ?? styleValue;
      }
      // marginInline
      else if (styleProp === 'marginInline') {
        flatStyle.marginHorizontal = styleValue;
      } else if (styleProp === 'marginInlineStart') {
        flatStyle.marginStart = styleValue;
      } else if (styleProp === 'marginInlineEnd') {
        flatStyle.marginEnd = styleValue;
      }
      // paddingBlock
      else if (styleProp === 'paddingBlock') {
        flatStyle.paddingVertical = styleValue;
      } else if (styleProp === 'paddingBlockStart') {
        flatStyle.paddingTop = flatStyle.paddingTop ?? styleValue;
      } else if (styleProp === 'paddingBlockEnd') {
        flatStyle.paddingBottom = flatStyle.paddingBottom ?? styleValue;
      }
      // paddingInline
      else if (styleProp === 'paddingInline') {
        flatStyle.paddingHorizontal = styleValue;
      } else if (styleProp === 'paddingInlineStart') {
        flatStyle.paddingStart = styleValue;
      } else if (styleProp === 'paddingInlineEnd') {
        flatStyle.paddingEnd = styleValue;
      }
      // everything else
      else {
        warnMsg(`Ignoring unsupported style property "${styleProp}"`);
      }

      delete flatStyle[styleProp];
      continue;
    }

    // Similar filter to the prop name one above but instead operates on the property's
    // value. Similarly, any sort of prop value transformations should happen before this
    // filter.
    // We check this at resolve time to ensure the render-time styles are safe.
    if (!isReactNativeStyleValue(styleValue)) {
      warnMsg(
        `Ignoring unsupported style value "${String(
          styleValue,
        )}" for property "${styleProp}"`,
      );
      delete flatStyle[styleProp];
      continue;
    }

    flatStyle[styleProp] = styleValue;
  }

  if (flatStyle != null && Object.keys(flatStyle).length > 0) {
    flatStyle = CSSMediaQuery.resolveMediaQueries(flatStyle, {
      width: viewportWidth,
      height: viewportHeight,
      direction: writingDirection,
    });

    // polyfill borderStyle:"none" behavior
    if (flatStyle.borderStyle === 'none') {
      flatStyle.borderWidth = 0;
      delete flatStyle.borderStyle;
    }

    // polyfill numeric fontWeight (for desktop)
    if (typeof flatStyle.fontWeight === 'number') {
      flatStyle.fontWeight = flatStyle.fontWeight.toString();
    }

    // workaround unsupported position values
    const positionValue = flatStyle.position;
    if (positionValue === 'fixed') {
      flatStyle.position = 'absolute';
      warnMsg(
        '"position" value of "fixed" is not supported in React Native. Falling back to "absolute".',
      );
    } else if (positionValue === 'static') {
      flatStyle.position = 'relative';
      warnMsg(
        '"position" value of "static" is not supported in React Native. Falling back to "relative".',
      );
    } else if (positionValue === 'sticky') {
      flatStyle.position = 'relative';
      warnMsg(
        '"position" value of "sticky" is not supported in React Native. Falling back to "relative".',
      );
    }

    for (const timeValuedProperty of timeValuedProperties) {
      if (typeof flatStyle[timeValuedProperty] === 'string') {
        flatStyle[timeValuedProperty] = parseTimeValue(
          flatStyle[timeValuedProperty],
        );
      }
    }

    // $FlowFixMe
    nativeProps.style = flatStyle;
  }

  if (lineClamp != null) {
    // $FlowFixMe
    nativeProps.numberOfLines = lineClamp;
  }

  return nativeProps;
}

export type IStyleX = {
  create: typeof create,
  firstThatWorks: typeof firstThatWorks,
  keyframes: typeof keyframes,
  spread: typeof spread,
};

export const stylex: IStyleX = { create, firstThatWorks, keyframes, spread };

export default (stylex: IStyleX);
