/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import CLEAN_ORDER_PRIORITIES from '../reference/cleanOrderPriorities';
import RECESS_ORDER_PRIORITIES from '../reference/recessOrderPriorities';

type PriorityAndType = {
  priority: number,
  type:
    | 'string'
    | 'pseudoClass'
    | 'pseudoElement'
    | 'atRule'
    | 'knownCssProperty',
};

const ORDER_PRIORITIES = {
  default: undefined,
  clean: CLEAN_ORDER_PRIORITIES,
  recess: RECESS_ORDER_PRIORITIES,
};

export default function getPropertyPriorityAndType(
  key: string,
  order: 'default' | 'clean' | 'recess',
): PriorityAndType {
  const BASE_PRIORITY = ORDER_PRIORITIES[order]
    ? ORDER_PRIORITIES[order].length - 1
    : 0;

  const AT_CONTAINER_PRIORITY = BASE_PRIORITY + 300;
  const AT_MEDIA_PRIORITY = BASE_PRIORITY + 200;
  const AT_SUPPORT_PRIORITY = BASE_PRIORITY + 30;
  const PSEUDO_CLASS_PRIORITY = BASE_PRIORITY + 40;
  const PSEUDO_ELEMENT_PRIORITY = BASE_PRIORITY + 5000;

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

  if (ORDER_PRIORITIES[order]) {
    const index = ORDER_PRIORITIES[order].indexOf(key);
    if (index !== -1) {
      return { priority: index, type: 'knownCssProperty' };
    }
  }

  return { priority: 1, type: 'string' };
}
