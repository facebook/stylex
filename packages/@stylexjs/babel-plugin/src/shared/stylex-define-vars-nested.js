/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { NestedVarsValue } from './stylex-nested-utils';

import styleXDefineVars from './stylex-define-vars';
import { flattenNestedVarsConfig, unflattenObject } from './stylex-nested-utils';

export default function styleXDefineVarsNested(
  nestedVariables: { +[string]: NestedVarsValue },
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): [{ [string]: mixed }, { [string]: InjectableStyle }] {
  const flatVariables = flattenNestedVarsConfig(nestedVariables);
  const [flatResult, injectableStyles] = styleXDefineVars(flatVariables, options);

  const { __varGroupHash__, ...flatVarRefs } = flatResult;
  const nestedVarRefs = unflattenObject(flatVarRefs);

  return [{ ...nestedVarRefs, __varGroupHash__ }, injectableStyles];
}
