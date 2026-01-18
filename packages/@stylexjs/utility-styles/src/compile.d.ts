/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StyleXOptions, InjectableStyle } from '@stylexjs/shared';

export type CompiledStaticStyle = Readonly<{
  className: string;
  classKey: string;
  injectedStyles: Readonly<{
    [key: string]: InjectableStyle;
  }>;
}>;

export type CompiledDynamicStyle = Readonly<{
  className: string;
  classKey: string;
  varName: string;
  injectedStyles: Readonly<{
    [key: string]: InjectableStyle;
  }>;
}>;

/**
 * Compiles a static utility style (e.g., x.display.flex) into a className
 * and injectable CSS rules.
 */
export function compileStaticStyle(
  property: string,
  value: string | number,
  options: StyleXOptions,
): CompiledStaticStyle;

/**
 * Compiles a dynamic utility style (e.g., x.color(someVar)) into a className
 * with a CSS variable, and injectable CSS rules.
 */
export function compileDynamicStyle(
  property: string,
  options: StyleXOptions,
): CompiledDynamicStyle;
