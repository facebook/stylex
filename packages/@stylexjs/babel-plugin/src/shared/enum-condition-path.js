/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Condition } from 'style-value-parser';
import {
  andConditions,
  notCondition,
  simplifyCondition,
  parseAtRule,
  serializeAtRule,
  conditionBranches,
  isTotalMediaCondition,
} from 'style-value-parser';

export type EnumConditionTerm = { +source: string, +negative: boolean };
export type EnumConditionPath = {
  +selector: Condition,
  +atRules: $ReadOnlyArray<string>,
};

export function canNegateEnumCondition(source: string): boolean {
  if (source.startsWith(':')) return true;
  const rule = parseAtRule(source);
  return (
    rule.kind === 'supports' ||
    (rule.kind === 'media' && isTotalMediaCondition(rule.condition))
  );
}

export function normalizeEnumConditions(
  terms: $ReadOnlyArray<EnumConditionTerm>,
): Array<EnumConditionPath> {
  const selectors = [];
  const media: Array<Condition> = [];
  const supports: Array<Condition> = [];
  const containers = [];
  for (const { source, negative } of terms) {
    if (source.startsWith(':')) {
      const atom: Condition = { type: 'atom', value: source };
      selectors.push(negative ? notCondition(atom) : atom);
      continue;
    }
    const rule = parseAtRule(source);
    if (rule.kind === 'container') {
      // Negating a container query doesn't match when no eligible container
      // exists. Retain each positive query and its independent ancestor scope.
      if (negative)
        throw new Error(
          'Container queries require enum resets, not negative guards.',
        );
      containers.push(source);
      continue;
    }
    const target = rule.kind === 'media' ? media : supports;
    target.push(negative ? notCondition(rule.condition) : rule.condition);
  }
  const selector = simplifyCondition(andConditions(selectors), false);
  const mq = simplifyCondition(andConditions(media));
  const sq = simplifyCondition(andConditions(supports), false);
  if (selector === false || mq === false || sq === false) return [];
  const supportRules =
    sq === true
      ? []
      : [serializeAtRule({ kind: 'supports', name: '', condition: sq })];
  let mediaPaths;
  if (mq === true) mediaPaths = [[]];
  else {
    try {
      mediaPaths = [
        [serializeAtRule({ kind: 'media', name: '', condition: mq })],
      ];
    } catch {
      mediaPaths = conditionBranches(mq).map((branch) =>
        branch.map((condition) =>
          serializeAtRule({ kind: 'media', name: '', condition }),
        ),
      );
    }
  }
  return mediaPaths.map((path) => ({
    selector,
    atRules: [...containers, ...supportRules, ...path],
  }));
}

// All condition selectors have zero specificity. The enum compiler orders the
// complete assignment once, using the original StyleX condition priorities.
// Adding a negation must not itself change that order.
export function enumConditionSelector(condition: Condition): string {
  if (condition === true) return '';
  if (condition === false) return ':not(*)';
  if (condition.type === 'atom') return `:where(${condition.value})`;
  if (condition.type === 'not')
    return `:not(${enumConditionSelector(condition.value)})`;
  if (condition.type === 'and')
    return condition.values.map(enumConditionSelector).join('');
  return `:is(${condition.values.map(enumConditionSelector).join(',')})`;
}
