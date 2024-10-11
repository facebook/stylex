/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Angle, Deg, Rad, Grad, Turn } from '../angle';
import { Percentage } from '../common-types';
import { SubString } from '../../base-types';

import { anglePercentage } from '../angle-percentage';

describe('Test CSS Type: <angle-percentage>', () => {
  test('parses CSS angle or percentage types strings correctly', () => {
    expect(anglePercentage.parseToEnd('0')).toEqual(new Angle(0));
    expect(anglePercentage.parseToEnd('0deg')).toEqual(new Deg(0));
    expect(anglePercentage.parseToEnd('50%')).toEqual(new Percentage(50));
    expect(anglePercentage.parseToEnd('45deg')).toEqual(new Deg(45));
    expect(anglePercentage.parseToEnd('90deg')).toEqual(new Deg(90));
    expect(anglePercentage.parseToEnd('180deg')).toEqual(new Deg(180));
    expect(anglePercentage.parseToEnd('270deg')).toEqual(new Deg(270));
    expect(anglePercentage.parseToEnd('-90deg')).toEqual(new Deg(-90));
    expect(anglePercentage.parseToEnd('0.5turn')).toEqual(new Turn(0.5));
    expect(anglePercentage.parseToEnd('2rad')).toEqual(new Rad(2));
    expect(anglePercentage.parseToEnd('100grad')).toEqual(new Grad(100));
    expect(anglePercentage.parseToEnd('1.5deg')).toEqual(new Deg(1.5));
    expect(() => anglePercentage.parseToEnd('0.75')).toThrow();
    expect(() => anglePercentage.parseToEnd('50% 50%')).toThrow();
  });

  test('parses CSS angle or percentage types subStrings correctly', () => {
    let val = new SubString('0deg');
    expect(anglePercentage.run(val)).toEqual(new Deg(0));
    expect(val.toString()).toEqual('');

    val = new SubString('45deg foo');
    expect(anglePercentage.run(val)).toEqual(new Deg(45));
    expect(val.toString()).toEqual(' foo');

    val = new SubString('50% bar');
    expect(anglePercentage.run(val)).toEqual(new Percentage(50));
    expect(val.toString()).toEqual(' bar');
  });
});
