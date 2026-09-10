/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { CSSToken } from '@csstools/css-tokenizer';
import { tokenize } from '@csstools/css-tokenizer';
import { MediaQuery } from './media-query';

export type Condition =
  | boolean
  | { +type: 'atom', +value: string }
  | { +type: 'not', +value: Condition }
  | { +type: 'and' | 'or', +values: $ReadOnlyArray<Condition> };

// Keep expansion bounded. Falling back to the original expression is always
// preferable to silently dropping a branch or making compilation exponential.
const MAX_BRANCHES = 128;

export function notCondition(value: Condition): Condition {
  if (typeof value === 'boolean') return !value;
  if (value.type === 'not') return value.value;
  return { type: 'not', value };
}

export function andConditions(values: $ReadOnlyArray<Condition>): Condition {
  return { type: 'and', values };
}

export function orConditions(values: $ReadOnlyArray<Condition>): Condition {
  return { type: 'or', values };
}

// Token boundaries matter: commas in functions, escaped identifiers, strings,
// and comments must never become boolean operators.
export function parseCondition(source: string): Condition {
  const text = source.trim();
  const tokens = tokenize({ css: text }).filter(
    (t) => !['EOF-token', 'whitespace-token', 'comment'].includes(t[0]),
  );
  if (tokens.length === 0) throw new Error('Empty CSS condition');
  const stack = [];
  const top = [];
  let outerClose = -1;
  for (const token of tokens) {
    const kind = token[0];
    if (stack.length === 0) top.push(token);
    if (kind === 'function-token' || kind === '(-token') stack.push(')-token');
    else if (kind === '[-token') stack.push(']-token');
    else if ([')-token', ']-token'].includes(kind)) {
      if (stack.pop() !== kind) throw new Error('Unbalanced CSS condition');
      if (stack.length === 0 && outerClose === -1) outerClose = token[3];
    } else if (
      [
        '{-token',
        '}-token',
        'semicolon-token',
        'bad-string-token',
        'bad-url-token',
      ].includes(kind)
    ) {
      throw new Error('Invalid CSS condition');
    }
  }
  if (stack.length !== 0) throw new Error('Unbalanced CSS condition');
  const split = (operators: $ReadOnlyArray<CSSToken>): Array<Condition> => {
    let start = 0;
    return [
      ...operators.map((t) => {
        const part = text.slice(start, t[2]);
        start = t[3] + 1;
        return parseCondition(part);
      }),
      parseCondition(text.slice(start)),
    ];
  };
  const commas = top.filter((t) => t[0] === 'comma-token');
  if (commas.length > 0) return orConditions(split(commas));
  // "not screen and (...)" negates the entire media query, unlike
  // "(not (...)) and (...)". Parse this before splitting conjunctions.
  if (/^not\s+(?:screen|print|all)(?:\s|$)/i.test(text)) {
    return notCondition(parseCondition(text.replace(/^not\s+/i, '')));
  }
  const operators = top.filter(
    (t) => t[0] === 'ident-token' && /^(and|or)$/i.test(t[1]),
  );
  if (operators.length > 0) {
    const op = operators[0][1].toLowerCase();
    if (operators.some((t) => t[1].toLowerCase() !== op)) {
      throw new Error('Mixed CSS condition operators require parentheses');
    }
    return { type: op === 'and' ? 'and' : 'or', values: split(operators) };
  }
  if (/^not\s+/i.test(text))
    return notCondition(parseCondition(text.replace(/^not\s+/i, '')));
  if (tokens[0][0] === '(-token' && outerClose === text.length - 1) {
    const inner = text.slice(1, -1).trim();
    // A parenthesized feature/declaration is an atom. Recurse only into
    // parentheses that group complete boolean expressions.
    if (/^(?:\(|not\s|[a-z-]+\()/i.test(inner)) return parseCondition(inner);
  }
  if (
    tokens[0][0] === '(-token' &&
    tokens.some(
      (t) => t[0] === 'ident-token' && /^(width|height)$/i.test(t[1]),
    ) &&
    tokens.some((t) => t[0] === 'delim-token' && (t[1] === '<' || t[1] === '>'))
  ) {
    try {
      const parsed = MediaQuery.parser.parseToEnd('@media ' + text).queries;
      if (
        parsed.type === 'and' &&
        parsed.rules.every((r) => r.type === 'pair')
      ) {
        return andConditions(
          parsed.rules.map((r) => ({
            type: 'atom',
            value: new MediaQuery(r).toString().slice(7),
          })),
        );
      }
    } catch {
      /* Keep unsupported range syntax opaque. */
    }
  }
  const value = text.replace(/^only\s+(?=screen|print|all)/i, '');
  if (value.toLowerCase() === 'all') return true;
  return { type: 'atom', value };
}

function key(value: Condition): string {
  return JSON.stringify(value);
}

function dnf(
  value: Condition,
  negative: boolean = false,
): Array<Array<Condition>> {
  if (typeof value === 'boolean') return value !== negative ? [[]] : [];
  if (value.type === 'not') return dnf(value.value, !negative);
  if (value.type === 'atom') return [[negative ? notCondition(value) : value]];
  const isAnd = (value.type === 'and') !== negative;
  let result: Array<Array<Condition>> = isAnd ? [[]] : [];
  for (const item of value.values) {
    const branches = dnf(item, negative);
    if (isAnd) {
      if (result.length * branches.length > MAX_BRANCHES)
        throw new Error('Condition expansion limit');
      result = result.flatMap((a) => branches.map((b) => [...a, ...b]));
    } else {
      result.push(...branches);
      if (result.length > MAX_BRANCHES)
        throw new Error('Condition expansion limit');
    }
  }
  return result;
}

type Bound = { dimension: string, unit: string, lower: number, upper: number };

function bound(literal: Condition): Bound | null {
  if (typeof literal === 'boolean') return null;
  const negative = literal.type === 'not';
  const atom = literal.type === 'not' ? literal.value : literal;
  if (typeof atom === 'boolean' || atom.type !== 'atom') return null;
  // Reuse the existing range parser (including its established ±0.01
  // approximation), without asking it to parse unrelated CSS syntax.
  let parsed;
  try {
    parsed = MediaQuery.parser.parseToEnd('@media ' + atom.value).queries;
  } catch {
    return null;
  }
  if (parsed.type !== 'pair' || !/^(min|max)-(width|height)$/.test(parsed.key))
    return null;
  const v = parsed.value;
  if (
    v == null ||
    typeof v !== 'object' ||
    Array.isArray(v) ||
    !Number.isFinite(v.value) ||
    typeof v.unit !== 'string'
  )
    return null;
  const min = parsed.key.startsWith('min-');
  const n = v.value;
  const adjusted = Math.round((n + (min ? -0.01 : 0.01)) * 1e8) / 1e8;
  return {
    dimension: parsed.key.slice(4),
    unit: v.unit.toLowerCase(),
    lower: min !== negative ? (negative ? adjusted : n) : -Infinity,
    upper: min !== negative ? Infinity : negative ? adjusted : n,
  };
}

function simplifyBranch(
  branch: Array<Condition>,
  ranges: boolean,
): Array<Condition> | null {
  const seen = new Set<string>();
  const unique = [];
  let mediaType;
  for (const literal of branch) {
    if (seen.has(key(notCondition(literal)))) return null;
    if (seen.has(key(literal))) continue;
    if (
      typeof literal !== 'boolean' &&
      literal.type === 'atom' &&
      /^(screen|print)$/i.test(literal.value)
    ) {
      const type = literal.value.toLowerCase();
      if (mediaType != null && mediaType !== type) return null;
      mediaType = type;
    }
    seen.add(key(literal));
    unique.push(literal);
  }
  const filtered = unique.filter(
    (literal) =>
      !(
        mediaType != null &&
        typeof literal !== 'boolean' &&
        literal.type === 'not' &&
        typeof literal.value !== 'boolean' &&
        literal.value.type === 'atom' &&
        /^(screen|print)$/i.test(literal.value.value) &&
        literal.value.value.toLowerCase() !== mediaType
      ),
  );
  if (!ranges) return filtered;
  const bounds = filtered.map(bound);
  const units = new Map<string, Set<string>>();
  bounds.forEach((b) => {
    if (b) {
      const set = units.get(b.dimension) ?? new Set();
      set.add(b.unit);
      units.set(b.dimension, set);
    }
  });
  const merged = new Map<string, Bound>();
  const rest = [];
  filtered.forEach((literal, i) => {
    const b = bounds[i];
    if (b == null || units.get(b.dimension)?.size !== 1) {
      rest.push(literal);
      return;
    }
    const prev = merged.get(b.dimension);
    merged.set(
      b.dimension,
      prev
        ? {
            ...b,
            lower: Math.max(prev.lower, b.lower),
            upper: Math.min(prev.upper, b.upper),
          }
        : b,
    );
  });
  const out: Array<Condition> = [];
  for (const dimension of ['width', 'height']) {
    const b = merged.get(dimension);
    if (!b) continue;
    if (b.lower > b.upper) return null;
    if (b.lower !== -Infinity)
      out.push({
        type: 'atom',
        value: `(min-${dimension}: ${b.lower}${b.unit})`,
      });
    if (b.upper !== Infinity)
      out.push({
        type: 'atom',
        value: `(max-${dimension}: ${b.upper}${b.unit})`,
      });
  }
  // Keep media types first; feature order otherwise has no semantic meaning.
  return [
    ...rest.filter(
      (r) =>
        typeof r !== 'boolean' &&
        r.type === 'atom' &&
        /^(screen|print)$/i.test(r.value),
    ),
    ...out,
    ...rest.filter(
      (r) =>
        !(
          typeof r !== 'boolean' &&
          r.type === 'atom' &&
          /^(screen|print)$/i.test(r.value)
        ),
    ),
  ];
}

export function simplifyCondition(
  value: Condition,
  ranges: boolean = true,
): Condition {
  let branches;
  try {
    branches = dnf(value);
  } catch {
    return value;
  }
  const simplified = branches
    .map((b) => simplifyBranch(b, ranges))
    .filter(Boolean);
  // Absorption: A or (A and B) = A. Do not use excluded middle: unknown
  // media/container features obey three-valued logic, so A or not A needn't match.
  const minimal = simplified.filter(
    (branch, i) =>
      !simplified.some(
        (other, j) =>
          j !== i &&
          (other.length < branch.length || j < i) &&
          other.every((literal) => branch.some((v) => key(v) === key(literal))),
      ),
  );
  if (minimal.length === 0) return false;
  if (minimal.some((b) => b.length === 0)) return true;
  const values = minimal.map((b) => (b.length === 1 ? b[0] : andConditions(b)));
  return values.length === 1 ? values[0] : orConditions(values);
}

export function conditionBranches(value: Condition): Array<Array<Condition>> {
  return dnf(value);
}

export function serializeCondition(value: Condition): string {
  if (typeof value === 'boolean') return value ? 'all' : 'not all';
  if (value.type === 'atom') return value.value;
  if (value.type === 'not') {
    const inner = value.value;
    return `(not ${typeof inner !== 'boolean' && (inner.type === 'and' || inner.type === 'or') ? '(' + serializeCondition(inner) + ')' : serializeCondition(inner)})`;
  }
  return value.values
    .map((v) =>
      typeof v !== 'boolean' &&
      (v.type === 'or' || (value.type === 'or' && v.type === 'and'))
        ? '(' + serializeCondition(v) + ')'
        : serializeCondition(v),
    )
    .join(value.type === 'and' ? ' and ' : ' or ');
}

// Unknown media features are not boolean false: "not (future-feature)"
// also fails to match. Only use exclusions with a known, invertible feature.
export function isTotalMediaCondition(condition: Condition): boolean {
  if (typeof condition === 'boolean') return true;
  if (condition.type === 'not') return isTotalMediaCondition(condition.value);
  if (condition.type !== 'atom')
    return condition.values.every(isTotalMediaCondition);
  const text = condition.value;
  if (/^(screen|print)$/i.test(text)) return true;
  if (/^\((color|monochrome|grid|color-index)\)$/i.test(text)) return true;
  if (
    /^\((orientation:\s*(portrait|landscape)|hover:\s*(none|hover)|any-hover:\s*(none|hover)|(any-)?pointer:\s*(none|coarse|fine)|prefers-color-scheme:\s*(light|dark)|prefers-reduced-motion:\s*(reduce|no-preference))\)$/i.test(
      text,
    )
  )
    return true;
  const range = bound(condition);
  return (
    range != null &&
    /^(px|em|rem|cm|mm|in|pt|pc|q|vw|vh|vmin|vmax)$/i.test(range.unit)
  );
}
