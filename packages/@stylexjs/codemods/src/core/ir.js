/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * The neutral intermediate representation (IR) shared by every adapter and
 * the core engine. Its shape mirrors StyleX's OUTPUT (property-grouped, with
 * conditions nested inside a property), not any source library's input.
 *
 * A style either maps into this IR (=> convertible) or it does not
 * (=> flagged, never guessed). The edge of the IR is the edge of what is
 * automatable.
 *
 * The two open axes — `Condition` and `Value` — are variant types because
 * they are the only axes StyleX itself grows along. New condition kinds
 * (`@supports`, `@container`, ancestor selectors) and new value kinds
 * (dynamic/function-form) are ADDITIVE extensions; the structure never
 * changes for a new source library.
 */

/**
 * A single typed condition under which a value applies.
 * Only self-targeting conditions are representable — selectors that reach
 * outside the element have no encoding here, by design.
 */
export type Condition =
  | { +kind: 'pseudo-class', +name: string } // e.g. ':hover'
  | { +kind: 'pseudo-element', +name: string } // e.g. '::before'
  | { +kind: 'at-rule', +rule: string }; // e.g. '@media (min-width: 600px)'

/**
 * The value of an atom. `static` is the only variant in v1.0; a
 * `dynamic` variant (props-driven, -> StyleX function-form create) is the
 * planned v1.1 addition.
 */
export type Value =
  | { +kind: 'static', +value: string | number | null }
  | {
      +kind: 'first-that-works',
      +values: $ReadOnlyArray<string | number>,
    };

/**
 * The unit of the IR: one property, under zero or more conditions,
 * with one value. e.g. { property: 'color', conditions: [:hover], 'blue' }.
 */
export type Atom = {
  +property: string, // camelCase, StyleX-style (e.g. 'backgroundColor')
  +conditions: $ReadOnlyArray<Condition>,
  +value: Value,
};

/**
 * One named entry in a `stylex.create` registry — a group of atoms with the
 * key the emitter should try to use for it.
 */
export type StyleRule = {
  +name: string,
  +atoms: $ReadOnlyArray<Atom>,
};

/** An object-form keyframes declaration (`stylex.keyframes`). */
export type KeyframesRule = {
  +name: string,
  +frames: $ReadOnlyArray<{
    +selector: string, // 'from' | 'to' | '0%' ...
    +atoms: $ReadOnlyArray<Atom>,
  }>,
};

/**
 * Everything the engine knows about one file's styles: the rules destined
 * for the single per-file `stylex.create`, plus file-level constructs.
 * Design tokens (`defineVars`) join in M3.
 */
export type FileIR = {
  +rules: $ReadOnlyArray<StyleRule>,
  +keyframes: $ReadOnlyArray<KeyframesRule>,
};

/** Stable string form of a condition, used for grouping and diffing. */
export function conditionKey(condition: Condition): string {
  switch (condition.kind) {
    case 'pseudo-class':
    case 'pseudo-element':
      return condition.name;
    case 'at-rule':
    default:
      return condition.rule;
  }
}

/**
 * Stable string form of an atom's (property, conditions) coordinate —
 * conditions sorted so ordering differences do not create false diffs.
 */
export function atomCoordinate(
  property: string,
  conditions: $ReadOnlyArray<Condition>,
): string {
  const keys = conditions.map(conditionKey).slice().sort();
  return keys.length === 0 ? property : `${property} @ ${keys.join(' && ')}`;
}
