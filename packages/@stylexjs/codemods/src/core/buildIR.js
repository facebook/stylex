/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * L4 — Build IR. Turns adapter-produced `declarations` (the first seam
 * hand-off) into the neutral FileIR.
 *
 * M1 scope: flat static declarations only — every atom has zero
 * conditions. "The flip" (selector-grouped -> property-grouped condition
 * nesting) lands here in M2; this module's shape is already the flip's
 * home so the seam does not move.
 */

import type { Atom, FileIR, StyleRule } from './ir';

/**
 * One style declaration as handed over by an adapter: no conditions yet
 * (M1), no StyleX knowledge, no AST nodes.
 */
export type Declaration = {
  +property: string,
  +value: string | number,
};

/**
 * One style site as handed over by an adapter: its declarations plus a
 * suggested name (adapter knows labels/component names; core decides the
 * final key).
 */
export type DeclarationGroup = {
  +nameHint: string,
  +declarations: $ReadOnlyArray<Declaration>,
};

export function buildFileIR(groups: $ReadOnlyArray<DeclarationGroup>): FileIR {
  const rules: Array<StyleRule> = groups.map((group) => {
    const atoms: Array<Atom> = group.declarations.map((declaration) => ({
      property: declaration.property,
      conditions: [],
      value: { kind: 'static', value: declaration.value },
    }));
    return { name: group.nameHint, atoms };
  });
  return { rules, keyframes: [] };
}
