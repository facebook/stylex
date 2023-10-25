/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineVars } from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

const highlightSize = '10px';
const highlightColor = 'hsl(0 0% 0% / 20%)';
const highlightColordark = 'hsl(0 0% 100% / 20%)';

export const highlights = defineVars({
  highlightSize: highlightSize,
  highlightColor: {
    default: highlightColor,
    [DARK]: highlightColordark,
  },
  highlight: {
    default: `
    0 0 0
    ${highlightSize}
    ${highlightColor}
  `,
    [DARK]: `
  0 0 0
  ${highlightSize}
  ${highlightColorDark}
`,
  },
});
