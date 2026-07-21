/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Normalize unit tests — hand-written IR, no Emotion.
 */

import type { FileIR } from '../src/core/ir';
import { normalizeFileIR } from '../src/core/normalize';

function irOf(props: Array<[string, string | number]>): FileIR {
  return {
    rules: [
      {
        name: 'x',
        atoms: props.map(([property, value]) => ({
          property,
          conditions: [],
          value: { kind: 'static', value },
        })),
      },
    ],
    keyframes: [],
  };
}

function properties(ir: FileIR): Array<string> {
  return ir.rules[0].atoms.map((a) => a.property);
}

describe('normalizeFileIR — physical to logical', () => {
  test('maps inline-axis physical properties to logical', () => {
    const out = normalizeFileIR(
      irOf([
        ['marginLeft', 8],
        ['marginRight', 8],
        ['paddingLeft', 4],
        ['paddingRight', 4],
        ['left', 0],
        ['right', 0],
      ]),
    );
    expect(properties(out)).toEqual([
      'marginInlineStart',
      'marginInlineEnd',
      'paddingInlineStart',
      'paddingInlineEnd',
      'insetInlineStart',
      'insetInlineEnd',
    ]);
  });

  test('leaves block-axis and non-directional properties untouched', () => {
    const out = normalizeFileIR(
      irOf([
        ['marginTop', 8],
        ['bottom', 0],
        ['color', 'red'],
      ]),
    );
    expect(properties(out)).toEqual(['marginTop', 'bottom', 'color']);
  });

  test('preserves conditions and values while renaming', () => {
    const ir: FileIR = {
      rules: [
        {
          name: 'x',
          atoms: [
            {
              property: 'marginLeft',
              conditions: [{ kind: 'pseudo-class', name: ':hover' }],
              value: { kind: 'static', value: 12 },
            },
          ],
        },
      ],
      keyframes: [],
    };
    const out = normalizeFileIR(ir);
    expect(out.rules[0].atoms[0]).toEqual({
      property: 'marginInlineStart',
      conditions: [{ kind: 'pseudo-class', name: ':hover' }],
      value: { kind: 'static', value: 12 },
    });
  });

  test('can be disabled', () => {
    const out = normalizeFileIR(irOf([['marginLeft', 8]]), {
      logicalProperties: false,
    });
    expect(properties(out)).toEqual(['marginLeft']);
  });
});
