/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { PSEUDO_CLASS_PRIORITIES } from '@stylexjs/shared';

const AT_RULES_PRIORITIES = {
  '@supports': 30,
  '@media': 31,
  '@container': 32,
};

export default function getPropertyPriority(key: string): number {
  if (key.startsWith('@')) {
    return AT_RULES_PRIORITIES[key] ?? 30;
  }

  if (key.startsWith('::')) {
    return 5000;
  }

  if (key.startsWith(':')) {
    const prop =
      key.startsWith(':') && key.includes('(')
        ? key.slice(0, key.indexOf('('))
        : key;

    return PSEUDO_CLASS_PRIORITIES[prop] ?? 40;
  }

  return 1;
}
