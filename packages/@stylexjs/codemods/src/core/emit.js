/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * L7 — Emit. Turns the FileIR into the data for a single per-file
 * `stylex.create` registry plus the binding map (the second seam
 * hand-off: rule #N becomes `styles.<key>`).
 *
 * Deliberately AST-free: emit produces plain data; the adapter (which owns
 * the file's AST) renders it. This keeps `core/` blind to parser nodes.
 *
 * Naming (M1 minimal policy, superseded wholesale in M4): the adapter's
 * nameHint (label > enclosing component) is sanitized to a camelCase
 * identifier; collisions get a numeric suffix starting at 2.
 */

import type { FileIR, StyleRule, Value } from './ir';

/**
 * A value in a `stylex.create` entry: a static value, or a fallback array
 * (StyleX's shorthand for `firstThatWorks`).
 */
export type EmittedValue = string | number | $ReadOnlyArray<string | number>;

/** A `stylex.create` entry as plain data: property -> value. */
export type EmittedStyle = { +[property: string]: EmittedValue };

export type EmittedRule = {
  +key: string,
  +style: EmittedStyle,
};

export type EmitResult = {
  +rules: $ReadOnlyArray<EmittedRule>,
  /** bindings[i] is the create key for FileIR.rules[i]. */
  +bindings: $ReadOnlyArray<string>,
};

export class EmitError extends Error {
  constructor(message: string) {
    super(`[stylex-codemod emit] ${message}`);
    this.name = 'EmitError';
  }
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED = new Set(['default', 'delete', 'do', 'in', 'new', 'var']);

/** Sanitizes an adapter name hint into a usable create key. */
export function sanitizeKey(hint: string): string {
  const cleaned = hint
    .replace(/[^A-Za-z0-9_$]+(.)?/g, (_, next: string | void) =>
      next == null ? '' : next.toUpperCase(),
    )
    .replace(/^[0-9]+/, '');
  const key =
    cleaned === '' ? 'styles' : cleaned[0].toLowerCase() + cleaned.slice(1);
  return IDENTIFIER.test(key) && !RESERVED.has(key) ? key : 'styles';
}

function emitValue(value: Value, rule: StyleRule): EmittedValue {
  if (value.kind === 'first-that-works') {
    return value.values;
  }
  if (value.kind !== 'static' || value.value == null) {
    throw new EmitError(
      `rule '${rule.name}': only static non-null values are emittable in M1`,
    );
  }
  return value.value;
}

export function emitFileIR(ir: FileIR): EmitResult {
  const usedKeys = new Set<string>();
  const rules: Array<EmittedRule> = [];
  const bindings: Array<string> = [];

  for (const rule of ir.rules) {
    const unsorted: { [string]: EmittedValue } = {};
    for (const atom of rule.atoms) {
      if (atom.conditions.length > 0) {
        throw new EmitError(
          `rule '${rule.name}': conditions are not emittable until M2`,
        );
      }
      if (unsorted[atom.property] !== undefined) {
        throw new EmitError(
          `rule '${rule.name}': duplicate property '${atom.property}'`,
        );
      }
      unsorted[atom.property] = emitValue(atom.value, rule);
    }
    // Alphabetical property order satisfies stylex/sort-keys with zero
    // autofixes. Safe in M1: flat longhands are order-independent, and the
    // order-DEPENDENT cases (duplicates, shorthand/longhand overlap) are
    // refused upstream. M4's scoped verifyAndFix supersedes this.
    const style: { [string]: EmittedValue } = {};
    for (const property of Object.keys(unsorted).sort()) {
      style[property] = unsorted[property];
    }

    const base = sanitizeKey(rule.name);
    let key = base;
    for (let n = 2; usedKeys.has(key); n++) {
      key = `${base}${n}`;
    }
    usedKeys.add(key);
    rules.push({ key, style });
    bindings.push(key);
  }

  if (ir.keyframes.length > 0) {
    throw new EmitError('keyframes are not emittable until M3');
  }
  return { rules, bindings };
}
