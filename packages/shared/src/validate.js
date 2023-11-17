/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TRawValue } from './common-types';

export default function validateEntry([key, value]: [string, TRawValue]) {
  if (Array.isArray(value)) {
    value.forEach((val) => validateSimplyEntry([key, val]));
  } else {
    validateSimplyEntry([key, value]);
  }
}

function validateSimplyEntry([key, _value]: [string, string | number]) {
  if (BANNED_KEYS.has(key)) {
    throw new Error('Banned key: ' + key);
  }
}

const BANNED_KEYS = new Set(['background', 'transition', 'grid']);
