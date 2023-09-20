/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from '@stylexjs/shared/lib/common-types';

export type RuntimeOptions = {
  ...$Exact<StyleXOptions>,
  // This is mostly needed for just testing
  insert?: (
    key: string,
    ltrRule: string,
    priority: number,
    rtlRule?: ?string,
  ) => void,
  ...
};
