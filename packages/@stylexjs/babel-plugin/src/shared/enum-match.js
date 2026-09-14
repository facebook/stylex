/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions, TStyleValue } from './common-types';

import { getEnumRef, getEnumVariableName } from './stylex-enum';
import { isPlainObject } from './utils/object-utils';
import expandShorthands from './preprocess-rules';
import transformValue from './utils/transform-value';

export type EnumMatch = {
  +type: 'enum-match',
  +cases: { +[string]: string | number },
};

export function getEnumMatch(value: mixed): EnumMatch | null {
  if (!isPlainObject(value) || value.type !== 'enum-match') return null;
  const values = value.cases;
  if (!isPlainObject(values)) return null;
  const cases: { [string]: string | number } = {};
  for (const [variable, entry] of Object.entries(values)) {
    if (typeof entry !== 'string' && typeof entry !== 'number') return null;
    cases[variable] = entry;
  }
  return { type: 'enum-match', cases };
}

export function matchEnum(value: mixed, cases: mixed): EnumMatch {
  const ref = getEnumRef(value);
  if (ref == null) {
    throw new Error('stylex.match requires a defined enum.');
  }
  if (!isPlainObject(cases)) {
    throw new Error('stylex.match requires an object of enum cases.');
  }
  const entries = Object.entries(cases);
  if (
    entries.length < 2 ||
    entries.some(
      ([, entry]) => typeof entry !== 'string' && typeof entry !== 'number',
    )
  ) {
    throw new Error(
      'stylex.match requires scalar CSS values for at least two cases.',
    );
  }
  if (ref.states != null) {
    const states = ref.states.map(String);
    const keys = Object.keys(cases);
    if (
      keys.length !== states.length ||
      keys.some((key) => !states.includes(key))
    ) {
      throw new Error('stylex.match must include exactly every enum state.');
    }
  }
  const variables: { [string]: string | number } = {};
  for (const [state, entry] of entries) {
    if (typeof entry === 'string' || typeof entry === 'number') {
      variables[getEnumVariableName(ref, state)] = entry;
    }
  }
  return { type: 'enum-match', cases: variables };
}

export function expandEnumMatch(
  match: EnumMatch,
  property: string,
  options: StyleXOptions,
): Array<[string, TStyleValue]> {
  const expanded = Object.entries(match.cases).map(([variable, value]) => [
    variable,
    new Map(expandShorthands([property, value], options)),
  ]);
  const keys = new Set(expanded.flatMap(([, values]) => [...values.keys()]));
  return [...keys].map((key) => {
    if (expanded.every(([, values]) => values.get(key) == null))
      return [key, null];
    const parts = expanded.map(([variable, values]) => {
      const value = values.get(key);
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(
          'All match cases must expand to the same CSS properties.',
        );
      }
      return `var(${variable},${transformValue(key, value, options)})`;
    });
    return [key, parts.join(' ')];
  });
}
