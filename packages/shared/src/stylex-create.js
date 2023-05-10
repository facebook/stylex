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
  InjectableStyle,
  StyleXOptions,
  FlatCompiledStyles,
} from './common-types';

import { objFromEntries } from './utils/object-utils';
import { IncludedStyles } from './stylex-include';
import { defaultOptions } from './utils/default-options';
import { flattenRawStyleObject } from './preprocess-rules/flatten-raw-style-obj';
import type { ComputedStyle } from './preprocess-rules/PreRule';
import { validateNamespace } from './preprocess-rules/basic-validation';

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
  options?: StyleXOptions = defaultOptions
): [{ [string]: FlatCompiledStyles }, { [string]: InjectableStyle }] {
  const resolvedNamespaces: { [string]: FlatCompiledStyles } = {};
  const injectedStyles: { [string]: InjectableStyle } = {};

  for (const namespaceName of Object.keys(namespaces)) {
    const namespace = namespaces[namespaceName];

    validateNamespace(namespace);

    const flattenedNamespace = flattenRawStyleObject(namespace, options);
    const compiledNamespaceTuples = flattenedNamespace.map(([key, value]) => {
      return [key, value.compiled(options)];
    });

    const compiledNamespace = objFromEntries<
      string,
      IncludedStyles | $ReadOnlyArray<ComputedStyle>
    >(compiledNamespaceTuples);

    const namespaceObj: {
      [string]: null | string | IncludedStyles,
    } = {};
    for (const key of Object.keys(compiledNamespace)) {
      const value = compiledNamespace[key];
      if (value instanceof IncludedStyles) {
        namespaceObj[key] = value;
      } else {
        const classNameTuples: Array<$ReadOnly<[string, InjectableStyle]>> =
          value.map((v) => (Array.isArray(v) ? v : null)).filter(Boolean);
        const className =
          classNameTuples.map(([className]) => className).join(' ') || null;
        namespaceObj[key] = className;
        for (const [className, injectable] of classNameTuples) {
          if (injectedStyles[className] == null) {
            injectedStyles[className] = injectable;
          }
        }
      }
    }
    resolvedNamespaces[namespaceName] = { ...namespaceObj, $$css: true };
  }

  return [resolvedNamespaces, injectedStyles];
}
