/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
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

import styleXDefineVarsNested from './stylex-define-vars-nested';
import styleXCreateThemeNested from './stylex-create-theme-nested';

type DefineThemeConfig = {
  +tokens: { +[string]: NestedVarsValue },
  +themes?: { +[string]: { +[string]: NestedVarsValue } },
};

type DefineThemeResult = {
  tokensResult: { [string]: Unflattened<string> },
  themesResult: { [string]: { +[string]: string | boolean } },
  injectableStyles: { [string]: InjectableStyle },
};

export default function styleXDefineTheme(
  config: DefineThemeConfig,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): DefineThemeResult {
  const [tokensResult, tokenStyles] = styleXDefineVarsNested(
    config.tokens,
    options,
  );

  const themesResult: { [string]: { +[string]: string | boolean } } = {};
  let allStyles: { [string]: InjectableStyle } = { ...tokenStyles };

  if (config.themes != null) {
    for (const [themeName, overrides] of Object.entries(config.themes)) {
      const [themeObj, themeStyles] = styleXCreateThemeNested(
        tokensResult as any,
        overrides,
      );
      themesResult[themeName] = themeObj;
      allStyles = { ...allStyles, ...themeStyles };
    }
  }

  return {
    tokensResult,
    themesResult,
    injectableStyles: allStyles,
  };
}
