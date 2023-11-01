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

const gridAdaptMixinViewportContext = '100vw';
const gridAdaptMixinBreak1 = '1024px';
const gridAdaptMixinBreak2 = '480px';
const aboveBreak1Columns = '5';
const aboveBreak2Columns = '2';

type TLayouts = $ReadOnly<{
  gridCell: string,
  gridCellName: string,

  gridRam: string,
  gridHolyGrail: string,
  gridAdaptMixinViewportContext: string,
  gridAdaptMixinContainerContext: string,
  gridAdaptMixinContext: string,

  gridAdaptMixinBreak1: string,
  aboveBreak1Columns: string,
  gridAdaptMixinBreak2: string,
  aboveBreak2Columns: string,
  gridAdaptMixin: string,
}>;

export const layouts: VarGroup<TLayouts> = defineVars({
  gridCell: '[stack] 1fr / [stack] 1fr',
  gridCellName: 'stack',

  gridRam: 'repeat(auto-fit, minmax(min(0, 100%), 1fr))',
  gridHolyGrail: 'auto 1fr auto / auto 1fr auto',
  gridAdaptMixinViewportContext: gridAdaptMixinViewportContext,
  gridAdaptMixinContainerContext: '100%',
  gridAdaptMixinContext: gridAdaptMixinViewportContext,

  gridAdaptMixinBreak1: gridAdaptMixinBreak1,
  aboveBreak1Columns: aboveBreak1Columns,
  gridAdaptMixinBreak2: gridAdaptMixinBreak2,
  aboveBreak2Columns: aboveBreak2Columns,
  gridAdaptMixin: `repeat(auto-fill,
        minmax(
          clamp(
            clamp(
              calc(100% / calc(${aboveBreak1Columns} + 1) + 0.1%),
              calc(calc(${gridAdaptMixinBreak1} - ${gridAdaptMixinViewportContext}) * 1e5),
              calc(100% / calc(${aboveBreak2Columns} + 1) + 0.1%)
            ),
            calc(calc(${gridAdaptMixinBreak2} - ${gridAdaptMixinViewportContext}) * 1e5),
            100%
          ),
        1fr)
    )`,
});
