/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Referee unit tests — hand-written IR, no Emotion. The referee is the
 * silent-wrong-cascade guard, so it gets the heaviest scrutiny: every
 * shorthand of the agreement/disagreement matrix.
 */

import type { Atom, Condition, StyleRule } from '../src/core/ir';
import { checkRule } from '../src/core/referee';

const base = (value: string): Atom => ({
  property: 'color',
  conditions: [],
  value: { kind: 'static', value },
});
const pc = (name: string, value: string): Atom => ({
  property: 'color',
  conditions: [{ kind: 'pseudo-class', name }],
  value: { kind: 'static', value },
});
const pe = (name: string, value: string): Atom => ({
  property: 'color',
  conditions: [{ kind: 'pseudo-element', name }],
  value: { kind: 'static', value },
});
const media = (rule: string, value: string): Atom => ({
  property: 'color',
  conditions: [{ kind: 'at-rule', rule }],
  value: { kind: 'static', value },
});

const rule = (atoms: Array<Atom>): StyleRule => ({ name: 'x', atoms });
const MEDIA = '@media (min-width: 600px)';

describe('checkRule — agreement (converts)', () => {
  test('base then :hover — cascade and priority agree', () => {
    expect(checkRule(rule([base('red'), pc(':hover', 'blue')])).ok).toBe(true);
  });

  test(':hover then :focus (source order matches ascending priority)', () => {
    expect(
      checkRule(rule([pc(':hover', 'blue'), pc(':focus', 'green')])).ok,
    ).toBe(true);
  });

  test(':hover then base — base wins by cascade despite later source (lower specificity)', () => {
    // Reversed source order, but :hover has higher specificity AND higher
    // priority, so both systems agree :hover wins.
    expect(checkRule(rule([pc(':hover', 'blue'), base('red')])).ok).toBe(true);
  });

  test('pseudo-element and base never compete (different boxes)', () => {
    expect(checkRule(rule([base('red'), pe('::before', 'gray')])).ok).toBe(
      true,
    );
  });

  test(':hover and ::before mix does not false-refuse (partitioned by target)', () => {
    // Cascade orders ::before before :hover (b dominates), priority orders
    // :hover before ::before — but they are different boxes, so partitioning
    // must prevent a spurious conflict.
    expect(
      checkRule(rule([pc(':hover', 'blue'), pe('::before', 'gray')])).ok,
    ).toBe(true);
  });

  test('base then media (source order matches priority)', () => {
    expect(checkRule(rule([base('red'), media(MEDIA, 'green')])).ok).toBe(true);
  });
});

describe('checkRule — disagreement (refuses)', () => {
  test(':focus then :hover — priority picks focus, source order picks hover', () => {
    const result = checkRule(
      rule([pc(':focus', 'green'), pc(':hover', 'blue')]),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.conflicts[0]).toMatch(/disagree/);
    }
  });

  test('media then base — priority picks media, cascade picks base (later, equal specificity)', () => {
    const result = checkRule(rule([media(MEDIA, 'green'), base('red')]));
    expect(result.ok).toBe(false);
  });

  test('≥2 sibling media queries on one property (sort-keys reorder hazard)', () => {
    const result = checkRule(
      rule([
        base('black'),
        media('@media (min-width: 500px)', 'blue'),
        media('@media (min-width: 700px)', 'green'),
      ]),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.conflicts[0]).toMatch(/sibling at-rule/);
    }
  });

  test('a single media query alongside base is fine', () => {
    expect(checkRule(rule([base('black'), media(MEDIA, 'blue')])).ok).toBe(
      true,
    );
  });
});

describe('checkRule — dedup', () => {
  test('same-coordinate duplicates collapse to the last in source order', () => {
    const result = checkRule(
      rule([pc(':hover', 'blue'), pc(':hover', 'navy')]),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rule.atoms).toHaveLength(1);
      expect(result.rule.atoms[0].value).toEqual({
        kind: 'static',
        value: 'navy',
      });
    }
  });

  test('distinct properties are refereed independently', () => {
    const hover: Condition = { kind: 'pseudo-class', name: ':hover' };
    const focus: Condition = { kind: 'pseudo-class', name: ':focus' };
    // color agrees (hover→focus), but backgroundColor disagrees (focus→hover).
    const mixed: StyleRule = {
      name: 'x',
      atoms: [
        {
          property: 'color',
          conditions: [hover],
          value: { kind: 'static', value: 'blue' },
        },
        {
          property: 'color',
          conditions: [focus],
          value: { kind: 'static', value: 'green' },
        },
        {
          property: 'backgroundColor',
          conditions: [focus],
          value: { kind: 'static', value: 'white' },
        },
        {
          property: 'backgroundColor',
          conditions: [hover],
          value: { kind: 'static', value: 'gray' },
        },
      ],
    };
    const result = checkRule(mixed);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.conflicts.some((c) => c.includes('backgroundColor'))).toBe(
        true,
      );
      expect(result.conflicts.some((c) => c.includes("'color'"))).toBe(false);
    }
  });
});
