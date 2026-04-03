/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 * Shared transform for stylex.unstable_createThemeNested().
 * Flattens both the themeVars (from defineVarsNested) and the overrides,
 * then delegates to the existing flat styleXCreateTheme.
 * The output is already flat ({ $$css: true, [hash]: className }) — no unflattening needed.
 *
 * Example:
 *   themeVars:  { button: { bg: 'var(--x1)' }, __varGroupHash__: 'xH' }
 *   overrides:  { button: { bg: 'green' } }
 *   Step 1: flattenNestedStringConfig(themeVars)    → { 'button.bg': 'var(--x1)' } + __varGroupHash__
 *   Step 2: flattenNestedOverridesConfig(overrides)  → { 'button.bg': 'green' }
 *   Step 3: styleXCreateTheme(flatVars, flatOverrides) → [{ xH: 'xOverride xH', $$css: true }, CSS]
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { NestedVarsValue, NestedStringValue } from './stylex-nested-utils';

import styleXCreateTheme from './stylex-create-theme';
import {
  flattenNestedOverridesConfig,
  flattenNestedStringConfig,
} from './stylex-nested-utils';

export default function styleXCreateThemeNested(
  themeVars: { +__varGroupHash__: string, +[string]: NestedStringValue },
  nestedOverrides: { +[string]: NestedVarsValue },
  options?: StyleXOptions,
): [{ $$css: true, +[string]: string }, { [string]: InjectableStyle }] {
  const { __varGroupHash__, ...nestedVarRefs } = themeVars;
  const flatVarRefs = flattenNestedStringConfig(nestedVarRefs);
  const flatThemeVars = { ...flatVarRefs, __varGroupHash__ };

  const flatOverrides = flattenNestedOverridesConfig(nestedOverrides);

  return styleXCreateTheme(flatThemeVars, flatOverrides as any, options);
}
