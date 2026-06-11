/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  isCssVarOrCalc,
  isCalcTerm,
  buildBinaryCalc,
  buildUnaryMinusCalc,
} from '../css-calc';

describe('isCssVarOrCalc', () => {
  test('matches full-string var() references', () => {
    expect(isCssVarOrCalc('var(--x568ih9)')).toBe(true);
    expect(isCssVarOrCalc('var(--foreground-x568ih9)')).toBe(true);
  });

  test('matches balanced calc() expressions', () => {
    expect(isCssVarOrCalc('calc(var(--a) + var(--b))')).toBe(true);
    expect(isCssVarOrCalc('calc((1 + 2) * 3)')).toBe(true);
  });

  test('rejects partial or compound strings', () => {
    expect(isCssVarOrCalc('var(--a) var(--b)')).toBe(false);
    expect(isCssVarOrCalc('calc(1) + calc(2)')).toBe(false);
    expect(isCssVarOrCalc('solid var(--a)')).toBe(false);
    expect(isCssVarOrCalc('10px')).toBe(false);
    expect(isCssVarOrCalc(10)).toBe(false);
    expect(isCssVarOrCalc(null)).toBe(false);
  });
});

describe('isCalcTerm', () => {
  test('accepts finite numbers', () => {
    expect(isCalcTerm(10)).toBe(true);
    expect(isCalcTerm(-0.5)).toBe(true);
    expect(isCalcTerm(NaN)).toBe(false);
    expect(isCalcTerm(Infinity)).toBe(false);
  });

  test('accepts var()/calc() strings', () => {
    expect(isCalcTerm('var(--x568ih9)')).toBe(true);
    expect(isCalcTerm('calc(var(--a) + 1)')).toBe(true);
  });

  test('accepts numeric strings with CSS units', () => {
    expect(isCalcTerm('10px')).toBe(true);
    expect(isCalcTerm('1.5rem')).toBe(true);
    expect(isCalcTerm('50%')).toBe(true);
    expect(isCalcTerm('-2em')).toBe(true);
    expect(isCalcTerm('10')).toBe(true);
  });

  test('rejects non-numeric strings', () => {
    expect(isCalcTerm('solid ')).toBe(false);
    expect(isCalcTerm('auto')).toBe(false);
    expect(isCalcTerm('px')).toBe(false);
    expect(isCalcTerm('10px 20px')).toBe(false);
  });
});

describe('buildBinaryCalc', () => {
  test('builds calc() from var operands', () => {
    expect(buildBinaryCalc('var(--a)', '+', 'var(--b)')).toBe(
      'calc(var(--a) + var(--b))',
    );
  });

  test('builds calc() from mixed operands', () => {
    expect(buildBinaryCalc('var(--a)', '*', 2)).toBe('calc(var(--a) * 2)');
    expect(buildBinaryCalc(4, '-', 'var(--a)')).toBe('calc(4 - var(--a))');
    expect(buildBinaryCalc('var(--a)', '+', '10px')).toBe(
      'calc(var(--a) + 10px)',
    );
  });

  test('rounds numeric operands to 4 decimals', () => {
    expect(buildBinaryCalc(1 / 3, '*', 'var(--a)')).toBe(
      'calc(0.3333 * var(--a))',
    );
  });

  test('strips nested calc() operands down to parens', () => {
    expect(buildBinaryCalc('calc(var(--a) + var(--b))', '*', 2)).toBe(
      'calc((var(--a) + var(--b)) * 2)',
    );
  });
});

describe('buildUnaryMinusCalc', () => {
  test('negates a var reference', () => {
    expect(buildUnaryMinusCalc('var(--a)')).toBe('calc(-1 * var(--a))');
  });

  test('negates a calc expression', () => {
    expect(buildUnaryMinusCalc('calc(var(--a) + 1)')).toBe(
      'calc(-1 * (var(--a) + 1))',
    );
  });
});
