/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * L5 — Referee. The safety check that makes conditional conversion trustworthy.
 *
 * Emotion emits plain CSS; the browser resolves it by the cascade
 * (specificity, then source order). StyleX resolves atomic classes by a
 * fixed priority number per condition (imported here from
 * `@stylexjs/shared`, never reinvented). StyleX's priorities are DESIGNED to
 * replicate the cascade — so the two agree automatically whenever they
 * differ in specificity. The one place they can DISAGREE is among conditions
 * of EQUAL specificity (e.g. two pseudo-classes both active), where CSS uses
 * source order but StyleX uses its fixed priority.
 *
 * So the rule is: for each property, within each pseudo-element target (a
 * pseudo-element styles a different box, so it never competes with the base
 * element), the order induced by the cascade must match the order induced by
 * StyleX priority. If they match for every property, the conversion renders
 * identically under every combination of active conditions. If any property
 * disagrees, we REFUSE — never emit a confident-but-wrong cascade.
 *
 * Two referees "agree" is proven post-hoc by the semantic-diff gate for the
 * per-coordinate values; this referee covers the thing that gate cannot see:
 * which declaration wins when several are simultaneously active.
 */

import { getPriority } from '@stylexjs/shared';
import type { Atom, Condition, StyleRule } from './ir';
import { conditionKey } from './ir';

export type RefereeResult =
  | { +ok: true, +rule: StyleRule }
  | { +ok: false, +conflicts: $ReadOnlyArray<string> };

/** Sum of StyleX condition priorities for an atom (property base cancels
 * within a property, so it is intentionally omitted). */
function conditionPriority(conditions: $ReadOnlyArray<Condition>): number {
  let total = 0;
  for (const condition of conditions) {
    total += getPriority(conditionKey(condition));
  }
  return total;
}

/** Count of pseudo-classes — the only part of a condition stack that
 * changes CSS specificity among competing (same-box) atoms. */
function pseudoClassCount(conditions: $ReadOnlyArray<Condition>): number {
  return conditions.filter((c) => c.kind === 'pseudo-class').length;
}

/** The pseudo-element a condition stack targets, or '' for the base box.
 * Atoms with different targets never compete. */
function pseudoElementTarget(conditions: $ReadOnlyArray<Condition>): string {
  return conditions
    .filter((c) => c.kind === 'pseudo-element')
    .map(conditionKey)
    .sort()
    .join('');
}

function coordinate(atom: Atom): string {
  return atom.conditions.map(conditionKey).slice().sort().join('&&');
}

/**
 * Checks one rule. On success returns the rule with same-coordinate
 * duplicates collapsed (last-in-source wins, matching both Emotion and
 * StyleX). On conflict returns the offending property coordinates.
 */
export function checkRule(rule: StyleRule): RefereeResult {
  const conflicts: Array<string> = [];

  // Group atoms by property, preserving source order (array order).
  const byProperty: Map<
    string,
    Array<{ +atom: Atom, +order: number }>,
  > = new Map();
  rule.atoms.forEach((atom, order) => {
    const list = byProperty.get(atom.property) ?? [];
    list.push({ atom, order });
    byProperty.set(atom.property, list);
  });

  const keptAtoms: Array<Atom> = [];

  for (const [property, entries] of byProperty) {
    // Collapse same-coordinate duplicates: keep the last in source order.
    const lastByCoord: Map<string, { +atom: Atom, +order: number }> = new Map();
    for (const entry of entries) {
      lastByCoord.set(coordinate(entry.atom), entry);
    }
    const deduped = [...lastByCoord.values()];

    // Partition by pseudo-element target; each box is refereed independently.
    const byTarget: Map<
      string,
      Array<{ +atom: Atom, +order: number }>,
    > = new Map();
    for (const entry of deduped) {
      const target = pseudoElementTarget(entry.atom.conditions);
      const list = byTarget.get(target) ?? [];
      list.push(entry);
      byTarget.set(target, list);
    }

    for (const [, group] of byTarget) {
      // Cascade order: specificity (pseudo-class count) asc, then source order.
      const cascadeOrder = [...group].sort((a, b) => {
        const spec =
          pseudoClassCount(a.atom.conditions) -
          pseudoClassCount(b.atom.conditions);
        return spec !== 0 ? spec : a.order - b.order;
      });
      // StyleX order: condition priority asc, then source order for ties.
      const stylexOrder = [...group].sort((a, b) => {
        const pri =
          conditionPriority(a.atom.conditions) -
          conditionPriority(b.atom.conditions);
        return pri !== 0 ? pri : a.order - b.order;
      });
      // The two orderings must be identical, or some active-condition combo
      // renders differently.
      for (let i = 0; i < cascadeOrder.length; i++) {
        if (cascadeOrder[i].atom !== stylexOrder[i].atom) {
          conflicts.push(
            `'${property}': Emotion source-order and StyleX priority disagree ` +
              'on which conditional value wins when several are active ' +
              `(${group.map((g) => coordinate(g.atom) || 'base').join(' vs ')})`,
          );
          break;
        }
      }
      for (const entry of group) {
        keptAtoms.push(entry.atom);
      }
    }
  }

  if (conflicts.length > 0) {
    return { ok: false, conflicts };
  }
  return { ok: true, rule: { name: rule.name, atoms: keptAtoms } };
}
