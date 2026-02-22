/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export const NAMED_VAR_SENTINEL = '__stylexNamedVar';

export type NamedVarSpec<+T> = $ReadOnly<{
  +__stylexNamedVar: true,
  +name: string,
  +value: T,
}>;

// Enforce simple dashed identifier syntax for custom properties.
// We intentionally require the leading "--" to keep the API explicit.
const CUSTOM_PROPERTY_NAME_REGEX = /^--[A-Za-z_][A-Za-z0-9_-]*$/;

export function isNamedVarSpec(value: mixed): boolean {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const candidate: any = value;
  return (
    candidate[NAMED_VAR_SENTINEL] === true &&
    typeof candidate.name === 'string' &&
    'value' in candidate
  );
}

export function isValidCustomPropertyName(name: string): boolean {
  return CUSTOM_PROPERTY_NAME_REGEX.test(name);
}

export default function stylexNamedVar<T>(
  name: string,
  value: T,
): NamedVarSpec<T> {
  return {
    [NAMED_VAR_SENTINEL]: true,
    name,
    value,
  };
}
