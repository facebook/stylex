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
 * M1 coverage: flat static values and fallback arrays. Condition objects
 * (pseudo/at-rule keys or condition-in-value objects) are M2 gaps; null
 * values and keyframes are M3 gaps.
 */

import type { Atom, StyleRule } from '../core/ir';

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
    const raw = styleObject[property];
    if (typeof raw === 'string' || typeof raw === 'number') {
      atoms.push({
        property,
        conditions: [],
        value: { kind: 'static', value: raw },
      });
    } else if (Array.isArray(raw) && raw.length > 0) {
      const values = toStaticValueArray(raw);
      if (values == null) {
        throw new IRCoverageGapError(
          `'${name}.${property}': fallback array contains a non-static entry`,
        );
      }
      atoms.push({
        property,
        conditions: [],
        value: { kind: 'first-that-works', values },
      });
    } else {
      throw new IRCoverageGapError(
        `'${name}.${property}': value form not representable yet ` +
          '(conditions land in M2, null/keyframes in M3)',
      );
    }
  }
  return { name, atoms };
}
