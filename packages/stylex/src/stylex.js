/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  Keyframes,
  Stylex$Create,
  StyleXArray,
  MapNamespace,
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

function stylexIncludes<TStyles: { +[string]: string | number }>(
  _styles: MapNamespace<TStyles>
): TStyles {
  throw new Error(
    'stylex.extends should never be called. It should be compiled away.'
  );
}

type Stylex$Include = <TStyles: { +[string]: string | number }>(
  _styles: MapNamespace<TStyles>
) => TStyles;

stylex.create = (stylexCreate: Stylex$Create);
stylex.include = (stylexIncludes: Stylex$Include);

stylex.keyframes = (_keyframes: Keyframes): string => {
  throw new Error('stylex.keyframes should never be called');
};

stylex.firstThatWorks = <T: string | number>(
  ..._styles: $ReadOnlyArray<T>
): $ReadOnlyArray<T> => {
  throw new Error('stylex.firstThatWorks should never be called.');
};

stylex.inject = inject;

stylex.UNSUPPORTED_PROPERTY = (props: { ... }) => {
  throw new Error(
    'stylex.UNSUPPORTED_PROPERTY should never be called. It should be compiled away.'
  );
};

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?DedupeStyles | boolean>>): string,
  create: Stylex$Create,
  include: Stylex$Include,
  firstThatWorks: <T>(...args: $ReadOnlyArray<T>) => $ReadOnlyArray<T>,
  inject: (ltrRule: string, priority: number, rtlRule: ?string) => void,
  keyframes: (keyframes: Keyframes) => string,
  ...
};

export default (stylex: IStyleX);
