/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { anglePercentage } from '../angle-percentage';
import { Angle } from '../angle';
import { Percentage } from '../common-types';

describe('Test CSS Type: <angle-percentage>', () => {
  test('parses angle values', () => {
    expect(anglePercentage.parse('45deg')).toEqual(new Angle(45, 'deg'));
    expect(anglePercentage.parse('1rad')).toEqual(new Angle(1, 'rad'));
    expect(anglePercentage.parse('0.5turn')).toEqual(new Angle(0.5, 'turn'));
    expect(anglePercentage.parse('100grad')).toEqual(new Angle(100, 'grad'));
  });

  test('parses percentage values', () => {
    expect(anglePercentage.parse('50%')).toEqual(new Percentage(50));
    expect(anglePercentage.parse('100%')).toEqual(new Percentage(100));
    expect(anglePercentage.parse('0%')).toEqual(new Percentage(0));
    expect(anglePercentage.parse('25%')).toEqual(new Percentage(25));
  });

  // test('rejects invalid angle-percentage values', () => {
  //   expect(() => anglePercentage.parseToEnd('abc')).toThrow();
  //   expect(() => anglePercentage.parseToEnd('50')).toThrow();
  //   expect(() => anglePercentage.parseToEnd('10abc')).toThrow();
  // });
});
