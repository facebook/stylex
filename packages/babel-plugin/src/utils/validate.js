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

export const string =
  (
    message?: (name: string) => string = (name) =>
      `Expected ${name} to be a string`,
  ): ((val: mixed) => Error | string) =>
  (value: mixed): Error | string => {
    if (typeof value !== 'string') {
      return new Error(message('string'));
    }

    return value;
  };

export const nullish =
  (
    message?: (name: string) => string = (name) =>
      `Expected ${name} to be null or undefined`,
  ): ((val: mixed) => ?Error) =>
  (value: mixed): ?Error =>
    value == null ? value : new Error(message('nullish'));

export const boolean =
  (
    message?: (name: string) => string = (name) =>
      `Expected ${name} to be a boolean`,
  ): ((val: mixed) => Error | boolean) =>
  (value: mixed): Error | boolean => {
    if (typeof value !== 'boolean') {
      return new Error(message('boolean'));
    }

    return value;
  };

export const number =
  (
    message?: (name: string) => string = (name) =>
      `Expected ${name} to be a number`,
  ): ((val: mixed) => Error | number) =>
  (value: mixed): Error | number => {
    if (typeof value !== 'number') {
      return new Error(message('number'));
    }

    return value;
  };

export const literal =
  <T: string | number | boolean>(
    expected: T,
    message?: (name: string) => string = (name) =>
      `Expected ${name} to be ${String(expected)}`,
  ): ((val: mixed) => Error | T) =>
  (value: mixed): Error | T => {
    if (value === expected) {
      return expected;
    }
    const n: string = JSON.stringify(value) ?? String(value);
    return new Error(message(n));
  };
