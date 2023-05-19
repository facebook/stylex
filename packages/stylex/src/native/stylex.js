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
import { errorMsg } from './errorMsg';
import { flattenStyle } from './flattenStyle';
import { parseShadow } from './parseShadow';

const stylePropertyAllowlistSet = new Set<string>([
  'alignContent',
  'alignItems',
  'alignSelf',
  'aspectRatio',
  'backfaceVisibility',
  'backgroundColor',
  'borderBlockColor',
  'borderBlockStyle',
  'borderBlockWidth',
  'borderBlockEndColor',
  'borderBlockEndStyle',
  'borderBlockEndWidth',
  'borderBlockStartColor',
  'borderBlockStartStyle',
  'borderBlockStartWidth',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderEndEndRadius',
  'borderEndStartRadius',
  'borderColor',
  'borderInlineColor',
  'borderInlineStyle',
  'borderInlineWidth',
  'borderInlineEndColor',
  'borderInlineEndStyle',
  'borderInlineEndWidth',
  'borderInlineStartColor',
  'borderInlineStartStyle',
  'borderInlineStartWidth',
  'borderLeftColor',
  'borderLeftStyle',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightStyle',
  'borderRightWidth',
  'borderStartEndRadius',
  'borderStartStartRadius',
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
  'inset',
  'insetBlock',
  'insetBlockEnd',
  'insetBlockStart',
  'insetInline',
  'insetInlineEnd',
  'insetInlineStart',
  'justifyContent',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'opacity',
  'overflow',
  'padding',
  'paddingBlock',
  'paddingBlockEnd',
  'paddingBlockStart',
  'paddingBottom',
  'paddingEnd',
  'paddingInline',
  'paddingInlineEnd',
  'paddingInlineStart',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
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
  'top',
  'userSelect',
  'verticalAlign', // Android Only
  'width',
  'writingDirection', // iOS Only
  'zIndex',
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
  // eslint-disable-next-line flowtype/no-flow-fix-me-comments
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
        processsedSubStyle
      );
      continue;
    }

    if (propName === 'backgroundImage') {
      errorMsg('"backgroundImage" is not supported in React Native.');
    }
    // React Native only supports non-standard box-shadow styles
    else if (propName === 'boxShadow' && typeof styleValue === 'string') {
      const parsedShadow = parseShadow(styleValue);
      if (parsedShadow.length > 1) {
        errorMsg(
          'Multiple "boxShadow" values are not supported in React Native.'
        );
      }
      const { inset, offsetX, offsetY, blurRadius, color } = parsedShadow[0];
      // TODO: parse alpha color inputs => alpha + color
      // errorMsg('"boxShadow" opacity is not implemented in React Native.');
      if (inset) {
        errorMsg(
          '"boxShadow" value of "inset" is not supported in React Native.'
        );
      }
      processedStyle.shadowColor = color;
      processedStyle.shadowOffset = { height: offsetY, width: offsetX };
      processedStyle.shadowOpacity = 1;
      processedStyle.shadowRadius = blurRadius;
    } else if (propName === 'position') {
      if (styleValue === 'fixed') {
        processedStyle[propName] = 'absolute';
        errorMsg(
          '"position" value of "fixed" is not supported in React Native. Falling back to "absolute".'
        );
      } else if (styleValue === 'sticky') {
        processedStyle[propName] = 'relative';
        errorMsg(
          '"position" value of "sticky" is not supported in React Native. Falling back to "relative".'
        );
      }
    }
    // React Native only supports non-standard text-shadow styles
    else if (propName === 'textShadow' && typeof styleValue === 'string') {
      const parsedShadow = parseShadow(styleValue);
      if (parsedShadow.length > 1) {
        errorMsg(
          'Multiple "textShadow" values are not supported in React Native.'
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

/**
 * The spread method shim
 */
type SpreadOptions = {|
  customProperties: {},
  inheritedFontSize: ?number,
  fontScale: number | void,
  viewportHeight: number,
  viewportWidth: number,
  writingDirection: 'ltr' | 'rtl',
|};

export function spread(
  style: ?{ [key: string]: mixed },
  {
    customProperties,
    inheritedFontSize,
    fontScale = 1,
    viewportHeight,
    viewportWidth,
    writingDirection,
  }: SpreadOptions
): { [string]: { ... } } {
  /* eslint-disable prefer-const */
  let { lineClamp, ...flatStyle }: { [key: string]: mixed } =
    flattenStyle(style);
  /* eslint-enable prefer-const */

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
        inheritedFontSize
      );
      styleValue = resolvedValue;
    }

    // Filter out any unexpected style property names so RN doesn't crash but give
    // the developer a warning to let them know that there's a new prop we should either
    // explicitly ignore or process in some way.
    // NOTE: Any kind of prop name transformations should happen before this check.
    if (!isReactNativeStyleProp(styleProp)) {
      errorMsg(`Encountered unsupported style property "${styleProp}"`);
      delete flatStyle[styleProp];
      continue;
    }

    // Similar filter to the prop name one above but instead operates on the property's
    // value. Similarly, any sort of prop value transformations should happen before this
    // filter.
    // We check this at resolve time to ensure the render-time styles are safe.
    if (!isReactNativeStyleValue(styleValue)) {
      errorMsg(
        `Encounted unsupported style value "${String(
          styleValue
        )}" for property "${styleProp}"`
      );
      delete flatStyle[styleProp];
      continue;
    }

    flatStyle[styleProp] = styleValue;
  }

  if (flatStyle != null) {
    flatStyle = CSSMediaQuery.resolveMediaQueries(flatStyle, {
      width: viewportWidth,
      height: viewportHeight,
      direction: writingDirection,
    });
  }

  // Use 'static' position by default for all elements
  if (flatStyle.position == null) {
    flatStyle.position = 'static';
  }

  const nativeProps = { style: flatStyle };

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
