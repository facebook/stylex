/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { styleSheet } from './StyleXSheet';

export default function inject(
  ltrRule: string,
  priority: number,
  rtlRule: ?string = null,
): void {
  styleSheet.insert(ltrRule, priority, rtlRule);
}
