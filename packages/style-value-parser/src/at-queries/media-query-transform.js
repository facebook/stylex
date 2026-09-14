/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { deferCondition } from './deferred-condition';
import {
  parseAtRule,
  serializeAtRule,
  subtractAtRule,
} from './condition-at-rule';
import { andConditions, orConditions, simplifyCondition } from './condition';

// Retain the existing ordering entry point. Pseudo-classes and different kinds
// of at-rule use StyleX's existing specificity order, so they need no exclusion.
type StyleValue =
  | null
  | string
  | number
  | $ReadOnlyArray<string | number>
  | StyleObject;

type StyleObject = { +[string]: StyleValue };

type LeafPredicate = (mixed) => boolean;

export function lastMediaQueryWinsTransform(
  styles: StyleObject,
  isLeaf: LeafPredicate = () => false,
): StyleObject {
  return dfsProcessQueries(styles, 0, isLeaf);
}

function isObject(value: StyleValue | void): implies value is StyleObject {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.getPrototypeOf({})
  );
}

// A branch without a default applies only when one of its leaves applies.
// Don't exclude its whole parent condition. Mixed condition contexts cannot be
// folded into a single query; their extra specificity handles the overlap.
function coverage(
  query: string,
  value: StyleValue,
  isLeaf: LeafPredicate,
): string | null {
  if (isLeaf(value) || !isObject(value) || Object.hasOwn(value, 'default'))
    return query;
  if (query.startsWith('var(--')) return null;
  const rule = parseAtRule(query);
  const children = [];
  for (const key of Object.keys(value)) {
    if (!key.startsWith('@' + rule.kind + ' ')) return null;
    const child = coverage(key, value[key], isLeaf);
    if (child == null) return null;
    children.push(parseAtRule(child).condition);
  }
  if (children.length === 0) return null;
  try {
    return serializeAtRule({
      ...rule,
      condition: simplifyCondition(
        andConditions([rule.condition, orConditions(children)]),
        rule.kind === 'media',
      ),
    });
  } catch {
    return null;
  }
}

function dfsProcessQueries(
  obj: StyleObject,
  depth: number,
  isLeaf: LeafPredicate,
): StyleObject {
  if (isLeaf(obj) || !isObject(obj)) return obj;
  const result: { [string]: StyleValue } = {};
  const keys = Object.keys(obj);
  const deferred = depth >= 1 && keys.some((k) => k.includes('var(--'));
  const isAtRule = (key: string): boolean =>
    /^(@(media|supports|container) |var\(--)/.test(key);
  // Validate even a single media query, as before. Unknown features/functions
  // are opaque atoms; only malformed boolean structure is rejected.
  if (depth >= 1)
    keys
      .filter((k) => k.startsWith('@media ') || k.startsWith('@supports '))
      .forEach(parseAtRule);
  for (const key of keys) {
    const value = isObject(obj[key])
      ? dfsProcessQueries(obj[key], depth + 1, isLeaf)
      : obj[key];
    if (deferred && isAtRule(key)) {
      const later = keys
        .slice(keys.indexOf(key) + 1)
        .filter(isAtRule)
        .map((k) => coverage(k, obj[k], isLeaf))
        .filter(Boolean);
      result[deferCondition(key, later)] = value;
      continue;
    }
    if (
      depth < 1 ||
      !(key.startsWith('@media ') || key.startsWith('@supports '))
    ) {
      result[key] = value;
      continue;
    }
    const kind = parseAtRule(key).kind;
    const later = keys
      .slice(keys.indexOf(key) + 1)
      .filter((k) => k.startsWith('@' + kind + ' '))
      .map((k) => coverage(k, obj[k], isLeaf))
      .filter(Boolean);
    for (const chain of subtractAtRule(key, later)) {
      const [first, ...rest] = chain;
      const next = rest.reduceRight<StyleValue>((v, k) => ({ [k]: v }), value);
      const previous = result[first];
      result[first] =
        isObject(previous) && isObject(next) ? { ...previous, ...next } : next;
    }
  }
  return result;
}
