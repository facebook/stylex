/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * L6 — Normalize. Value & vocabulary normalization on the IR.
 *
 * M3a: physical → logical property mapping (`marginLeft` →
 * `marginInlineStart`, `left` → `insetInlineStart`, …). This is a
 * DELIBERATE, doc-sanctioned RTL behavior change — in a right-to-left
 * document the logical property flips side where the physical one would
 * not. It is covered by the semantic-diff gate's physical→logical allowlist
 * (which proves LTR-equivalence), and it matches StyleX's own preference
 * for logical properties. On by default; disable with
 * `{ logicalProperties: false }` (full config lands in M6).
 *
 * Runs BEFORE the referee so all downstream layers see one consistent
 * vocabulary. Only the inline-axis pairs are mapped — block-axis (`top`,
 * `bottom`) does not flip in RTL and is left physical.
 *
 * Later M3 slices add here: multi-value shorthand expansion
 * (`style-value-parser`) and unitless handling.
 */

import type { Atom, FileIR, StyleRule } from './ir';

export type NormalizeOptions = {
  /** Map inline-axis physical properties to logical ones (default true). */
  +logicalProperties?: boolean,
};

/** Inline-axis physical → logical property names (camelCase, matching the
 * semantic-diff gate's allowlist). Block-axis stays physical (no RTL flip). */
const PHYSICAL_TO_LOGICAL: $ReadOnly<{ [string]: string }> = {
  marginLeft: 'marginInlineStart',
  marginRight: 'marginInlineEnd',
  paddingLeft: 'paddingInlineStart',
  paddingRight: 'paddingInlineEnd',
  left: 'insetInlineStart',
  right: 'insetInlineEnd',
};

export function normalizeFileIR(
  ir: FileIR,
  options?: NormalizeOptions,
): FileIR {
  const logical = options?.logicalProperties ?? true;
  if (!logical) {
    return ir;
  }
  const rules: $ReadOnlyArray<StyleRule> = ir.rules.map((rule) => ({
    name: rule.name,
    atoms: rule.atoms.map((atom: Atom) => {
      const mapped = PHYSICAL_TO_LOGICAL[atom.property];
      return mapped == null ? atom : { ...atom, property: mapped };
    }),
  }));
  return { rules, keyframes: ir.keyframes };
}
