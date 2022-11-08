/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  RawStyles,
  CompiledStyles,
  InjectableStyle,
  StyleXOptions,
  FlatCompiledStyles,
} from './common-types';

import convertToClassName from './convert-to-className';
import expandShorthands from './expand-shorthands';
import {
  objFromEntries,
  objValues,
  objEntries,
  flattenObject,
} from './utils/object-utils';
import * as messages from './messages';
import { IncludedStyles } from './stylex-include';

// This takes the object of styles passed to `stylex.create` and transforms it.
//   The transformation replaces style values with classNames.
//
// It also collects all injected styles along the way.
// It then returns a tuple of the transformed style Object and an object of injected styles.
//
// This function does some basic validation, and then uses `styleXCreateNamespace` to transform
// each namespace within,
//
// Before returning, it ensures that there are no duplicate styles being injected.
export default function styleXCreateSet(
  namespaces: { +[string]: RawStyles },
  options?: StyleXOptions = {}
): [{ [string]: FlatCompiledStyles }, { [string]: InjectableStyle }] {
  const resolvedNamespaces: { [string]: FlatCompiledStyles } = {};
  const injectedStyles = {};

  for (const namespaceName of Object.keys(namespaces)) {
    const namespace = namespaces[namespaceName];
    if (typeof namespace !== 'object' || Array.isArray(namespace)) {
      throw new Error(messages.ILLEGAL_NAMESPACE_VALUE);
    }
    const [resolvedNamespace, injected] = styleXCreateNamespace(
      namespace,
      options
    );
    const compiledNamespace: { +[string]: string | IncludedStyles } =
      flattenObject(resolvedNamespace);
    resolvedNamespaces[namespaceName] = { ...compiledNamespace, $$css: true };
    for (const cn of Object.keys(injected)) {
      if (injectedStyles[cn] == null) {
        injectedStyles[cn] = injected[cn];
      }
    }
  }

  return [resolvedNamespaces, injectedStyles];
}

// Transforms a single style namespace.
// e.g. Something along the lines of:
//  {color: 'red', margin: '10px'} =>
//  {
//    color: 'color-red',
//    marginTop: 'margin-top-10px',
//    marginBottom: 'margin-bottom-10px',
//    marginStart: 'margin-start-10px',
//    marginEnd: 'margin-end-10px'
//  }
//
// First, it expands shorthand properties. (margin => marginTop, marginBottom, marginStart, marginEnd)
// Then, it converts each style value to a className.
// Then, it returns the transformed style Object and an object of injected styles.
function styleXCreateNamespace(
  style: RawStyles,
  options: StyleXOptions
): [CompiledStyles, { [string]: [string, InjectableStyle] }] {
  const namespaceEntries = objEntries(style);

  // First the shorthand properties are expanded.
  // e.g. `margin` gets expanded to `marginTop`, `marginBottom`, `marginStart`, `marginEnd`.
  // `entries` is an array of [key, value] pairs.
  const entries = namespaceEntries.flatMap(([key, value]) => {
    if (value instanceof IncludedStyles) {
      return [[key, value]];
    }
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      if (!key.startsWith(':') && !key.startsWith('@')) {
        throw new Error(messages.INVALID_PSEUDO);
      }
      return [
        [
          key,
          objFromEntries(
            objEntries(value).flatMap(([innerKey, innerValue]) => {
              if (
                innerValue != null &&
                typeof innerValue === 'object' &&
                !Array.isArray(innerValue)
              ) {
                throw new Error(messages.ILLEGAL_NESTED_PSEUDO);
              }
              return expandShorthands([innerKey, innerValue]);
            })
          ),
        ],
      ];
    } else {
      if (
        value !== null &&
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        !Array.isArray(value)
      ) {
        throw new Error(messages.ILLEGAL_PROP_VALUE);
      }
      if (
        Array.isArray(value) &&
        value.some((val) => typeof val === 'object')
      ) {
        throw new Error(messages.ILLEGAL_PROP_ARRAY_VALUE);
      }
      return expandShorthands([key, value]);
    }
  });

  // Now each [key, value] pair is considered a single atomic style.
  // This atomic style is converted to a className by hashing
  //
  // The [key, className] pair is then added to the output Object: `resolvedNamespace`.
  // While hashing, the CSS rule that the className is generated from is also added to the output Object: `injectedStyles`.
  const resolvedNamespace = {};
  const injectedStyles = {};
  for (const [key, val] of entries) {
    if (val instanceof IncludedStyles) {
      resolvedNamespace[key] = val;
    } else if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      const pseudo = key;
      const innerObj = {};
      for (const [innerKey, innerVal] of objEntries(val)) {
        if (innerVal === null) {
          innerObj[innerKey] = null;
        } else {
          const [updatedKey, className, cssRule] = convertToClassName(
            [innerKey, innerVal],
            pseudo,
            options
          );
          innerObj[updatedKey] = className;
          injectedStyles[updatedKey + pseudo] = [className, cssRule];
        }
      }
      resolvedNamespace[key] = innerObj;
    } else {
      if (val === null) {
        resolvedNamespace[key] = null;
      } else {
        const [updatedKey, className, cssRule] = convertToClassName(
          [key, val],
          undefined,
          options
        );
        resolvedNamespace[updatedKey] = className;
        injectedStyles[updatedKey] = [className, cssRule];
      }
    }
  }
  const finalInjectedStyles = objFromEntries(objValues(injectedStyles));
  return [resolvedNamespace, finalInjectedStyles];
}
