/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarGroup } from '@stylexjs/stylex/lib/StyleXTypes';

import { defineVars } from '@stylexjs/stylex';

type TZindex = $ReadOnly<{
  layer1: number,
  layer2: number,
  layer3: number,
  layer4: number,
  layer5: number,
  layerImportant: number,
}>;

export const zIndex: VarGroup<TZindex> = defineVars({
  layer1: 1,
  layer2: 2,
  layer3: 3,
  layer4: 4,
  layer5: 5,
  layerImportant: 2147483647,
});
