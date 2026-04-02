/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
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

  return styleXCreateTheme(flatThemeVars, flatOverrides, options);
}
