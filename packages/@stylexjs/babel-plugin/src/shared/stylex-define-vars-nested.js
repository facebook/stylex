/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 * Shared transform for stylex.unstable_defineVarsNested().
 * Thin wrapper: flatten nested input → delegate to styleXDefineVars → unflatten JS output.
 * CSS output passes through unchanged (already flat).
 *
 * Example:
 *   Input:  { button: { bg: 'red', color: 'blue' } }
 *   Step 1: flattenNestedVarsConfig → { 'button.bg': 'red', 'button.color': 'blue' }
 *   Step 2: styleXDefineVars       → { 'button.bg': 'var(--x1)', 'button.color': 'var(--x2)', __varGroupHash__: 'xH' }
 *   Step 3: unflattenObject        → { button: { bg: 'var(--x1)', color: 'var(--x2)' }, __varGroupHash__: 'xH' }
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { NestedVarsValue } from './stylex-nested-utils';

import styleXDefineVars from './stylex-define-vars';
import { flattenNestedVarsConfig, unflattenObject } from './stylex-nested-utils';

type NestedVarOutput = string | $ReadOnly<{ +[string]: NestedVarOutput }>;

export default function styleXDefineVarsNested(
  nestedVariables: { +[string]: NestedVarsValue },
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): [$ReadOnly<{ +[string]: NestedVarOutput }>, { [string]: InjectableStyle }] {
  const flatVariables = flattenNestedVarsConfig(nestedVariables);
  const [flatResult, injectableStyles] = styleXDefineVars(flatVariables, options);

  const { __varGroupHash__, ...flatVarRefs } = flatResult;
  // $FlowFixMe[incompatible-type] - unflattenObject preserves string leaf values
  const nestedVarRefs: $ReadOnly<{ +[string]: NestedVarOutput }> = unflattenObject(flatVarRefs);

  return [{ ...nestedVarRefs, __varGroupHash__ }, injectableStyles];
}
