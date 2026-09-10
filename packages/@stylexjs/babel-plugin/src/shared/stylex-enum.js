/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import hash from './hash';
import { isPlainObject } from './utils/object-utils';
import { defaultOptions } from './utils/default-options';

export type EnumState = string | boolean;

export type EnumRef = {
  +id: string,
  +states?: $ReadOnlyArray<EnumState>,
};

export function enumRef(
  id: string,
  states?: $ReadOnlyArray<EnumState>,
): EnumRef {
  return { id, states };
}

export function getEnumRef(value: mixed): EnumRef | null {
  if (value == null || typeof value !== 'object' || Array.isArray(value))
    return null;
  const ref = value.__enumRef;
  if (!isPlainObject(ref) || typeof ref.id !== 'string') return null;
  const id = ref.id;
  const states = ref.states;
  if (states === undefined) return enumRef(id);
  if (!Array.isArray(states)) return null;
  const validated: Array<EnumState> = [];
  for (const state of states) {
    if (typeof state !== 'string' && typeof state !== 'boolean') return null;
    validated.push(state);
  }
  return enumRef(id, validated);
}

export function getEnumVariableName(ref: EnumRef, state: string): string {
  // State names are hashed, never interpolated into CSS identifiers.
  return `--${ref.id}-${hash(state)}`;
}

export function validateEnumState(value: mixed, ref?: EnumRef): EnumState {
  if (typeof value !== 'string' && typeof value !== 'boolean') {
    throw new Error(
      'An enum assignment must be a static string or boolean state.',
    );
  }
  if (ref?.states != null && !ref.states.includes(value)) {
    throw new Error(`Unknown enum state: ${String(value)}.`);
  }
  return value;
}

export function defineEnum(
  states: mixed,
  initialValue: mixed,
  id: string,
): [{ [string]: string }, { [string]: InjectableStyle }] {
  if (
    !Array.isArray(states) ||
    states.length < 2 ||
    new Set(states).size !== states.length ||
    !states.every(
      (state) =>
        (typeof state === 'string' || typeof state === 'boolean') &&
        typeof state === typeof states[0],
    )
  ) {
    throw new Error(
      'defineEnum requires at least two distinct strings, or [true, false].',
    );
  }
  const values = states.map((state) => validateEnumState(state));
  const ref = enumRef(id, values);
  const reset = values
    .map((value) => `${getEnumVariableName(ref, String(value))}: ;`)
    .join('');
  const selector = `:root:not(.${id})`;
  const rules = [];

  function visit(value: mixed, conditions: Array<string>, root: boolean): void {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      const object: { +[string]: mixed } = value;
      if (root && !Object.hasOwn(object, 'default')) {
        throw new Error(
          'Conditional enum values require a top-level default state.',
        );
      }
      if (Object.hasOwn(object, 'default')) {
        validateEnumState(object.default, ref);
        visit(object.default, conditions, false);
      }
      for (const [condition, child] of Object.entries(object)) {
        if (condition === 'default') continue;
        if (!/^@(media|supports|container)\s/.test(condition)) {
          throw new Error(
            'Enum initial values only support media, supports, and container at-rules.',
          );
        }
        visit(child, [...conditions, condition], false);
      }
      return;
    }
    const state = validateEnumState(value, ref);
    const declarations = values
      .map(
        (v) =>
          `${getEnumVariableName(ref, String(v))}:${v === state ? 'initial' : ' '};`,
      )
      .join('');
    const css = `${selector}{${declarations}}`;
    rules.push(
      conditions.reduceRight((text, condition) => `${condition}{${text}}`, css),
    );
  }

  visit(initialValue, [], true);
  return [
    Object.fromEntries(
      values.map((value) => [
        String(value),
        `var(${getEnumVariableName(ref, String(value))})`,
      ]),
    ),
    {
      [id]: {
        ltr: `:where(.${id}){${reset}}${rules.join('')}`,
        rtl: null,
        priority: 0.1,
      },
    },
  ];
}

export function compileEnumAssignment(
  ref: EnumRef,
  value: mixed,
  options: StyleXOptions = defaultOptions,
): [{ $$css: true, [string]: string | true }, { [string]: InjectableStyle }] {
  const state = validateEnumState(value, ref);
  const declaration = `${getEnumVariableName(ref, String(state))}:initial`;
  const className =
    options.classNamePrefix + hash(`enum:${ref.id}:${String(state)}`);
  return [
    { [ref.id]: `${ref.id} ${className}`, $$css: true },
    {
      [className]: {
        ltr: `.${className}{${declaration}}`,
        rtl: null,
        priority: 1,
      },
    },
  ];
}
