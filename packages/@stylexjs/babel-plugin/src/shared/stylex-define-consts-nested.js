/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableConstStyle, StyleXOptions } from './common-types';
import type { NestedConstsValue } from './stylex-nested-utils';

import styleXDefineConsts from './stylex-define-consts';
import { flattenNestedConstsConfig, unflattenObject } from './stylex-nested-utils';

type NestedConstOutput =
  | string
  | number
  | $ReadOnly<{ +[string]: NestedConstOutput }>;

export default function styleXDefineConstsNested(
  nestedConstants: { +[string]: NestedConstsValue },
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): [$ReadOnly<{ +[string]: NestedConstOutput }>, { [string]: InjectableConstStyle }] {
  const flatConstants = flattenNestedConstsConfig(nestedConstants);
  const [flatResult, injectableStyles] = styleXDefineConsts(flatConstants, options);

  // $FlowFixMe[incompatible-type] - unflattenObject preserves string|number leaf values
  const nestedResult: $ReadOnly<{ +[string]: NestedConstOutput }> = unflattenObject(flatResult);

  return [nestedResult, injectableStyles];
}
