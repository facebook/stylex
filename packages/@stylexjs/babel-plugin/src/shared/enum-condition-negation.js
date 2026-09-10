/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  EnumConditionPath,
  EnumConditionTerm,
} from './enum-condition-path';
import { getPriority } from '@stylexjs/shared';
import {
  canNegateEnumCondition,
  normalizeEnumConditions,
} from './enum-condition-path';

export type EnumBranch = {
  +value: string | boolean,
  +conditions: $ReadOnlyArray<string>,
};
export type EnumBranchPlan = {
  +value: string | boolean,
  +clear: $ReadOnlyArray<string | boolean>,
  +paths: $ReadOnlyArray<EnumConditionPath>,
};

const MAX_ENUM_PATHS = 128;

export function planEnumConditions(
  input: $ReadOnlyArray<EnumBranch>,
): Array<EnumBranchPlan> {
  // More deeply conditioned declarations have more CSS specificity. Within
  // that depth, reuse StyleX priorities (e.g. :active beats :hover). Source
  // order breaks ties, as it does for ordered media queries.
  const branches = input
    .map((branch, index) => ({
      ...branch,
      index,
      priority: branch.conditions.map(getPriority).reduce((a, b) => a + b, 0),
    }))
    .sort(
      (a, b) =>
        a.conditions.length - b.conditions.length ||
        a.priority - b.priority ||
        a.index - b.index,
    );

  const blockedBy: Array<Set<number>> = branches.map(() => new Set());
  const paths = branches.map((branch, i) => {
    const original: Array<EnumConditionTerm> = branch.conditions.map(
      (source) => ({
        source,
        negative: false,
      }),
    );
    // The top-level default stays unconditional. Every matching assignment
    // explicitly clears it, including queries with no meaningful complement.
    if (branch.conditions.length === 0)
      return normalizeEnumConditions(original);
    let paths: Array<Array<EnumConditionTerm>> = [original];
    for (let j = i + 1; j < branches.length; j++) {
      const higher = branches[j];
      if (higher.value === branch.value) continue;
      const common = new Set(branch.conditions);
      const remainder = higher.conditions.filter((c) => !common.has(c));
      if (!remainder.every(canNegateEnumCondition)) continue;
      // A & !(B & C) = (A & !B) | (A & !C). Normalize every alternative
      // to remove contradictions and disjoint query overlaps.
      const expanded = paths.flatMap((path) =>
        remainder.map((source) => [...path, { source, negative: true }]),
      );
      if (expanded.length > MAX_ENUM_PATHS) {
        // Resets still guarantee correctness when exclusions would explode.
        // The compiler will clear this state in the higher branch instead.
        continue;
      }
      paths = expanded;
      blockedBy[i].add(j);
    }
    const normalized = paths.flatMap(normalizeEnumConditions);
    const unique = new Map(
      normalized.map((path) => [JSON.stringify(path), path]),
    );
    return [...unique.values()];
  });

  return branches.map((branch, i) => {
    const clear = new Set<string | boolean>();
    for (let j = 0; j < i; j++) {
      if (branches[j].value !== branch.value && !blockedBy[j].has(i))
        clear.add(branches[j].value);
    }
    // Emit clears and activation under exactly the same guards. This keeps
    // the unconditional default active even in a ±0.01 approximation gap.
    return { value: branch.value, clear: [...clear], paths: paths[i] };
  });
}
