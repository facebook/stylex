/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import {
  getAtRulePriority,
  getPseudoElementPriority,
  getPseudoClassPriority,
  getDefaultPriority,
} from '@stylexjs/shared';

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
  const orderPriority = ORDER_PRIORITIES[order]
    ? ORDER_PRIORITIES[order].length - 1
    : 0;

  const atRulePriority = getAtRulePriority(key);
  if (atRulePriority) {
    return {
      priority: orderPriority + atRulePriority,
      type: 'atRule',
    };
  }

  const pseudoElementPriority = getPseudoElementPriority(key);
  if (pseudoElementPriority) {
    return {
      priority: orderPriority + pseudoElementPriority,
      type: 'pseudoElement',
    };
  }

  const pseudoClassPriority = getPseudoClassPriority(key);
  if (pseudoClassPriority) {
    return {
      priority: orderPriority + pseudoClassPriority,
      type: 'pseudoClass',
    };
  }

  if (order === 'default') {
    const defaultPriority = getDefaultPriority(
      key.replace(/[A-Z]/g, '-$&').toLowerCase(),
    );
    if (defaultPriority) {
      return { priority: defaultPriority, type: 'knownCssProperty' };
    }
  } else if (ORDER_PRIORITIES[order]) {
    const index = ORDER_PRIORITIES[order].indexOf(key);
    if (index !== -1) {
      return { priority: index, type: 'knownCssProperty' };
    }
  }

  return { priority: 1, type: 'string' };
}
