/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

type PriorityAndType = {
  priority: number,
  type: 'string' | 'pseudoClass' | 'pseudoElement' | 'atRule',
};

export default function getPropertyPriorityAndType(
  key: string,
): PriorityAndType {
  if (key.startsWith('@supports')) {
    return { priority: 30, type: 'atRule' };
  }

  if (key.startsWith('::')) {
    return { priority: 5000, type: 'pseudoElement' };
  }

  if (key.startsWith(':')) {
    // TODO: Consider restoring pseudo-specific priorities
    return {
      priority: 40,
      type: 'pseudoClass',
    };
  }

  if (key.startsWith('@media')) {
    return { priority: 200, type: 'atRule' };
  }

  if (key.startsWith('@container')) {
    return { priority: 30, type: 'atRule' };
  }

  return { priority: 1, type: 'string' };
}
