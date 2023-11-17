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

type TSvg = $ReadOnly<{
  squircle1: string,
  squircle2: string,
  squircle3: string,
}>;

export const svg: VarGroup<TSvg> = defineVars({
  squircle1:
    "url(\"data:image/svg+xml,%3Csvg viewbox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d=' M 0, 75 C 0, 18.75 18.75, 0 75, 0 S 150, 18.75 150, 75 131.25, 150 75, 150 0, 131.25 0, 75 ' fill='%23FADB5F' transform='rotate( 0, 100, 100 ) translate( 25 25 )'%3E%3C/path%3E%3C/svg%3E\")",
  squircle2:
    "url(\"data:image/svg+xml,%3Csvg viewbox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d=' M 0, 75 C 0, 13.500000000000004 13.500000000000004, 0 75, 0 S 150, 13.500000000000004 150, 75 136.5, 150 75, 150 0, 136.5 0, 75 ' fill='%23FADB5F' transform='rotate( 0, 100, 100 ) translate( 25 25 )'%3E%3C/path%3E%3C/svg%3E\")",
  squircle3:
    "url(\"data:image/svg+xml,%3Csvg viewbox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d=' M 0, 75 C 0, 5.999999999999997 5.999999999999997, 0 75, 0 S 150, 5.999999999999997 150, 75 144, 150 75, 150 0, 144 0, 75 ' fill='%23FADB5F' transform='rotate( 0, 100, 100 ) translate( 25 25 )'%3E%3C/path%3E%3C/svg%3E\")",
});
