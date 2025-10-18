/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  default as _getPriority,
  PSEUDO_CLASS_PRIORITIES as _PSEUDO_CLASS_PRIORITIES,
  AT_RULE_PRIORITIES as _AT_RULE_PRIORITIES,
  PSEUDO_ELEMENT_PRIORITY as _PSEUDO_ELEMENT_PRIORITY,
} from './utils/property-priorities';

export const getPriority: typeof _getPriority = _getPriority;

export const PSEUDO_CLASS_PRIORITIES: typeof _PSEUDO_CLASS_PRIORITIES =
  _PSEUDO_CLASS_PRIORITIES;
export const AT_RULE_PRIORITIES: typeof _AT_RULE_PRIORITIES =
  _AT_RULE_PRIORITIES;
export const PSEUDO_ELEMENT_PRIORITY: typeof _PSEUDO_ELEMENT_PRIORITY =
  _PSEUDO_ELEMENT_PRIORITY;
