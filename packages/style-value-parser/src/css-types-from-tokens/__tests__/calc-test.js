/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Calc } from '../calc';
import { Percentage } from '../common-types';
import { NumberType } from '@csstools/css-tokenizer';

describe('Test CSS Type: calc()', () => {
  test('parses simple numeric values', () => {
    expect(Calc.parser.parse('calc(10)')).toEqual(new Calc(10));
    expect(Calc.parser.parse('calc(3.14)')).toEqual(new Calc(3.14));
    expect(Calc.parser.parse('calc(-5)')).toEqual(new Calc(-5));
  });

  test('parses percentage values', () => {
    expect(Calc.parser.parse('calc(50%)')).toEqual(
      new Calc(new Percentage(50)),
    );
    expect(Calc.parser.parse('calc(100%)')).toEqual(
      new Calc(new Percentage(100)),
    );
    expect(Calc.parser.parse('calc(-25%)')).toEqual(
      new Calc(new Percentage(-25)),
    );
  });

  test('parses dimension values', () => {
    expect(Calc.parser.parse('calc(20px)')).toMatchObject(
      new Calc(
        expect.objectContaining({
          unit: 'px',
          value: 20,
        }),
      ),
    );
    expect(Calc.parser.parse('calc(2em)')).toMatchObject(
      new Calc(
        expect.objectContaining({
          unit: 'em',
          value: 2,
        }),
      ),
    );
    expect(Calc.parser.parse('calc(1.5rem)')).toMatchObject(
      new Calc(
        expect.objectContaining({
          unit: 'rem',
          value: 1.5,
        }),
      ),
    );
  });

  test('parses addition operations', () => {
    expect(Calc.parser.parse('calc(10 + 5)')).toEqual(
      new Calc({
        type: '+',
        left: 10,
        right: 5,
      }),
    );
    expect(Calc.parser.parse('calc(20px + 10%)')).toMatchObject(
      new Calc({
        type: '+',
        left: expect.objectContaining({
          unit: 'px',
          value: 20,
        }),
        right: new Percentage(10),
      }),
    );
  });

  test('parses subtraction operations', () => {
    expect(Calc.parser.parse('calc(10 - 5)')).toEqual(
      new Calc({
        type: '-',
        left: 10,
        right: 5,
      }),
    );
    expect(Calc.parser.parse('calc(100% - 20px)')).toMatchObject(
      new Calc({
        type: '-',
        left: new Percentage(100),
        right: expect.objectContaining({
          unit: 'px',
          value: 20,
        }),
      }),
    );
  });

  test('parses multiplication operations', () => {
    expect(Calc.parser.parse('calc(10 * 5)')).toEqual(
      new Calc({
        type: '*',
        left: 10,
        right: 5,
      }),
    );
    expect(Calc.parser.parse('calc(2 * 50%)')).toEqual(
      new Calc({
        type: '*',
        left: 2,
        right: new Percentage(50),
      }),
    );
  });

  test('parses division operations', () => {
    expect(Calc.parser.parse('calc(10 / 2)')).toEqual(
      new Calc({
        type: '/',
        left: 10,
        right: 2,
      }),
    );
    expect(Calc.parser.parse('calc(100% / 4)')).toEqual(
      new Calc({
        type: '/',
        left: new Percentage(100),
        right: 4,
      }),
    );
  });

  test('parses nested operations with parentheses', () => {
    // expect(Calc.parser.parse('calc((10 + 5) * 2)')).toEqual(
    //   new Calc({
    //     type: '*',
    //     left: {
    //       type: '+',
    //       left: 10,
    //       right: 5,
    //     },
    //     right: 2,
    //   }),
    // );
    expect(Calc.parser.parse('calc(100% - (30px / 2))')).toMatchObject(
      new Calc({
        type: '-',
        left: new Percentage(100),
        right: {
          type: '/',
          left: {
            type: NumberType.Integer,
            value: 30,
            unit: 'px',
          },
          right: 2,
        },
      }),
    );
  });

  test('parses complex expressions with multiple operations', () => {
    expect(Calc.parser.parse('calc(100% - 20px * 2 + 10px)')).toMatchObject(
      new Calc({
        type: '*',
        left: {
          type: '-',
          left: new Percentage(100),
          right: {
            type: NumberType.Integer,
            value: 20,
            unit: 'px',
          },
        },
        right: {
          type: '+',
          left: 2,
          right: {
            type: NumberType.Integer,
            value: 10,
            unit: 'px',
          },
        },
      }),
    );
  });

  test('handles whitespace correctly', () => {
    // expect(Calc.parser.parse('calc( 10+5 )')).toEqual(
    //   new Calc({
    //     type: '+',
    //     left: 10,
    //     right: 5,
    //   }),
    // );
    expect(Calc.parser.parse('calc( 10 + 5 )')).toEqual(
      new Calc({
        type: '+',
        left: 10,
        right: 5,
      }),
    );
  });

  test('rejects invalid calc expressions', () => {
    expect(() => Calc.parser.parseToEnd('calc()')).toThrow();
    expect(() => Calc.parser.parseToEnd('calc(10 + )')).toThrow();
    expect(() => Calc.parser.parseToEnd('calc(10 @ 5)')).toThrow();
    expect(() => Calc.parser.parseToEnd('calc(10px + 5em)')).not.toThrow();
    expect(() => Calc.parser.parseToEnd('notcalc(10 + 5)')).toThrow();
  });
});
