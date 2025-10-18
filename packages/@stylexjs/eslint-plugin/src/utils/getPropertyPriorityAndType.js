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
  PSEUDO_CLASS_PRIORITIES,
  AT_RULE_PRIORITIES,
  PSEUDO_ELEMENT_PRIORITY,
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
  const BASE_PRIORITY = ORDER_PRIORITIES[order]
    ? ORDER_PRIORITIES[order].length - 1
    : 0;

  if (key.startsWith('@supports')) {
    return {
      priority: BASE_PRIORITY + AT_RULE_PRIORITIES['@supports'],
      type: 'atRule',
    };
  }

  if (key.startsWith('::')) {
    return {
      priority: BASE_PRIORITY + PSEUDO_ELEMENT_PRIORITY,
      type: 'pseudoElement',
    };
  }

  if (key.startsWith(':')) {
    const prop =
      key.startsWith(':') && key.includes('(')
        ? key.slice(0, key.indexOf('('))
        : key;

    return {
      priority: PSEUDO_CLASS_PRIORITIES[prop] ?? 40,
      type: 'pseudoClass',
    };
  }

  if (key.startsWith('@media')) {
    return {
      priority: BASE_PRIORITY + AT_RULE_PRIORITIES['@media'],
      type: 'atRule',
    };
  }

  if (key.startsWith('@container')) {
    return {
      priority: BASE_PRIORITY + AT_RULE_PRIORITIES['@container'],
      type: 'atRule',
    };
  }

  if (ORDER_PRIORITIES[order]) {
    const index = ORDER_PRIORITIES[order].indexOf(key);
    if (index !== -1) {
      return { priority: index, type: 'knownCssProperty' };
    }
  }

  return { priority: 1, type: 'string' };
}
