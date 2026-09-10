/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { transform, composeVisitors } from 'lightningcss';
import type {
  CustomAtRules,
  Location2,
  MediaRule,
  Rule,
  SupportsRule,
  TransformOptions,
  TransformResult,
  Visitor,
} from 'lightningcss';
import { tokenize } from '@csstools/css-tokenizer';
import {
  parseAtRule,
  serializeAtRule,
  simplifyCondition,
  andConditions,
} from 'style-value-parser';

type ConditionalRule =
  | { type: 'media', value: MediaRule<> }
  | { type: 'supports', value: SupportsRule<> };

function replaceRules(
  rule: ConditionalRule,
  rules: Array<Rule<>>,
  loc: Location2 = rule.value.loc,
): ConditionalRule {
  if (rule.type === 'media') {
    return { type: 'media', value: { query: rule.value.query, loc, rules } };
  }
  return {
    type: 'supports',
    value: { condition: rule.value.condition, loc, rules },
  };
}

// Let Lightning CSS print and parse its own AST, so this adapter also handles
// value types and future syntax that the shared simplifier treats as opaque.
// The probe is confined to these internal conversions; it never reaches output.
function printPrelude(rule: ConditionalRule): string {
  let replaced = false;
  const result = transform({
    filename: 'condition.css',
    code: Buffer.from('.probe{opacity:1}'),
    visitor: {
      Rule: {
        style(probe: Rule<>) {
          if (replaced) return;
          replaced = true;
          return replaceRules(rule, [probe]);
        },
      },
    },
  }).code.toString();
  const brace = tokenize({ css: result }).find(
    (token) => token[0] === '{-token',
  );
  if (!brace) throw new Error('Unable to print CSS condition');
  return result.slice(0, brace[2]).trim();
}

function parsePrelude(source: string): ConditionalRule {
  let result: ConditionalRule | void;
  const capture = (rule: ConditionalRule): void => {
    result = rule;
  };
  transform({
    filename: 'condition.css',
    code: Buffer.from(source + '{}'),
    visitor: { Rule: { media: capture, supports: capture } },
  });
  if (result == null) throw new Error('Unable to parse CSS condition');
  return result;
}

export function createConditionVisitor<
  C: CustomAtRules = CustomAtRules,
>(): Visitor<C> {
  const printed = new Map<string, string>();
  const parsed = new Map<string, ConditionalRule>();
  const prelude = (rule: ConditionalRule): string => {
    const key = JSON.stringify([
      rule.type,
      rule.type === 'media' ? rule.value.query : rule.value.condition,
    ]);
    const cached = printed.get(key);
    if (cached != null) return cached;
    const result = printPrelude(rule);
    printed.set(key, result);
    return result;
  };
  const visit = (
    rule: ConditionalRule,
  ): ConditionalRule | Array<Rule<>> | void => {
    const source = prelude(rule);
    const original = parseAtRule(source);
    let condition = original.condition;
    let children = rule.value.rules;
    // Nested media queries evaluate against the same environment. Do not do
    // this for container queries, whose independently selected ancestors differ.
    while (rule.type === 'media' && children.length === 1) {
      const child = children[0];
      if (child.type !== 'media') break;
      condition = andConditions([
        condition,
        parseAtRule(prelude(child)).condition,
      ]);
      children = child.value.rules;
    }
    condition = simplifyCondition(condition, rule.type === 'media');
    if (condition === false) return [];
    if (condition === true) return children;
    let next;
    try {
      next = serializeAtRule({ ...original, condition });
    } catch {
      return;
    } // e.g. a conjunction with a negated media type
    if (next === source && children === rule.value.rules) return;
    let nextRule = parsed.get(next);
    if (nextRule == null) {
      nextRule = parsePrelude(next);
      parsed.set(next, nextRule);
    }
    return replaceRules(nextRule, children, rule.value.loc);
  };
  return {
    RuleExit(rule: Rule<>) {
      if (rule.type === 'media' || rule.type === 'supports') return visit(rule);
    },
  };
}

export function simplifyConditions<C: CustomAtRules = CustomAtRules>(
  options: TransformOptions<C>,
): TransformResult {
  const visitor = createConditionVisitor<C>();
  return transform({
    ...options,
    visitor: options.visitor
      ? composeVisitors([visitor, options.visitor])
      : visitor,
  });
}
