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

import type { FileIR } from '../src/core/ir';
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

  test('REFUSES conditions (M2) rather than emitting incorrectly', () => {
    const ir: FileIR = {
      rules: [
        {
          name: 'badge',
          atoms: [
            {
              property: 'color',
              conditions: [{ kind: 'pseudo-class', name: ':hover' }],
              value: { kind: 'static', value: 'blue' },
            },
          ],
        },
      ],
      keyframes: [],
    };
    expect(() => emitFileIR(ir)).toThrow(EmitError);
  });

  test('REFUSES duplicate properties within a rule', () => {
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

describe('buildFileIR', () => {
  test('flat declarations become zero-condition static atoms', () => {
    const ir = buildFileIR([
      {
        nameHint: 'badge',
        declarations: [
          { property: 'color', value: 'red' },
          { property: 'fontSize', value: 16 },
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
          declarations: [{ property: 'color', value: 'red' }],
        },
      ]),
    );
    expect(rules).toEqual([{ key: 'badge', style: { color: 'red' } }]);
    expect(bindings).toEqual(['badge']);
  });
});
