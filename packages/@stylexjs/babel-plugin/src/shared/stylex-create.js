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
import type { ComputedStyle, IPreRule } from './preprocess-rules/PreRule';

import { createShortHash } from './hash';
import { isPlainObject } from './utils/object-utils';
import {
  type EnumAssignment,
  getEnumAssignment,
  compileEnumAssignment,
} from './stylex-enum';
import { defaultOptions } from './utils/default-options';
import { flattenRawStyleObject } from './preprocess-rules/flatten-raw-style-obj';
import { validateNamespace } from './preprocess-rules/basic-validation';

type TPropTuple = [+key: string, +styles: $ReadOnlyArray<ComputedStyle>];

type ClassPathsInNamespace = {
  +[className: string]: $ReadOnlyArray<string>,
};

type TClassNameTuples = $NonMaybeType<ComputedStyle>;

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
  options?: StyleXOptions = defaultOptions,
): [
  { [string]: FlatCompiledStyles },
  { [string]: InjectableStyle },
  { +[string]: ClassPathsInNamespace },
] {
  const resolvedNamespaces: { [string]: FlatCompiledStyles } = {};
  const injectedStyles: { [string]: InjectableStyle } = {};
  const namespaceToClassPaths: { [string]: ClassPathsInNamespace } = {};

  for (const namespaceName of Object.keys(namespaces)) {
    const input = namespaces[namespaceName];
    if (!isPlainObject(input)) validateNamespace(input);
    const enumAssignments: Array<EnumAssignment> = [];
    const namespace = Object.fromEntries(
      Object.entries(input).filter(([, value]) => {
        const assignment = getEnumAssignment(value);
        if (assignment != null) {
          enumAssignments.push(assignment);
          return false;
        }
        return true;
      }),
    );
    const classPathsInNamespace: { [string]: $ReadOnlyArray<string> } = {};

    validateNamespace(namespace);

    // filterReverse to remove duplicate keys and keep the last one always.
    // This is the same behaviour as Object.fromEntries, except it maintains
    // order correctly and is more efficient.
    const seenProperties = new Set<string>();
    const flattenedNamespace: $ReadOnlyArray<$ReadOnly<[string, IPreRule]>> =
      flattenRawStyleObject(namespace, options).reduceRight(
        (arr, curr) => {
          if (seenProperties.has(curr[0])) {
            return arr;
          }
          seenProperties.add(curr[0]);
          arr.unshift(curr);
          return arr;
        },
        [] as Array<$ReadOnly<[string, IPreRule]>>,
      );

    const compiledNamespaceTuples: $ReadOnlyArray<TPropTuple> =
      flattenedNamespace.map(([key, value]) => {
        // Skip variables-as-keys to avoid regression to dynamic styles output
        if (options.enableMinifiedKeys === true && !key.startsWith('--')) {
          const hashedKey = createShortHash('<>' + key);
          const displayKey =
            options.debug === true ? `${key}-k${hashedKey}` : `k${hashedKey}`;
          return [displayKey, value.compiled(options)];
        } else {
          return [key, value.compiled(options)];
        }
      });

    const namespaceObj: {
      [string]: null | string,
    } = {};
    for (const [key, value] of compiledNamespaceTuples) {
      // Remove nulls
      const classNameTuples: $ReadOnlyArray<TClassNameTuples> = value
        .map((v) => (Array.isArray(v) ? v : null))
        .filter(Boolean);

      classNameTuples.forEach(([_className, _, classesToOriginalPath]) => {
        // $FlowFixMe[unsafe-object-assign]
        Object.assign(classPathsInNamespace, classesToOriginalPath);
      });

      const classNames = classNameTuples.map(([className]) => className);
      const uniqueClassNames = new Set(classNames);
      const className = Array.from(uniqueClassNames).join(' ');
      namespaceObj[key] = className !== '' ? className : null;

      for (const [className, injectable] of classNameTuples) {
        if (injectedStyles[className] == null) {
          injectedStyles[className] = injectable;
        }
      }
    }
    for (const assignment of enumAssignments) {
      const [compiled, css] = compileEnumAssignment(
        assignment.ref,
        assignment.value,
        options,
      );
      const classes = compiled[assignment.ref.id];
      if (typeof classes === 'string')
        namespaceObj[assignment.ref.id] = classes;
      for (const [className, rule] of Object.entries(css))
        injectedStyles[className] = rule;
    }
    resolvedNamespaces[namespaceName] = { ...namespaceObj, $$css: true };
    namespaceToClassPaths[namespaceName] = classPathsInNamespace;
  }

  return [resolvedNamespaces, injectedStyles, namespaceToClassPaths];
}
