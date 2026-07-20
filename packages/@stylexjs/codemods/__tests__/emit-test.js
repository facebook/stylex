/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Engine unit tests: hand-written IR in, emitted create data out.
 * Deliberately NO Emotion anywhere in this file — this is what proves the
 * engine is source-neutral (any adapter producing this IR gets the same
 * output).
 */

import type { Atom, FileIR } from '../src/core/ir';
import { buildFileIR } from '../src/core/buildIR';
import { emitFileIR, sanitizeKey, EmitError } from '../src/core/emit';

function irOf(
  entries: Array<[string, Array<[string, string | number]>]>,
): FileIR {
  return {
    rules: entries.map(([name, decls]) => ({
      name,
      atoms: decls.map(([property, value]) => ({
        property,
        conditions: [],
        value: { kind: 'static', value },
      })),
    })),
    keyframes: [],
  };
}

describe('emitFileIR', () => {
  test('one rule becomes one create entry plus its binding', () => {
    const result = emitFileIR(irOf([['badge', [['color', 'red']]]]));
    expect(result.rules).toEqual([{ key: 'badge', style: { color: 'red' } }]);
    expect(result.bindings).toEqual(['badge']);
  });

  test('sorts properties alphabetically (stylex/sort-keys, zero autofixes) and keeps value types', () => {
    // Safe for flat longhands: order-dependent cases (duplicates,
    // shorthand/longhand overlap) are refused before emit.
    const result = emitFileIR(
      irOf([
        [
          'card',
          [
            ['fontSize', 16],
            ['lineHeight', 1.5],
            ['color', 'rgb(0, 0, 0)'],
          ],
        ],
      ]),
    );
    expect(Object.entries(result.rules[0].style)).toEqual([
      ['color', 'rgb(0, 0, 0)'],
      ['fontSize', 16],
      ['lineHeight', 1.5],
    ]);
  });

  test('key collisions get numeric suffixes in rule order', () => {
    const result = emitFileIR(
      irOf([
        ['badge', [['color', 'red']]],
        ['badge', [['color', 'blue']]],
        ['badge', [['color', 'green']]],
      ]),
    );
    expect(result.bindings).toEqual(['badge', 'badge2', 'badge3']);
  });

  test('sanitizes hostile name hints instead of emitting bad keys', () => {
    expect(sanitizeKey('MyButton')).toBe('myButton');
    expect(sanitizeKey('nav-bar item')).toBe('navBarItem');
    expect(sanitizeKey('123')).toBe('styles');
    expect(sanitizeKey('')).toBe('styles');
    expect(sanitizeKey('default')).toBe('styles');
  });

  test('REFUSES a duplicate unconditional base declaration', () => {
    const ir = irOf([
      [
        'badge',
        [
          ['color', 'red'],
          ['color', 'blue'],
        ],
      ],
    ]);
    expect(() => emitFileIR(ir)).toThrow(EmitError);
  });
});

describe('emitFileIR — conditions (the flip)', () => {
  const cond = (
    name: string,
    kind: 'pseudo-class' | 'pseudo-element',
    value: string,
  ): Atom => ({
    property: 'color',
    conditions: [
      kind === 'pseudo-class'
        ? { kind: 'pseudo-class', name }
        : { kind: 'pseudo-element', name },
    ],
    value: { kind: 'static', value },
  });
  const baseAtom = (value: string): Atom => ({
    property: 'color',
    conditions: [],
    value: { kind: 'static', value },
  });
  const ruleOf = (atoms: Array<Atom>): FileIR => ({
    rules: [{ name: 'badge', atoms }],
    keyframes: [],
  });

  test('base + :hover nests property-grouped, hover-guarded by default', () => {
    const { rules } = emitFileIR(
      ruleOf([baseAtom('red'), cond(':hover', 'pseudo-class', 'blue')]),
    );
    expect(rules[0].style).toEqual({
      color: {
        default: 'red',
        '@media (hover: hover)': { default: null, ':hover': 'blue' },
      },
    });
  });

  test('hover-guard can be disabled', () => {
    const { rules } = emitFileIR(
      ruleOf([baseAtom('red'), cond(':hover', 'pseudo-class', 'blue')]),
      { hoverGuard: false },
    );
    expect(rules[0].style).toEqual({
      color: { default: 'red', ':hover': 'blue' },
    });
  });

  test(':focus is not hover-guarded', () => {
    const { rules } = emitFileIR(
      ruleOf([baseAtom('red'), cond(':focus', 'pseudo-class', 'green')]),
    );
    expect(rules[0].style).toEqual({
      color: { default: 'red', ':focus': 'green' },
    });
  });

  test('a condition with no base gets default: null', () => {
    const { rules } = emitFileIR(
      ruleOf([cond(':focus', 'pseudo-class', 'green')]),
    );
    expect(rules[0].style).toEqual({
      color: { default: null, ':focus': 'green' },
    });
  });

  test('media condition nests as an at-rule object', () => {
    const { rules } = emitFileIR(
      ruleOf([
        baseAtom('red'),
        {
          property: 'color',
          conditions: [{ kind: 'at-rule', rule: '@media (min-width: 600px)' }],
          value: { kind: 'static', value: 'green' },
        },
      ]),
    );
    expect(rules[0].style).toEqual({
      color: { default: 'red', '@media (min-width: 600px)': 'green' },
    });
  });

  test('pseudo-element nests (different box, not hover-guarded)', () => {
    const { rules } = emitFileIR(
      ruleOf([baseAtom('red'), cond('::before', 'pseudo-element', 'gray')]),
    );
    expect(rules[0].style).toEqual({
      color: { default: 'red', '::before': 'gray' },
    });
  });
});

describe('buildFileIR', () => {
  test('flat declarations become zero-condition static atoms', () => {
    const ir = buildFileIR([
      {
        nameHint: 'badge',
        declarations: [
          { property: 'color', value: { kind: 'static', value: 'red' } },
          { property: 'fontSize', value: { kind: 'static', value: 16 } },
        ],
      },
    ]);
    expect(ir).toEqual({
      rules: [
        {
          name: 'badge',
          atoms: [
            {
              property: 'color',
              conditions: [],
              value: { kind: 'static', value: 'red' },
            },
            {
              property: 'fontSize',
              conditions: [],
              value: { kind: 'static', value: 16 },
            },
          ],
        },
      ],
      keyframes: [],
    });
  });

  test('buildFileIR -> emitFileIR round-trips a group into create data', () => {
    const { rules, bindings } = emitFileIR(
      buildFileIR([
        {
          nameHint: 'Badge',
          declarations: [
            { property: 'color', value: { kind: 'static', value: 'red' } },
          ],
        },
      ]),
    );
    expect(rules).toEqual([{ key: 'badge', style: { color: 'red' } }]);
    expect(bindings).toEqual(['badge']);
  });
});
