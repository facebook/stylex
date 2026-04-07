/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 * Shared transform for stylex.unstable_defineConstsNested().
 * Thin wrapper: flatten nested input → delegate to styleXDefineConsts → unflatten JS output.
 * No CSS is emitted (consts are compile-time constants).
 *
 * Uses flattenNestedConstsConfig (not flattenNestedVarsConfig) because consts
 * don't support conditional @-rule values. An object like
 * { default: '#00FF00', hovered: '#0000FF' } represents component states,
 * not CSS conditions — so both become separate flat keys.
 *
 * Example:
 *   Input:  { spacing: { sm: '4px', lg: '16px' } }
 *   Step 1: flattenNestedConstsConfig → { 'spacing.sm': '4px', 'spacing.lg': '16px' }
 *   Step 2: styleXDefineConsts        → { 'spacing.sm': '4px', 'spacing.lg': '16px' } (values preserved)
 *   Step 3: unflattenObject           → { spacing: { sm: '4px', lg: '16px' } }
 */

import type { InjectableConstStyle, StyleXOptions } from './common-types';
import type { NestedConstsValue } from './stylex-nested-utils';

import styleXDefineConsts from './stylex-define-consts';
import {
  flattenNestedConstsConfig,
  unflattenObject,
} from './stylex-nested-utils';

import type { Unflattened } from './stylex-nested-utils';

export default function styleXDefineConstsNested(
  nestedConstants: { +[string]: NestedConstsValue },
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): [
  { [string]: Unflattened<string | number> },
  { [string]: InjectableConstStyle },
] {
  const flatConstants = flattenNestedConstsConfig(nestedConstants);
  const [flatResult, injectableStyles] = styleXDefineConsts(
    flatConstants,
    options,
  );

  const nestedResult = unflattenObject(flatResult);

  return [nestedResult, injectableStyles];
}
