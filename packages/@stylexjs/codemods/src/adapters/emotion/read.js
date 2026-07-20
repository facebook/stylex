/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L3 — Read. Walks a detected style site's ObjectExpression into neutral
 * declarations (the first seam hand-off). No StyleX knowledge.
 *
 * M2 scope: flat static values AND self-targeting conditions — pseudo-classes
 * (`:hover`), pseudo-elements (`::before`), media queries (`@media`), and
 * their nesting. Refuses (whole file, per M1 policy) anything not provably
 * self-targeting: descendant/combinator/class selectors, functional pseudos
 * (`:not(...)`), conditions nested inside a pseudo-element, and — until the
 * M3 normalizer expands shorthands — a shorthand/longhand overlap the M2
 * referee cannot yet arbitrate.
 */

import type { Condition, Value } from '../../core/ir';
import type { Declaration } from '../../core/buildIR';
import { atomCoordinate } from '../../core/ir';
import type { StyleSite } from './detect';

export type PlainStyleObject = { +[string]: mixed };

export type ReadSite =
  | {
      +ok: true,
      +declarations: Array<Declaration>,
      +cssObject: PlainStyleObject,
      +nameHint: string,
    }
  | { +ok: false, +blocker: string };

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const SIMPLE_PSEUDO_CLASS = /^:[a-zA-Z][a-zA-Z-]*$/;
const SIMPLE_PSEUDO_ELEMENT = /^::[a-zA-Z][a-zA-Z-]*$/;
const AT_RULE = /^@(media|supports|container)\b/;

type Classified =
  | { +role: 'condition', +condition: Condition, +normalizedKey: string }
  | { +role: 'refuse', +reason: string };

/** Classifies an object-valued key as a self-targeting condition or a
 * refusal. Strips a leading `&` (Emotion self-reference). */
function classifyConditionKey(rawKey: string): Classified {
  let key = rawKey.trim();
  if (key.startsWith('&')) {
    key = key.slice(1).trim();
  }
  if (key === '') {
    return { role: 'refuse', reason: 'bare `&` self-reference' };
  }
  if (AT_RULE.test(key)) {
    return {
      role: 'condition',
      condition: { kind: 'at-rule', rule: key },
      normalizedKey: key,
    };
  }
  if (key.startsWith('@')) {
    return { role: 'refuse', reason: `unsupported at-rule '${rawKey}'` };
  }
  if (SIMPLE_PSEUDO_ELEMENT.test(key)) {
    return {
      role: 'condition',
      condition: { kind: 'pseudo-element', name: key },
      normalizedKey: key,
    };
  }
  if (SIMPLE_PSEUDO_CLASS.test(key)) {
    return {
      role: 'condition',
      condition: { kind: 'pseudo-class', name: key },
      normalizedKey: key,
    };
  }
  if (key.startsWith(':')) {
    return {
      role: 'refuse',
      reason: `functional or complex pseudo-selector '${rawKey}'`,
    };
  }
  return {
    role: 'refuse',
    reason: `selector '${rawKey}' is not self-targeting`,
  };
}

function literalValue(node: $FlowFixMe): string | number | null {
  if (
    (node.type === 'Literal' ||
      node.type === 'StringLiteral' ||
      node.type === 'NumericLiteral') &&
    (typeof node.value === 'string' || typeof node.value === 'number')
  ) {
    return node.value;
  }
  if (node.type === 'UnaryExpression' && node.operator === '-') {
    const inner = literalValue(node.argument);
    if (typeof inner === 'number') {
      return -inner;
    }
  }
  return null;
}

/** A property's value: a static literal, or a fallback array of them. */
function valueOf(node: $FlowFixMe): Value | null {
  const literal = literalValue(node);
  if (literal != null) {
    return { kind: 'static', value: literal };
  }
  if (node.type === 'ArrayExpression' && node.elements.length > 0) {
    const values: Array<string | number> = [];
    for (const element of node.elements) {
      const v = literalValue(element);
      if (v == null) {
        return null;
      }
      values.push(v);
    }
    return { kind: 'first-that-works', values };
  }
  return null;
}

function propertyKey(node: $FlowFixMe): string | null {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (
    (node.type === 'Literal' || node.type === 'StringLiteral') &&
    typeof node.value === 'string'
  ) {
    return node.value;
  }
  return null;
}

function plainOf(value: Value): mixed {
  return value.kind === 'first-that-works' ? [...value.values] : value.value;
}

/** Conservative shorthand/longhand overlap within one condition group:
 * `marginTop` extends `margin`. False positives only skip a file (safe);
 * the M2 referee + M3 normalizer replace this with real priority data. */
function findShorthandOverlap(properties: Array<string>): string | null {
  for (const a of properties) {
    for (const b of properties) {
      if (b.length > a.length && b.startsWith(a) && /[A-Z]/.test(b[a.length])) {
        return `'${a}' + '${b}'`;
      }
    }
  }
  return null;
}

export function readSite(site: StyleSite): ReadSite {
  const declarations: Array<Declaration> = [];
  const cssObject: { [string]: mixed } = {};
  let label: string | null = null;

  const walk = (
    objectNode: $FlowFixMe,
    conditions: $ReadOnlyArray<Condition>,
    insidePseudoElement: boolean,
    mirror: { [string]: mixed },
  ): string | null => {
    for (const property of objectNode.properties) {
      if (property.type !== 'Property' && property.type !== 'ObjectProperty') {
        return 'spread in style object';
      }
      if (property.computed) {
        return 'computed key in style object';
      }
      const key = propertyKey(property.key);
      if (key == null) {
        return 'un-analyzable style key';
      }
      const valueNode = property.value;

      if (valueNode.type === 'ObjectExpression') {
        const classified = classifyConditionKey(key);
        if (classified.role === 'refuse') {
          return classified.reason;
        }
        if (insidePseudoElement) {
          return `condition '${key}' nested inside a pseudo-element`;
        }
        const nested: { [string]: mixed } = {};
        mirror[classified.normalizedKey] = nested;
        // insidePseudoElement is always false here (we returned above if it
        // was true), so the new flag is just whether THIS key is one.
        const blocker = walk(
          valueNode,
          [...conditions, classified.condition],
          classified.condition.kind === 'pseudo-element',
          nested,
        );
        if (blocker != null) {
          return blocker;
        }
        continue;
      }

      if (key === 'label' && conditions.length === 0) {
        const literal = literalValue(valueNode);
        if (typeof literal === 'string') {
          label = literal;
          continue; // debugging metadata, not a CSS declaration
        }
      }

      if (!IDENTIFIER.test(key) && !/^[a-zA-Z-]+$/.test(key)) {
        return `un-convertible style key '${key}'`;
      }
      const value = valueOf(valueNode);
      if (value == null) {
        return (
          `value of '${key}' is not a static string/number/fallback-array ` +
          '(dynamic values land in v1.1)'
        );
      }
      declarations.push({ property: key, value, conditions });
      mirror[key] = plainOf(value);
    }
    return null;
  };

  const blocker = walk(site.objectNode, [], false, cssObject);
  if (blocker != null) {
    return { ok: false, blocker };
  }

  if (declarations.length === 0) {
    return { ok: false, blocker: 'empty style object' };
  }

  // Duplicate-coordinate and shorthand-overlap checks, per condition group.
  const byCoordinate: Map<string, Array<string>> = new Map();
  for (const declaration of declarations) {
    const coord = atomCoordinate(
      declaration.property,
      declaration.conditions ?? [],
    );
    const group = byCoordinate.get(coord) ?? [];
    group.push(declaration.property);
    byCoordinate.set(coord, group);
  }
  const seenProps: Map<string, Set<string>> = new Map();
  for (const declaration of declarations) {
    const conditionKey = (declaration.conditions ?? [])
      .map((c) => atomCoordinate('', [c]))
      .join('&&');
    const set = seenProps.get(conditionKey) ?? new Set();
    if (set.has(declaration.property)) {
      return {
        ok: false,
        blocker: `duplicate style key '${declaration.property}'`,
      };
    }
    set.add(declaration.property);
    seenProps.set(conditionKey, set);
  }
  for (const [, group] of seenProps) {
    const overlap = findShorthandOverlap([...group]);
    if (overlap != null) {
      return {
        ok: false,
        blocker: `shorthand/longhand overlap (${overlap}) needs the M2 referee`,
      };
    }
  }

  return {
    ok: true,
    declarations,
    cssObject,
    nameHint: label ?? enclosingComponentName(site) ?? site.tagName,
  };
}

function enclosingComponentName(site: StyleSite): string | null {
  for (let path = site.attrPath; path != null; path = path.parent) {
    const node = path.node;
    if (node.type === 'FunctionDeclaration' && node.id?.name != null) {
      return node.id.name;
    }
    if (
      node.type === 'VariableDeclarator' &&
      node.id?.type === 'Identifier' &&
      (node.init?.type === 'ArrowFunctionExpression' ||
        node.init?.type === 'FunctionExpression')
    ) {
      return node.id.name;
    }
  }
  return null;
}
