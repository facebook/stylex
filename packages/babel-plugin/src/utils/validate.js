/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// This is a small utility to validate the options passed to the plugin.
// Think of this as a minimal version of `zod`.

const defaultMessage =
  (expected: string) =>
  (value: mixed, name?: string): string =>
    name
      ? `Expected (${name}) to be ${expected}, but got \`${JSON.stringify(
          value as $FlowFixMe,
        )}\`.`
      : expected;

const defaultUnionMessage =
  (expected: string) =>
  (value: mixed, name?: string): string =>
    name ? `Expected (${name}) to be ${expected}` : expected;

const defaultObjectMessage =
  (expected: string) =>
  (value: mixed, name?: string): string =>
    name ? `Expected (${name}) to be ${expected} but:` : expected;

const indent = (str: string): string =>
  str
    .split('\n')
    .filter((line) => !line.trim().startsWith('But got:'))
    .map((line) =>
      line.includes(', but got') ? line.replace(/, but got.+$/, '') : line,
    )
    .map((line) => (line.trim()[0] === '-' ? line : `- ${line}`))
    .map((line) => `\n\t${line}`)
    .join('');

export type Check<+T> = (val: mixed, name?: string) => Error | T;
export type InferCheckType<T> = T extends Check<infer U> ? U : empty;

type Msg = (value: mixed, name?: string) => string;
type PrimitiveChecker<+T> = (message?: Msg) => Check<T>;

export const string: PrimitiveChecker<string> =
  (message = defaultMessage('a string')) =>
  (value, name) => {
    if (typeof value !== 'string') {
      return new Error(message(value, name));
    }
    return value;
  };

export const nullish: PrimitiveChecker<null | void> =
  (message = defaultMessage('`null` or `undefined`')) =>
  (value, name) =>
    value == null ? value : new Error(message(value, name));

export const boolean: PrimitiveChecker<boolean> =
  (message = defaultMessage('a boolean')) =>
  (value, name) => {
    if (typeof value !== 'boolean') {
      return new Error(message(value, name));
    }
    return value;
  };

export const number: PrimitiveChecker<number> =
  (message = defaultMessage('a number')) =>
  (value, name) => {
    if (typeof value !== 'number') {
      return new Error(message(value, name));
    }
    return value;
  };

export const literal: <T: string | number | boolean>(
  T,
  msg?: Msg,
) => Check<T> =
  (
    expected,
    message = defaultMessage(`the literal ${JSON.stringify(expected)}`),
  ) =>
  (value, name) => {
    if (value === expected) {
      return expected;
    }
    return new Error(message(value, name));
  };

export const array: <T>(Check<T>, msg?: Msg) => Check<$ReadOnlyArray<T>> =
  <T>(
    check: Check<T>,
    message = defaultMessage('an array'),
  ): Check<$ReadOnlyArray<T>> =>
  (value: mixed, name?: string = 'array') => {
    if (!Array.isArray(value)) {
      return new Error(message(value, name));
    }

    const validated: $ReadOnlyArray<T | Error> = value.map((item, i) =>
      check(item, name ? `${name}[${i}]` : undefined),
    );

    const errors = validated.filter(
      (item): item is Error => item instanceof Error,
    );

    if (errors.length > 0) {
      const errMessageList = errors
        .map((item) => '\t' + item.message)
        .join('\n');

      return new Error(`Failed to validate ${name}:\n${errMessageList}`);
    }

    return validated.filter((item): implies item is T => !(item instanceof Error));
  };

type ObjOfChecks<T: { +[string]: Check<mixed> }> = $ReadOnly<{
  [K in keyof T]: InferCheckType<T[K]>,
}>;

export const object: <T: { +[string]: Check<mixed> }>(
  T,
  msg?: Msg,
) => Check<ObjOfChecks<T>> =
  <T: { +[string]: Check<mixed> }>(
    shape: T,
    message = defaultMessage('an object where:'),
  ): Check<ObjOfChecks<T>> =>
  (value, name) => {
    if (typeof value !== 'object' || value == null) {
      return new Error(message(value, name));
    }
    // $FlowFixMe
    const result: Partial<{ ...ObjOfChecks<T> }> = {};
    for (const key in shape) {
      const check = shape[key];
      const item = check(value[key], name ? `${name}.${key}` : `obj.${key}`);
      if (item instanceof Error) {
        const objectDescription = Object.entries(shape)
          .map(([key, check]) => {
            let msg = (check(Symbol()) as any).message;
            if (msg.includes('\n')) {
              msg = indent(indent(msg)).split('\n').slice(1).join('\n');
            }
            return `\t- Expected "${key}": to be ${msg}`;
          })
          .join('\n');

        return new Error(
          `${message(value, name)}\n${objectDescription}\nBut got: ${indent(
            JSON.stringify(value as $FlowFixMe),
          )}`,
        );
      }
      result[key] = item;
    }
    return result;
  };

export const objectOf: <T>(
  Check<T>,
  message?: Msg,
) => Check<{ +[string]: T }> =
  <T>(
    check: Check<T>,
    message = defaultObjectMessage('an object'),
  ): Check<{ +[string]: T }> =>
  (value, name) => {
    if (typeof value !== 'object' || value == null) {
      return new Error(message(value, name));
    }
    // $FlowFixMe
    const result: { [string]: T } = {};
    for (const key in value) {
      const item = check(
        value[key],
        name ? `${name}.${key}` : `With the key '${key}':`,
      );
      if (item instanceof Error) {
        return new Error(
          `${message(value, name)}${indent(item.message)}\nBut got: ${indent(
            JSON.stringify(value as $FlowFixMe),
          )}`,
        );
      }
      result[key] = item;
    }
    return result;
  };

export const unionOf =
  <A, B>(
    a: Check<A>,
    b: Check<B>,
    message: Msg = defaultUnionMessage('one of'),
  ): Check<A | B> =>
  (value, name) => {
    const resultA = a(value);
    if (!(resultA instanceof Error)) {
      return resultA;
    }
    const resultB = b(value);
    if (!(resultB instanceof Error)) {
      return resultB;
    }
    return new Error(
      `${message(value, name)}${indent(resultA.message)}${indent(
        resultB.message,
      )}\nBut got: ${JSON.stringify(value as $FlowFixMe)}`,
    );
  };

export const unionOf3 =
  <A, B, C>(
    a: Check<A>,
    b: Check<B>,
    c: Check<C>,
    message: Msg = defaultUnionMessage('one of'),
  ): Check<A | B | C> =>
  (value, name) => {
    const resultA = a(value);
    if (!(resultA instanceof Error)) {
      return resultA;
    }
    const resultB = b(value);
    if (!(resultB instanceof Error)) {
      return resultB;
    }
    const resultC = c(value);
    if (!(resultC instanceof Error)) {
      return resultC;
    }
    return new Error(
      `${message(value, name)}${indent(resultA.message)}${indent(
        resultB.message,
      )}${indent(resultC.message)}\nBut got: ${JSON.stringify(
        value as $FlowFixMe,
      )}`,
    );
  };

export const unionOf4 =
  <A, B, C, D>(
    a: Check<A>,
    b: Check<B>,
    c: Check<C>,
    d: Check<D>,
    message: Msg = defaultUnionMessage('one of'),
  ): Check<A | B | C | D> =>
  (value, name) => {
    const resultA = a(value);
    if (!(resultA instanceof Error)) {
      return resultA;
    }
    const resultB = b(value);
    if (!(resultB instanceof Error)) {
      return resultB;
    }
    const resultC = c(value);
    if (!(resultC instanceof Error)) {
      return resultC;
    }
    const resultD = d(value);
    if (!(resultD instanceof Error)) {
      return resultD;
    }
    return new Error(
      `${message(value, name)}${indent(resultA.message)}${indent(
        resultB.message,
      )}${indent(resultC.message)}${indent(
        resultD.message,
      )}\nBut got: ${JSON.stringify(value as $FlowFixMe)}`,
    );
  };

export const logAndDefault = <T>(
  check: Check<T>,
  value: mixed,
  def: T,
  name?: string,
): T => {
  const result = check(value, name);
  if (result instanceof Error) {
    console.error('[@stylexjs/babel-plugin]', result.message);
    return def;
  }
  return result;
};
