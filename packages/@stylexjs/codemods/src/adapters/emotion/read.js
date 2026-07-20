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
 * M1 scope: flat static string/number values only. Condition keys
 * (':hover', '@media …', '&…'), nested objects, spreads, computed keys and
 * non-literal values are blockers. A shorthand/longhand overlap inside one
 * object (e.g. `margin` + `marginTop`) is refused until the M2 referee can
 * arbitrate it — the exact bug class the old attempt shipped.
 */

import type { Declaration } from '../../core/buildIR';
import type { StyleSite } from './detect';

export type PlainStyleObject = { +[string]: string | number };

export type ReadSite =
  | {
      +ok: true,
      +declarations: Array<Declaration>,
      +cssObject: PlainStyleObject,
      +nameHint: string,
    }
  | { +ok: false, +blocker: string };

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

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

function propertyKey(node: $FlowFixMe): string | null {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (
    (node.type === 'Literal' || node.type === 'StringLiteral') &&
    typeof node.value === 'string' &&
    IDENTIFIER.test(node.value)
  ) {
    return node.value;
  }
  return null;
}

/**
 * Conservative shorthand/longhand overlap check: `marginTop` overlaps
 * `margin` because it extends it with a capitalized segment. Errs toward
 * false positives (`border` vs `borderRadius`) — a false positive skips a
 * file (safe); the M2 referee replaces this with real priority data from
 * `@stylexjs/shared`.
 */
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
  const cssObject: { [string]: string | number } = {};
  let label: string | null = null;

  for (const property of site.objectNode.properties) {
    if (property.type !== 'Property' && property.type !== 'ObjectProperty') {
      return { ok: false, blocker: 'spread in style object' };
    }
    if (property.computed) {
      return { ok: false, blocker: 'computed key in style object' };
    }
    const key = propertyKey(property.key);
    if (key == null) {
      return {
        ok: false,
        blocker:
          `style key ${describeKey(property.key)} is not convertible yet ` +
          '(conditions land in M2, kebab-case keys in M3)',
      };
    }
    const value = literalValue(property.value);
    if (value == null) {
      return {
        ok: false,
        blocker:
          `value of '${key}' is not a static string/number ` +
          '(nested conditions land in M2; dynamic values in v1.1)',
      };
    }
    if (key === 'label' && typeof value === 'string') {
      label = value;
      continue; // debugging metadata, not a CSS declaration
    }
    if (cssObject[key] !== undefined) {
      return { ok: false, blocker: `duplicate style key '${key}'` };
    }
    declarations.push({ property: key, value });
    cssObject[key] = value;
  }

  if (declarations.length === 0) {
    return { ok: false, blocker: 'empty style object' };
  }
  const overlap = findShorthandOverlap(declarations.map((d) => d.property));
  if (overlap != null) {
    return {
      ok: false,
      blocker: `shorthand/longhand overlap (${overlap}) needs the M2 referee`,
    };
  }

  return {
    ok: true,
    declarations,
    cssObject,
    nameHint: label ?? enclosingComponentName(site) ?? site.tagName,
  };
}

function describeKey(node: $FlowFixMe): string {
  return typeof node.value === 'string' ? `'${node.value}'` : `<${node.type}>`;
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
