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

type TMasksCornerCuts = $ReadOnly<{
  circles1: string,
  circles2: string,
  circles3: string,
  squares1: string,
  squares2: string,
  squares3: string,
  angles1: string,
  angles2: string,
  angles3: string,
}>;

export const masksCornerCuts: VarGroup<TMasksCornerCuts> = defineVars({
  circles1: 'radial-gradient(1rem at 1rem 1rem,#0000 99%,#000) -1rem -1rem',
  circles2: 'radial-gradient(2rem at 2rem 2rem,#0000 99%,#000) -2rem -2rem',
  circles3: 'radial-gradient(4rem at 4rem 4rem,#0000 99%,#000) -4rem -4rem',
  squares1:
    'conic-gradient(at calc(2 * 1rem) calc(2 * 1rem), #000 75%, #0000 0) -1rem -1rem',
  squares2:
    'conic-gradient(at calc(2 * 2rem) calc(2 * 2rem), #000 75%, #0000 0) -2rem -2rem',
  squares3:
    'conic-gradient(at calc(2 * 4rem) calc(2 * 4rem), #000 75%, #0000 0) -4rem -4rem',
  angles1: `
      conic-gradient(from -45deg at 1rem 1rem, #0000 25%, #000 0)
      -1rem 0 / 100% 51% repeat-x,
      conic-gradient(from 135deg at 1rem calc(100% - 1rem), #0000 25%, #000 0)
      -1rem 100% / 100% 51% repeat-x
    `,
  angles2: `
      conic-gradient(from -45deg at 2rem 2rem, #0000 25%, #000 0)
      -2rem 0 / 100% 51% repeat-x,
      conic-gradient(from 135deg at 2rem calc(100% - 2rem), #0000 25%, #000 0)
      -2rem 100% / 100% 51% repeat-x
    `,
  angles3: `
      conic-gradient(from -45deg at 4rem 4rem, #0000 25%, #000 0)
      -4rem 0 / 100% 51% repeat-x,
      conic-gradient(from 135deg at 4rem calc(100% - 4rem), #0000 25%, #000 0)
      -4rem 100% / 100% 51% repeat-x
    `,
});
