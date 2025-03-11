/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Angle } from '../angle';

describe('Test CSS Type: <angle>', () => {
  test('parses CSS angle types strings correctly', () => {
    expect(Angle.parser.parse('0deg')).toEqual(new Angle(0, 'deg'));
    expect(Angle.parser.parse('45deg')).toEqual(new Angle(45, 'deg'));
    expect(Angle.parser.parse('90deg')).toEqual(new Angle(90, 'deg'));
    expect(Angle.parser.parse('180deg')).toEqual(new Angle(180, 'deg'));
    expect(Angle.parser.parse('270deg')).toEqual(new Angle(270, 'deg'));
    expect(Angle.parser.parse('-90deg')).toEqual(new Angle(-90, 'deg'));
    expect(Angle.parser.parse('0.5turn')).toEqual(new Angle(0.5, 'turn'));
    expect(Angle.parser.parse('2rad')).toEqual(new Angle(2, 'rad'));
    expect(Angle.parser.parse('100grad')).toEqual(new Angle(100, 'grad'));
    expect(Angle.parser.parse('1.5deg')).toEqual(new Angle(1.5, 'deg'));
  });
  describe('Rejects', () => {
    test('rejects invalid angle values', () => {
      expect(() => Angle.parser.parseToEnd('invalid')).toThrow();
      expect(() => Angle.parser.parseToEnd('red')).toThrow();
      expect(() => Angle.parser.parseToEnd('initial')).toThrow();
    });
  });
});
