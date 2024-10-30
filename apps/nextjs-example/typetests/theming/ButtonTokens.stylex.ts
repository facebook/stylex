/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { VarGroup } from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';

declare const ButtonTokensTag: unique symbol;
export const ButtonTokens: VarGroup<
  Readonly<{
    bgColor: string;
    color: string;
    height: string;
    opacity: string;
  }>,
  typeof ButtonTokensTag
> = stylex.defineVars({
  bgColor: 'var(--secondary-button-background)',
  color: 'currentcolor',
  height: 'var(--button-height-medium)',
  opacity: '1',
});
