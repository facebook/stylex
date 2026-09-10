/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { EnumRef } from './stylex-enum';
import type { StyleXOptions, TStyleValue } from './common-types';
import expandShorthands from './preprocess-rules';
import transformValue from './utils/transform-value';

export class EnumMatch {
  ref: EnumRef;
  cases: { [string]: string | number };

  constructor(ref: EnumRef, cases: mixed) {
    if (cases == null || typeof cases !== 'object' || Array.isArray(cases)) {
      throw new Error('stylex.match requires an object of enum cases.');
    }
    const entries = Object.entries(cases);
    if (
      entries.length < 2 ||
      entries.some(([, v]) => typeof v !== 'string' && typeof v !== 'number')
    ) {
      throw new Error(
        'stylex.match requires scalar CSS values for at least two cases.',
      );
    }
    if (ref.states != null) {
      const states = ref.states.map(String);
      if (
        entries.length !== states.length ||
        entries.some(([key]) => !states.includes(key))
      ) {
        throw new Error('stylex.match must include exactly every enum state.');
      }
    }
    this.ref = ref;
    const validated: { [string]: string | number } = {};
    for (const [key, value] of entries) {
      if (typeof value === 'string' || typeof value === 'number')
        validated[key] = value;
    }
    this.cases = validated;
  }

  expand(
    property: string,
    options: StyleXOptions,
  ): Array<[string, TStyleValue]> {
    const expanded = Object.entries(this.cases).map(([state, value]) => [
      state,
      new Map(expandShorthands([property, value], options)),
    ]);
    const keys = new Set(expanded.flatMap(([, values]) => [...values.keys()]));
    return [...keys].map((key) => {
      if (expanded.every(([, values]) => values.get(key) == null))
        return [key, null];
      const parts = expanded.map(([state, values]) => {
        const value = values.get(key);
        if (typeof value !== 'string' && typeof value !== 'number') {
          throw new Error(
            'All match cases must expand to the same CSS properties.',
          );
        }
        return `var(${this.ref.variable(state)},${transformValue(key, value, options)})`;
      });
      return [key, parts.join(' ')];
    });
  }
}

export function matchEnum(ref: any, cases: mixed): EnumMatch {
  const enumReference = ref?.__enumRef;
  if (enumReference == null || typeof enumReference !== 'object') {
    throw new Error('stylex.match requires a defined enum.');
  }
  return new EnumMatch(enumReference as EnumRef, cases);
}
