/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Angle, Deg, Rad, Grad, Turn } from '../angle';
import { SubString } from '../../base-types';

describe('Test CSS Type: <angle>', () => {
  test('parses CSS angle types strings correctly', () => {
    expect(Angle.parse.parse('0deg')).toEqual(new Deg(0));
    expect(Angle.parse.parse('45deg')).toEqual(new Deg(45));
    expect(Angle.parse.parse('90deg')).toEqual(new Deg(90));
    expect(Angle.parse.parse('180deg')).toEqual(new Deg(180));
    expect(Angle.parse.parse('270deg')).toEqual(new Deg(270));
    expect(Angle.parse.parse('-90deg')).toEqual(new Deg(-90));
    expect(Angle.parse.parse('0.5turn')).toEqual(new Turn(0.5));
    expect(Angle.parse.parse('2rad')).toEqual(new Rad(2));
    expect(Angle.parse.parse('100grad')).toEqual(new Grad(100));
    expect(Angle.parse.parse('1.5deg')).toEqual(new Deg(1.5));
  });

  test('parses CSS angle types subStrings correctly', () => {
    let val = new SubString('0deg');
    expect(Angle.parse.run(val)).toEqual(new Deg(0));
    expect(val.toString()).toEqual('');

    val = new SubString('45deg foo');
    expect(Angle.parse.run(val)).toEqual(new Deg(45));
    expect(val.toString()).toEqual(' foo');
  });
});
