/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type Milliseconds = number;

export function parseTimeValue(timeValue: string): Milliseconds {
  const trimmedTimeValue = timeValue.trim().toLowerCase();
  if (trimmedTimeValue.endsWith('ms')) {
    const msVal = parseFloat(trimmedTimeValue.replace(/ms$/, ''));
    return Number.isFinite(msVal) ? msVal : 0;
  }
  if (trimmedTimeValue.endsWith('s')) {
    const sVal = parseFloat(trimmedTimeValue.replace(/s$/, ''));
    return Number.isFinite(sVal) ? sVal * 1000 : 0;
  }
  return 0;
}
