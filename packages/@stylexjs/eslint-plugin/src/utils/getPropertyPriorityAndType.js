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

const AT_CONTAINER_PRIORITY = 300;
const AT_MEDIA_PRIORITY = 200;
const AT_SUPPORT_PRIORITY = 30;
const PSEUDO_CLASS_PRIORITY = 40;
const PSEUDO_ELEMENT_PRIORITY = 5000;

export default function getPropertyPriorityAndType(
  key: string,
): PriorityAndType {
  if (key.startsWith('@supports')) {
    return { priority: AT_SUPPORT_PRIORITY, type: 'atRule' };
  }

  if (key.startsWith('::')) {
    return { priority: PSEUDO_ELEMENT_PRIORITY, type: 'pseudoElement' };
  }

  if (key.startsWith(':')) {
    // TODO: Consider restoring pseudo-specific priorities
    return {
      priority: PSEUDO_CLASS_PRIORITY,
      type: 'pseudoClass',
    };
  }

  if (key.startsWith('@media')) {
    return { priority: AT_MEDIA_PRIORITY, type: 'atRule' };
  }

  if (key.startsWith('@container')) {
    return { priority: AT_CONTAINER_PRIORITY, type: 'atRule' };
  }

  return { priority: 1, type: 'string' };
}
