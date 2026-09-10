/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { transform, composeVisitors } from 'lightningcss';
import { tokenize } from '@csstools/css-tokenizer';
import {
  parseAtRule,
  serializeAtRule,
  simplifyCondition,
  andConditions,
} from 'style-value-parser';

type ConditionalRule = {
  type: 'media' | 'supports',
  value: {
    loc: Object,
    rules: Array<Object>,
    query?: Object,
    condition?: Object,
  },
};

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
        style(probe) {
          if (replaced) return;
          replaced = true;
          return { ...rule, value: { ...rule.value, rules: [probe] } };
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

function parsePrelude(source: string): Object {
  let value;
  const capture = (rule: ConditionalRule) => {
    value = rule.value;
  };
  transform({
    filename: 'condition.css',
    code: Buffer.from(source + '{}'),
    visitor: { Rule: { media: capture, supports: capture } },
  });
  if (value == null) throw new Error('Unable to parse CSS condition');
  return value;
}

export function createConditionVisitor(): Object {
  const printed = new Map<string, string>();
  const parsed = new Map<string, Object>();
  const prelude = (rule: ConditionalRule): string => {
    const key = JSON.stringify([
      rule.type,
      rule.value.query ?? rule.value.condition,
    ]);
    const cached = printed.get(key);
    if (cached != null) return cached;
    const result = printPrelude(rule);
    printed.set(key, result);
    return result;
  };
  const visit = (rule: ConditionalRule): Object | Array<Object> | void => {
    const source = prelude(rule);
    const original = parseAtRule(source);
    let condition = original.condition;
    let children = rule.value.rules;
    // Nested media queries evaluate against the same environment. Do not do
    // this for container queries, whose independently selected ancestors differ.
    while (
      rule.type === 'media' &&
      children.length === 1 &&
      children[0].type === 'media'
    ) {
      const child = children[0];
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
    let value = parsed.get(next);
    if (value == null) {
      value = parsePrelude(next);
      parsed.set(next, value);
    }
    return {
      ...rule,
      value: { ...value, loc: rule.value.loc, rules: children },
    };
  };
  return {
    RuleExit(rule: Object) {
      if (rule.type === 'media' || rule.type === 'supports') return visit(rule);
    },
  };
}

export function simplifyConditions(options: Object): Object {
  const visitor = createConditionVisitor();
  return transform({
    ...options,
    visitor: options.visitor
      ? composeVisitors([visitor, options.visitor])
      : visitor,
  });
}
