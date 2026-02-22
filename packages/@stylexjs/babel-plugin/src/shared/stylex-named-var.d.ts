/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

export declare const NAMED_VAR_SENTINEL = '__stylexNamedVar';

export type NamedVarSpec<T> = Readonly<{
  __stylexNamedVar: true;
  name: string;
  value: T;
}>;

export declare function isNamedVarSpec(value: unknown): value is NamedVarSpec<unknown>;
export declare function isValidCustomPropertyName(name: string): boolean;
declare function stylexNamedVar<T>(name: string, value: T): NamedVarSpec<T>;
export default stylexNamedVar;
