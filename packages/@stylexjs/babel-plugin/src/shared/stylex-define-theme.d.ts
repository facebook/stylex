/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 *
 * Shared transform for stylex.defineTheme().
 * Sugar API that composes styleXDefineVarsNested + styleXCreateThemeNested
 * into a single call for co-locating tokens and theme variants.
 *
 * Under the hood:
 *   1. styleXDefineVarsNested(config.tokens)       → token CSS vars + nested var refs
 *   2. for each theme in config.themes:
 *        styleXCreateThemeNested(tokenRefs, overrides) → theme override CSS + className obj
 *
 * Returns:
 *   tokensResult   — same as styleXDefineVarsNested output (nested var refs + __varGroupHash__)
 *   themesResult   — { [themeName]: { $$css: true, [hash]: className } }
 *   injectableCSS  — merged CSS from both token vars and all theme overrides
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { NestedVarsValue, Unflattened } from './stylex-nested-utils';
type DefineThemeConfig = {
  readonly tokens: { readonly [$$Key$$: string]: NestedVarsValue };
  readonly themes?: {
    readonly [$$Key$$: string]: { readonly [$$Key$$: string]: NestedVarsValue };
  };
};
type DefineThemeResult = {
  tokensResult: { [$$Key$$: string]: Unflattened<string> };
  themesResult: {
    [$$Key$$: string]: { $$css: true } & { readonly [$$Key$$: string]: string };
  };
  injectableStyles: { [$$Key$$: string]: InjectableStyle };
};
declare function styleXDefineTheme(
  config: DefineThemeConfig,
  options: Readonly<
    Omit<Partial<StyleXOptions>, keyof { exportId: string }> & {
      exportId: string;
    }
  >,
): DefineThemeResult;
export default styleXDefineTheme;
