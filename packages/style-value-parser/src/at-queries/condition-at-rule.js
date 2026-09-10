/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Condition } from './condition';
import {
  andConditions,
  notCondition,
  parseCondition,
  simplifyCondition,
  serializeCondition,
  conditionBranches,
  isTotalMediaCondition,
} from './condition';

export type AtRule = {
  +kind: 'media' | 'supports' | 'container',
  +name: string,
  +condition: Condition,
};

export function parseAtRule(source: string): AtRule {
  const match = /^@(media|supports|container)\s+([\s\S]+)$/.exec(source.trim());
  if (!match) throw new Error(`Unsupported conditional at-rule: ${source}`);
  const kind = match[1];
  let text = match[2];
  let name = '';
  if (kind === 'container') {
    const named =
      /^([a-zA-Z_][\w-]*)\s+(?=\(|not\s|style\(|scroll-state\()/.exec(text);
    if (named && named[1] !== 'not') {
      name = named[1];
      text = text.slice(named[0].length);
    }
  }
  return {
    kind:
      kind === 'media'
        ? 'media'
        : kind === 'supports'
          ? 'supports'
          : 'container',
    name,
    condition: parseCondition(text),
  };
}

export function serializeAtRule(rule: AtRule): string {
  const prefix = `@${rule.kind}${rule.name ? ' ' + rule.name : ''} `;
  const c = rule.condition;
  if (typeof c === 'boolean') {
    if (rule.kind === 'media') return prefix + (c ? 'all' : 'not all');
    throw new Error(
      'A constant condition must retain its original at-rule context',
    );
  }
  if (rule.kind !== 'media') {
    const text = serializeCondition(c);
    return prefix + (c.type === 'not' ? text.slice(1, -1) : text);
  }
  const branches = conditionBranches(c);
  return (
    prefix +
    branches
      .map((branch) => {
        const type = branch.find(
          (b) =>
            typeof b !== 'boolean' &&
            b.type === 'atom' &&
            /^(screen|print)$/i.test(b.value),
        );
        const negativeType = branch.find(
          (b) =>
            typeof b !== 'boolean' &&
            b.type === 'not' &&
            typeof b.value !== 'boolean' &&
            b.value.type === 'atom' &&
            /^(screen|print)$/i.test(b.value.value),
        );
        if (negativeType != null) {
          if (branch.length !== 1)
            throw new Error('A negated media type needs a separate at-rule');
          return serializeCondition(negativeType).slice(1, -1);
        }
        const others = branch.filter((b) => b !== type);
        const body = others.map(serializeCondition).join(' and ');
        const media = type != null ? serializeCondition(type) : '';
        return [media, body].filter(Boolean).join(' and ') || 'all';
      })
      .join(', ')
  );
}

// A public shared operation for both early compilation and late CSS visitors.
// Container conditions retain their feature set: removing an axis can change
// which ancestor is eligible to be the query container.
export function simplifyAtRule(source: string): string {
  const rule = parseAtRule(source);
  if (rule.kind === 'container') return source;
  const condition = simplifyCondition(rule.condition, rule.kind === 'media');
  try {
    return serializeAtRule({ ...rule, condition });
  } catch {
    return source;
  }
}

export function subtractAtRule(
  source: string,
  excluded: $ReadOnlyArray<string>,
): $ReadOnlyArray<$ReadOnlyArray<string>> {
  const current = parseAtRule(source);
  const compatible = [];
  for (const other of excluded) {
    const parsed = parseAtRule(other);
    if (
      parsed.kind !== current.kind ||
      parsed.name !== current.name ||
      current.kind === 'container'
    )
      continue;
    if (current.kind === 'media' && !isTotalMediaCondition(parsed.condition))
      continue;
    compatible.push(parsed.condition);
  }
  if (compatible.length === 0) return [[simplifyAtRule(source)]];
  const condition = simplifyCondition(
    andConditions([current.condition, ...compatible.map(notCondition)]),
    current.kind === 'media',
  );
  if (condition === false) return [['@media not all']];
  try {
    return [[serializeAtRule({ ...current, condition })]];
  } catch {
    // Separate a negated media type from feature conditions. CSS's "not
    // screen and X" negates the whole query, so it cannot encode !screen && X.
    return conditionBranches(condition).map((branch) =>
      branch.map((literal) =>
        serializeAtRule({ ...current, condition: literal }),
      ),
    );
  }
}
