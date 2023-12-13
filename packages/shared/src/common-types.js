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
export type TStyleValue = null | TRawValue;
export type TNestableStyleValue = TStyleValue | PrimitiveRawStyles;

export type RawStyles = $ReadOnly<{
  [string]: TNestableStyleValue | IncludedStyles,
}>;
export type PrimitiveRawStyles = $ReadOnly<{
  [string]: TNestableStyleValue,
}>;

export type InjectableStyle = {
  +priority: number,
  +ltr: string,
  +rtl: null | string,
};

export type StyleRule = [string, string, InjectableStyle];

export type CompiledStyles = $ReadOnly<{
  [string]:
    | IncludedStyles
    | null
    | string
    | $ReadOnly<{ [string]: null | string }>,
}>;

export type FlatCompiledStyles = $ReadOnly<{
  [string]: string | IncludedStyles | null,
  $$css: true,
}>;

export type StyleXOptions = $ReadOnly<{
  dev: boolean,
  test: boolean,
  useRemForFontSize: boolean,
  classNamePrefix: string,
  definedStylexCSSVariables?: { [key: string]: mixed },
  styleResolution:
    | 'application-order' // The last style applied wins.
    // More specific styles will win over less specific styles. (margin-top wins over margin)
    | 'property-specificity'
    // Legacy behavior, that expands shorthand properties into their longhand counterparts at compile-time.
    // This is not recommended, and will be removed in a future version.
    | 'legacy-expand-shorthands',
  ...
}>;

export type MutableCompiledNamespaces = {
  [key: string]: FlatCompiledStyles,
};

export type CompiledNamespaces = $ReadOnly<MutableCompiledNamespaces>;
