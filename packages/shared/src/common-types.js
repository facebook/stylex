/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { IncludedStyles } from './stylex-include';

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

export type FlatCompiledStyles = $ReadOnly<{
  [string]: string | IncludedStyles | null,
  $$css: true,
}>;

export type StyleXOptions = {
  dev: boolean,
  test: boolean,
  stylexSheetName?: string | void,
  classNamePrefix: string,
  definedStylexCSSVariables?: { [key: string]: mixed },
  ...
};
