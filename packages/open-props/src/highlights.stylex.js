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

const DARK = '@media (prefers-color-scheme: dark)';

const highlightSize = '10px';
const highlightColor = 'hsl(0 0% 0% / 20%)';
const highlightColorDark = 'hsl(0 0% 100% / 20%)';

type THighlights = $ReadOnly<{
  highlightSize: string,
  highlightColor: string,
  highlight: string,
}>;

export const highlights: VarGroup<THighlights> = defineVars({
  highlightSize: highlightSize,
  highlightColor: {
    default: highlightColor,
    [DARK]: highlightColorDark,
  },
  highlight: {
    default: `0 0 0 ${highlightSize} ${highlightColor}`,
    [DARK]: `0 0 0 ${highlightSize} ${highlightColorDark}`,
  },
});
