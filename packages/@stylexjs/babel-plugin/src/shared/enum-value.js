/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { EnumBranch } from './enum-condition-negation';
import { tokenize } from '@csstools/css-tokenizer';
import { parseAtRule, parseCondition } from 'style-value-parser';

function validateCondition(source: string): void {
  if (source.includes('var(--'))
    throw new Error(
      'Enum override conditions cannot use defineConsts keys yet.',
    );
  if (source.startsWith('@')) {
    parseAtRule(source);
    return;
  }
  if (
    !source.startsWith(':') ||
    source.includes('::') ||
    /:visited\b/.test(source)
  ) {
    throw new Error(
      'Enum overrides support at-rules and pseudo-classes, excluding pseudo-elements and :visited.',
    );
  }
  parseCondition(source); // Check balanced functions and reject rule injection.
  let depth = 0;
  for (const token of tokenize({ css: source.trim() })) {
    if (
      depth === 0 &&
      ['whitespace-token', 'comma-token', 'delim-token'].includes(token[0])
    ) {
      throw new Error(
        'Enum pseudo-class conditions must select the current element.',
      );
    }
    if (
      token[0] === 'function-token' ||
      token[0] === '(-token' ||
      token[0] === '[-token'
    )
      depth++;
    else if (token[0] === ')-token' || token[0] === ']-token') depth--;
  }
}

export function enumValueBranches(
  value: mixed,
  validateState: (mixed) => string | boolean,
): Array<EnumBranch> {
  const branches: Array<EnumBranch> = [];
  function visit(value: mixed, conditions: Array<string>, root: boolean): void {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      const object: { +[string]: mixed } = value;
      if (root && !Object.hasOwn(object, 'default'))
        throw new Error(
          'Conditional enum values require a top-level default state.',
        );
      if (Object.hasOwn(object, 'default'))
        branches.push({
          value: validateState(object.default),
          conditions,
        });
      for (const [condition, child] of Object.entries(object)) {
        if (condition === 'default') continue;
        validateCondition(condition);
        if (conditions.includes(condition))
          throw new Error(
            'An enum condition cannot be repeated in the same branch.',
          );
        visit(child, [...conditions, condition], false);
      }
      return;
    }
    branches.push({ value: validateState(value), conditions });
  }
  visit(value, [], true);
  return branches;
}
