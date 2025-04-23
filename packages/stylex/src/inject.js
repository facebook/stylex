/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { createSheet } from './stylesheet/createSheet';
import { addSpecificityLevel } from './stylesheet/utils';

const sheet = createSheet();

export default function inject(cssText: string, priority: number): string {
  const text = addSpecificityLevel(cssText, Math.floor(priority / 1000));
  sheet.insert(text, priority);
  return text;
}
