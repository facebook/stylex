/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { IncludedStyles } from '../stylex-include';
import * as messages from '../messages';
import { isPlainObject } from '../utils/object-utils';

export function validateNamespace(
  namespace: mixed,
  conditions: $ReadOnlyArray<string> = [],
): void {
  if (!isPlainObject(namespace)) {
    throw new Error(messages.ILLEGAL_NAMESPACE_VALUE);
  }
  const ns: { +[string]: mixed } = namespace;
  for (const key in ns) {
    const val = ns[key];
    if (val === null || typeof val === 'string' || typeof val === 'number') {
      continue;
    }
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v === null || typeof v === 'string' || typeof v === 'number') {
          continue;
        }
        throw new Error(messages.ILLEGAL_PROP_ARRAY_VALUE);
      }
      continue;
    }
    if (val instanceof IncludedStyles) {
      if (conditions.length === 0) {
        continue;
      }
      throw new Error(messages.ONLY_TOP_LEVEL_INCLUDES);
    }
    if (isPlainObject(val)) {
      if (key.startsWith('@') || key.startsWith(':')) {
        if (conditions.includes(key)) {
          throw new Error(messages.DUPLICATE_CONDITIONAL);
        }
        validateNamespace(val, [...conditions, key]);
      } else {
        validateConditionalStyles(val as $FlowFixMe);
      }
      continue;
    }

    throw new Error(messages.ILLEGAL_PROP_VALUE);
  }
}

type ConditionalStyles = $ReadOnly<{
  [key: string]: string | number | ConditionalStyles,
}>;

function validateConditionalStyles(
  val: ConditionalStyles,
  conditions: $ReadOnlyArray<string> = [],
): void {
  for (const [key, v] of Object.entries(val)) {
    if (!(key.startsWith('@') || key.startsWith(':') || key === 'default')) {
      throw new Error(messages.INVALID_PSEUDO_OR_AT_RULE);
    }
    if (conditions.includes(key)) {
      throw new Error(messages.DUPLICATE_CONDITIONAL);
    }
    if (v === null || typeof v === 'string' || typeof v === 'number') {
      continue;
    }
    if (Array.isArray(v)) {
      for (const vv of v) {
        if (vv === null || typeof vv === 'string' || typeof vv === 'number') {
          continue;
        }
        throw new Error(messages.ILLEGAL_PROP_VALUE);
      }
      continue;
    }
    if (v instanceof IncludedStyles) {
      throw new Error(messages.ONLY_TOP_LEVEL_INCLUDES);
    }
    if (isPlainObject(v)) {
      validateConditionalStyles(v, [...conditions, key]);
      continue;
    }
    throw new Error(messages.ILLEGAL_PROP_VALUE);
  }
}
