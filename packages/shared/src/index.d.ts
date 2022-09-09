/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type TRawValue = number | string | Array<number | string>;

export type TStyleValue = number | string | Array<number | string>;
export type TNestableStyleValue =
  | TStyleValue
  | { readonly [key: string]: TStyleValue };

export type RawStyles = $ReadOnly<{
  [key: string]: TNestableStyleValue;
}>;

export type InjectableStyle = {
  readonly priority: number;
  readonly ltr: string;
  readonly rtl?: string;
};

export type StyleRule = readonly [string, string, InjectableStyle];

export type CompiledStyles = {
  readonly [key: string]: string | { readonly [key: string]: string };
};
export type MutableCompiledStyles = {
  [key: string]: string | { [key: string]: string };
};

export type CompiledNamespaces = { readonly [key: string]: CompiledStyles };

export type MutableCompiledNamespaces = {
  [key: string]: MutableCompiledStyles;
};

export function create<N extends { readonly [key: string]: RawStyles }>(
  namespaces: N,
  stylexSheetName?: string
): readonly [CompiledNamespaces, { readonly [key: string]: InjectableStyle }];

export function keyframes<
  Obj extends {
    readonly [key: string]: { readonly [k: string]: string | number };
  }
>(animation: Obj, stylexSheetName?: string): readonly [string, InjectableStyle];

export function include(animation: {
  readonly [key: string]: string | number;
}): readonly { [key: string]: IncludedStyles };

export class IncludedStyles {
  astNode: any;
}

export const messages: {
  ILLEGAL_ARGUMENT_LENGTH: string;
  NON_STATIC_VALUE: string;
  ESCAPED_STYLEX_VALUE: string;
  UNBOUND_STYLEX_CALL_VALUE: string;
  ONLY_TOP_LEVEL: string;
  NON_OBJECT_FOR_STYLEX_CALL: string;
  UNKNOWN_PROP_KEY: string;
  INVALID_PSEUDO: string;
  ILLEGAL_NAMESPACE_TYPE: string;
  UNKNOWN_NAMESPACE: string;
  ILLEGAL_NESTED_PSEUDO: string;
  ILLEGAL_PROP_VALUE: string;
  ILLEGAL_PROP_ARRAY_VALUE: string;
  ILLEGAL_NAMESPACE_VALUE: string;
  INVALID_SPREAD: string;
  LINT_UNCLOSED_FUNCTION: string;
  LOCAL_ONLY: string;
  UNEXPECTED_ARGUMENT: string;
  EXPECTED_FUNCTION_CALL: string;
};
