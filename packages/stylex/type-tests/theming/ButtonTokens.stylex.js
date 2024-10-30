/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarGroup } from '../../src/stylex';
import * as stylex from '../../src/stylex';

opaque type TButtonTokens: 'theme' = 'theme';
export const ButtonTokens: VarGroup<
  $ReadOnly<{
    bgColor: string,
    color: string,
    height: string,
    opacity: string,
  }>,
  TButtonTokens,
> = stylex.defineVars({
  bgColor: 'var(--secondary-button-background)',
  color: 'currentcolor',
  height: 'var(--button-height-medium)',
  opacity: '1',
});
