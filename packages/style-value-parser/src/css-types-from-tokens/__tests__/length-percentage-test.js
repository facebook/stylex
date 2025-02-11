/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { lengthPercentage } from '../length-percentage';
import { Length } from '../length';
import { Percentage } from '../common-types';

describe('Test CSS Type: <length-percentage>', () => {
  test('parses length values', () => {
    expect(lengthPercentage.parse('10px')).toEqual(new Length(10, 'px'));
    expect(lengthPercentage.parse('5em')).toEqual(new Length(5, 'em'));
    expect(lengthPercentage.parse('2rem')).toEqual(new Length(2, 'rem'));
    expect(lengthPercentage.parse('1in')).toEqual(new Length(1, 'in'));
  });

  test('parses percentage values', () => {
    expect(lengthPercentage.parse('50%')).toEqual(new Percentage(50));
    expect(lengthPercentage.parse('100%')).toEqual(new Percentage(100));
    expect(lengthPercentage.parse('0%')).toEqual(new Percentage(0));
    expect(lengthPercentage.parse('25%')).toEqual(new Percentage(25));
  });

  test('rejects invalid length-percentage values', () => {
    expect(() => lengthPercentage.parseToEnd('abc')).toThrow();
    expect(() => lengthPercentage.parseToEnd('50')).toThrow();
    expect(() => lengthPercentage.parseToEnd('10abc')).toThrow();
  });
});
