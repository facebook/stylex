/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type TRawValue = number | string | $ReadOnlyArray<number | string>;

export type TStyleValue = number | string | $ReadOnlyArray<number | string>;
export type TNestableStyleValue =
  | TStyleValue
  | $ReadOnly<{
      [string]: TStyleValue,
    }>;

export type RawStyles = $ReadOnly<{
  [string]: TNestableStyleValue,
}>;

export type InjectableStyle = {
  +priority: number,
  +ltr: string,
  +rtl: null | string,
};

export type StyleRule = [string, string, InjectableStyle];

export type CompiledStyles = $ReadOnly<{
  [string]: string | $ReadOnly<{ [string]: string }>,
}>;
