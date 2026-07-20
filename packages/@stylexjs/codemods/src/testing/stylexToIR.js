/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * TEST-ONLY reader: a valid `stylex.create` style object -> IR.
 *
 * This powers the IR-completeness harness: round-tripping StyleX's own
 * valid-input corpus (read -> IR -> re-emit -> still compiles & semantically
 * identical) turns "is the IR complete?" from a claim into a measured
 * coverage percentage. An IR gap found here is SAFE — in the real pipeline
 * the same construct would be flagged, never emitted incorrectly.
 *
 * M2 coverage: flat static values, fallback arrays, AND condition-in-value
 * objects (`{ default, ':hover', '@media …', '::before' }`, including
 * nesting) — the StyleX-side proof that the flip round-trips. `null` values
 * and keyframes are M3 gaps.
 */

import type { Atom, Condition, StyleRule, Value } from '../core/ir';

export class IRCoverageGapError extends Error {
  constructor(message: string) {
    super(`[stylex-codemod ir-completeness] ${message}`);
    this.name = 'IRCoverageGapError';
  }
}

// Builds a properly-typed (string | number)[] from an untyped array, or
// null if any entry is not one of those two types. A plain `.every()`
// predicate does not refine an `Array<mixed>` to
// `Array<string | number>` for Flow, so this does the narrowing by hand.
function toStaticValueArray(
  raw: $ReadOnlyArray<mixed>,
): Array<string | number> | null {
  const values: Array<string | number> = [];
  for (const entry of raw) {
    if (typeof entry !== 'string' && typeof entry !== 'number') {
      return null;
    }
    values.push(entry);
  }
  return values;
}

/** Parses a StyleX condition key into a typed IR condition, or throws. */
function toCondition(context: string, key: string): Condition {
  if (key.startsWith('@')) {
    return { kind: 'at-rule', rule: key };
  }
  if (key.startsWith('::')) {
    return { kind: 'pseudo-element', name: key };
  }
  if (key.startsWith(':')) {
    return { kind: 'pseudo-class', name: key };
  }
  throw new IRCoverageGapError(
    `${context}: unrecognized condition key '${key}'`,
  );
}

/** A static leaf value, or null if not one. */
function toLeafValue(raw: mixed): Value | null {
  if (typeof raw === 'string' || typeof raw === 'number') {
    return { kind: 'static', value: raw };
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const values = toStaticValueArray(raw);
    return values == null ? null : { kind: 'first-that-works', values };
  }
  return null;
}

/** Walks a property's value — a leaf, or a condition object (possibly
 * nested) — emitting one atom per leaf with its accumulated conditions. */
function readProperty(
  context: string,
  property: string,
  raw: mixed,
  conditions: $ReadOnlyArray<Condition>,
  atoms: Array<Atom>,
): void {
  const leaf = toLeafValue(raw);
  if (leaf != null) {
    atoms.push({ property, conditions, value: leaf });
    return;
  }
  if (raw == null || typeof raw !== 'object') {
    throw new IRCoverageGapError(
      `${context}.${property}: value form not representable yet ` +
        '(null/keyframes land in M3)',
    );
  }
  const conditionObject: { +[string]: mixed } = raw;
  for (const key of Object.keys(conditionObject)) {
    if (key === 'default') {
      readProperty(context, property, conditionObject[key], conditions, atoms);
    } else {
      readProperty(
        context,
        property,
        conditionObject[key],
        [...conditions, toCondition(`${context}.${property}`, key)],
        atoms,
      );
    }
  }
}

export function stylexObjectToIR(name: string, styleObject: mixed): StyleRule {
  if (
    styleObject == null ||
    typeof styleObject !== 'object' ||
    Array.isArray(styleObject)
  ) {
    throw new IRCoverageGapError(`'${name}': not a style object`);
  }
  const atoms: Array<Atom> = [];
  for (const property of Object.keys(styleObject)) {
    readProperty(name, property, styleObject[property], [], atoms);
  }
  return { name, atoms };
}
