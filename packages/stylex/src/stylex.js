/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  Keyframes,
  NestedCSSPropTypes,
  Stylex$Create,
  StyleXArray,
} from './StyleXTypes';

import inject from './inject';

type Cache = WeakMap<
  { ... },
  {
    classNameChunk: string,
    definedPropertiesChunk: Array<string>,
    next: Cache,
  }
>;

type DedupeStyles = $ReadOnly<{
  [key: string]: string | $ReadOnly<{ [key: string]: string, ... }>,
  ...
}>;

const enableCache = true;
const cache: ?Cache = enableCache ? new WeakMap() : null;

function stylex(
  ...styles: Array<StyleXArray<?DedupeStyles | boolean>>
): string {
  // Keep a set of property commits to the className
  const definedProperties = [];
  let className = '';
  let nextCache = cache;

  while (styles.length) {
    // Push nested styles back onto the stack to be processed
    const possibleStyle = styles.pop();
    if (Array.isArray(possibleStyle)) {
      for (let i = 0; i < possibleStyle.length; i++) {
        styles.push(possibleStyle[i]);
      }
      continue;
    }

    // Process an individual style object
    const styleObj = possibleStyle;
    if (styleObj != null && typeof styleObj === 'object') {
      // Build up the class names defined by this object
      let classNameChunk = '';
      if (nextCache != null && nextCache.has(styleObj)) {
        // Cache: read
        const cacheEntry = nextCache.get(styleObj);
        if (cacheEntry != null) {
          classNameChunk = cacheEntry.classNameChunk;
          definedProperties.push(...cacheEntry.definedPropertiesChunk);
          nextCache = cacheEntry.next;
        }
      } else {
        // Record the properties this object defines (and that haven't already
        // been defined by later objects.)
        const definedPropertiesChunk = [];
        for (const prop in styleObj) {
          const value = styleObj[prop];
          // Style declarations, e.g., opacity: 's3fkgpd'
          if (typeof value === 'string') {
            // Skip adding to the chunks if property has already been seen
            if (!definedProperties.includes(prop)) {
              definedProperties.push(prop);
              definedPropertiesChunk.push(prop);
              classNameChunk += classNameChunk ? ' ' + value : value;
            }
          }
          // Style conditions, e.g., ':hover', '@media', etc.
          // TODO: remove if #98 is fixed
          else if (typeof value === 'object') {
            const condition = prop;
            const nestedStyleObject = value;
            for (const conditionalProp in nestedStyleObject) {
              const conditionalValue = nestedStyleObject[conditionalProp];
              const conditionalProperty = condition + conditionalProp;
              // Skip if conditional property has already been seen
              if (!definedProperties.includes(conditionalProperty)) {
                definedProperties.push(conditionalProperty);
                definedPropertiesChunk.push(conditionalProperty);
                classNameChunk += classNameChunk
                  ? ' ' + conditionalValue
                  : conditionalValue;
              }
            }
          }
        }
        // Cache: write
        if (nextCache != null) {
          const emptyCache = new WeakMap();
          nextCache.set(styleObj, {
            classNameChunk,
            definedPropertiesChunk,
            next: emptyCache,
          });
          nextCache = emptyCache;
        }
      }

      // Order of classes in chunks matches property-iteration order of style
      // object. Order of chunks matches passed order of styles from first to
      // last (which we iterate over in reverse).
      if (classNameChunk) {
        className = className
          ? classNameChunk + ' ' + className
          : classNameChunk;
      }
    }
  }

  return className;
}

function stylexCreate(_styles: { ... }) {
  throw new Error(
    'stylex.create should never be called. It should be compiled away.'
  );
}

/**
 * WARNING!
 * If you add another method to stylex make sure to update
 * CommonJSParser::getStylexPrefixSearchConf().
 *
 * Otherwise any callsites will fatal.
 */

stylex.compose = function stylexCompose(
  ...styles: Array<StyleXArray<?NestedCSSPropTypes | boolean>>
): NestedCSSPropTypes {
  // When flow creates an empty object, it doesn't like for it to have
  // the type of an exact object. This is just a local override that
  // uses the correct types and overrides the problems of Flow.
  const baseObject = ({}: $FlowFixMe);

  const workingStack = styles.reverse();

  while (workingStack.length) {
    // Reverse push nested styles back onto the stack to be processed
    const next = styles.pop();
    if (Array.isArray(next)) {
      for (let i = next.length - 1; i >= 0; i--) {
        workingStack.push(next[i]);
      }
      continue;
    }

    // Merge style objects
    const styleObj = next;
    if (styleObj != null && typeof styleObj === 'object') {
      for (const key in styleObj) {
        const value = styleObj[key];
        if (typeof value === 'string') {
          baseObject[key] = value;
        } else if (typeof value === 'object') {
          baseObject[key] = baseObject[key] ?? {};
          Object.assign(baseObject[key], value);
        }
      }
    }
  }

  return baseObject;
};

stylex.create = (stylexCreate: Stylex$Create);

stylex.keyframes = (_keyframes: Keyframes): string => {
  throw new Error('stylex.keyframes should never be called');
};

stylex.inject = inject;

// actual styles are defined in the compiler
type AbsoluteFill = $ReadOnly<{
  bottom: 0,
  boxSizing: 'border-box',
  end: 0,
  position: 'absolute',
  start: 0,
  top: 0,
}>;
stylex.absoluteFill = {
  bottom: 0,
  boxSizing: 'border-box',
  end: 0,
  position: 'absolute',
  start: 0,
  top: 0,
};

type AbsoluteCenter = $ReadOnly<{
  boxSizing: 'border-box',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}>;
stylex.absoluteCenter = {
  boxSizing: 'border-box',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
};

type BlockBase = $ReadOnly<{
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  margin: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
}>;
stylex.blockBase = {
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  margin: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
};

type InlineBase = $ReadOnly<{
  ...BlockBase,
  display: 'inline',
}>;
stylex.inlineBase = {
  ...stylex.blockBase,
  display: 'inline',
};

type ButtonBase = $ReadOnly<{
  appearance: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'inherit',
  zIndex: 0,
}>;
stylex.buttonBase = {
  appearance: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'inherit',
  zIndex: 0,
};

type FlexBase = $ReadOnly<{
  alignItems: 'stretch',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  justifyContent: 'space-between',
  margin: 0,
  minHeight: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
}>;
stylex.flexBase = {
  alignItems: 'stretch',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  justifyContent: 'space-between',
  margin: 0,
  minHeight: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
};

type FlexInlineBase = $ReadOnly<{
  ...FlexBase,
  display: 'inline-flex',
}>;
stylex.flexInlineBase = {
  ...stylex.flexBase,
  display: 'inline-flex',
};

type LinkBase = $ReadOnly<{
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxSizing: 'border-box',
  color: 'inherit',
  cursor: 'pointer',
  position: 'relative',
  textDecoration: 'none',
  zIndex: 0,
}>;
stylex.linkBase = {
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxSizing: 'border-box',
  color: 'inherit',
  cursor: 'pointer',
  position: 'relative',
  textDecoration: 'none',
  zIndex: 0,
};

type ListBase = $ReadOnly<{
  boxSizing: 'border-box',
  listStyle: 'none',
  marginBottom: 0,
  marginTop: 0,
  paddingStart: 0,
}>;
stylex.listBase = {
  boxSizing: 'border-box',
  listStyle: 'none',
  marginBottom: 0,
  marginTop: 0,
  paddingStart: 0,
};

// Shorthand for making an element visible only to screen readers
type VisuallyHidden = $ReadOnly<{
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  width: 1,
}>;
stylex.visuallyHidden = {
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  width: 1,
};

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?DedupeStyles | boolean>>): string,
  visuallyHidden: VisuallyHidden,
  absoluteCenter: AbsoluteCenter,
  absoluteFill: AbsoluteFill,
  blockBase: BlockBase,
  buttonBase: ButtonBase,
  compose: (
    ...styles: $ReadOnlyArray<StyleXArray<?NestedCSSPropTypes | boolean>>
  ) => NestedCSSPropTypes,
  create: Stylex$Create,
  dedupe: (...styles: $ReadOnlyArray<DedupeStyles>) => string,
  flexBase: FlexBase,
  flexInlineBase: FlexInlineBase,
  inject: (ltrRule: string, priority: number, rtlRule: ?string) => void,
  inlineBase: InlineBase,
  keyframes: (keyframes: Keyframes) => string,
  linkBase: LinkBase,
  listBase: ListBase,
  ...
};

export default (stylex: IStyleX);
