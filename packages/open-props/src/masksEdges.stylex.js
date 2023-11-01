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

type TMasksEdges = $ReadOnly<{
  scoopBottom: string,
  scoopTop: string,
  scoopVertical: string,
  scoopLeft: string,
  scoopRight: string,
  scoopHorizontal: string,
  scalloped: string,
  scallopedBottom: string,
  scallopedTop: string,
  scallopedVertical: string,
  scallopedLeft: string,
  scallopedRight: string,
  scallopedHorizontal: string,
  dripBottom: string,
  dripTop: string,
  dripVertical: string,
  dripLeft: string,
  dripRight: string,
  dripHorizontal: string,
  zigZagTop: string,
  zigZagBottom: string,
  zigZagLeft: string,
  zigZagRight: string,
  zigZagHorizontal: string,
  zigZagVertical: string,
}>;

export const masksEdges: VarGroup<TMasksEdges> = defineVars({
  scoopBottom:
    'radial-gradient(20px at 50% 100%,#0000 97%,#000) 50% / calc(1.9 * 20px) 100%',
  scoopTop:
    'radial-gradient(20px at 50% 0,#0000 97%,#000) 50% / calc(1.9 * 20px) 100%',
  scoopVertical:
    'radial-gradient(20px at 50% 20px,#0000 97%,#000) 50% -20px/ calc(1.9 * 20px) 100%',
  scoopLeft:
    'radial-gradient(20px at 0 50%,#0000 97%,#000) 50%/ 100% calc(1.9 * 20px)',
  scoopRight:
    'radial-gradient(20px at 100% 50%,#0000 97%,#000) 50%/ 100% calc(1.9 * 20px)',
  scoopHorizontal:
    'radial-gradient(20px at 20px 50%,#0000 97%,#000) -20px/ 100% calc(1.9 * 20px)',
  scalloped: `
    radial-gradient(farthest-side,#000 97%,#0000) 0 0 / 20px 20px round,
    linear-gradient(#000 0 0) 50%/calc(100% - 20px) calc(100% - 20px) no-repeat
  `,
  scallopedBottom: `
    linear-gradient(to top,#0000 20px,#000 0),
    radial-gradient(20px at top,#000 97%,#0000) bottom / calc(1.9 * 20px) 20px
  `,
  scallopedTop: `
    linear-gradient(to bottom,#0000 20px,#000 0),
    radial-gradient(20px at bottom,#000 97%,#0000) top / calc(1.9 * 20px) 20px
  `,
  scallopedVertical: `
    linear-gradient(0deg,#0000 calc(2 * 20px),#000 0) 0 20px,
    radial-gradient(20px,#000 97%,#0000) 50% / calc(1.9 * 20px) calc(2 * 20px) repeat space
  `,
  scallopedLeft: `
    linear-gradient(to right,#0000 20px,#000 0),
    radial-gradient(20px at right,#000 97%,#0000) left / 20px calc(1.9 * 20px)
  `,
  scallopedRight: `
    linear-gradient(to left,#0000 20px,#000 0),
    radial-gradient(20px at left,#000 97%,#0000) right / 20px calc(1.9 * 20px)
  `,
  scallopedHorizontal: `
    linear-gradient(-90deg,#0000 calc(2 * 20px),#000 0) 20px,
    radial-gradient(20px,#000 97%,#0000) 50% / calc(2 * 20px) calc(1.9 * 20px) space repeat
  `,
  dripBottom: `
    radial-gradient(20px at bottom,#0000 97%,#000) 50% calc(100% - 20px) / calc(2 * 20px) 100% repeat-x,
    radial-gradient(20px at 25% 50%,#000 97%,#0000) calc(50% - 20px) 99% / calc(4 * 20px) calc(2 * 20px) repeat-x
  `,
  dripTop: `
    radial-gradient(20px at top,#0000 97%,#000) 50% 20px / calc(2 * 20px) 100% repeat-x,
    radial-gradient(20px at 25% 50%,#000 97%,#0000) calc(50% - 20px) 1% / calc(4 * 20px) calc(2 * 20px) repeat-x
  `,
  dripVertical: `
    radial-gradient(20px at top   ,#0000 97%,#000) 50%             20px  / calc(2 * 20px) 51% repeat-x,
    radial-gradient(20px at bottom,#0000 97%,#000) 50% calc(100% - 20px) / calc(2 * 20px) 51% repeat-x,
    radial-gradient(20px at 25% 50%,#000 97%,#0000) calc(50% -   20px) 1%  / calc(4 * 20px) calc(2 * 20px) repeat-x,
    radial-gradient(20px at 25% 50%,#000 97%,#0000) calc(50% - 3*20px) 99% / calc(4 * 20px) calc(2 * 20px) repeat-x
  `,
  dripLeft: `
    radial-gradient(20px at left,#0000 97%,#000) 20px 50% / 100% calc(2 * 20px) repeat-y,
    radial-gradient(20px at 50% 25%,#000 97%,#0000) 1% calc(50% - 20px) / calc(2 * 20px) calc(4 * 20px) repeat-y
  `,
  dripRight: `
    radial-gradient(20px at right,#0000 97%,#000) calc(100% - 20px) 50% / 100% calc(2 * 20px) repeat-y,
    radial-gradient(20px at 50% 25%,#000 97%,#0000) 99% calc(50% - 20px) / calc(2 * 20px) calc(4 * 20px) repeat-y
  `,
  dripHorizontal: `
    radial-gradient(20px at left ,#0000 97%,#000)             20px  50% / 51% calc(2 * 20px) repeat-y,
    radial-gradient(20px at right,#0000 97%,#000) calc(100% - 20px) 50% / 51% calc(2 * 20px) repeat-y,
    radial-gradient(20px at 50% 25%,#000 97%,#0000) 1%  calc(50% -   20px) / calc(2 * 20px) calc(4 * 20px) repeat-y,
    radial-gradient(20px at 50% 25%,#000 97%,#0000) 99% calc(50% - 3*20px) / calc(2 * 20px) calc(4 * 20px) repeat-y
  `,
  zigZagTop:
    'conic-gradient(from 135deg at top,#0000,#000 1deg 90deg,#0000 91deg) 50% / calc(2 * 20px) 100%',
  zigZagBottom:
    'conic-gradient(from -45deg at bottom,#0000,#000 1deg 90deg,#0000 91deg) 50% / calc(2 * 20px) 100%',
  zigZagLeft:
    'conic-gradient(from 45deg at left,#0000,#000 1deg 90deg,#0000 91deg) 50% / 100% calc(2 * 20px)',
  zigZagRight:
    'conic-gradient(from -135deg at right,#0000,#000 1deg 90deg,#0000 91deg) 50% / 100% calc(2 * 20px)',
  zigZagHorizontal: `
    conic-gradient(from   45deg at left ,#0000,#000 1deg 90deg,#0000 91deg) left  / 51% calc(2 * 20px) repeat-y,
    conic-gradient(from -135deg at right,#0000,#000 1deg 90deg,#0000 91deg) right / 51% calc(2 * 20px) repeat-y
  `,
  zigZagVertical: `
    conic-gradient(from 135deg at top   ,#0000,#000 1deg 90deg,#0000 91deg) top    / calc(2 * 20px) 51% repeat-x,
    conic-gradient(from -45deg at bottom,#0000,#000 1deg 90deg,#0000 91deg) bottom / calc(2 * 20px) 51% repeat-x
  `,
});
