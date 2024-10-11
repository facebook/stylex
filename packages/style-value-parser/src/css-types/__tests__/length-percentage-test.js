/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length, Px, Rem } from '../length';
import { Percentage } from '../common-types';
import { lengthPercentage } from '../length-percentage';
import { SubString } from '../../base-types';

describe('Test CSS Type: <length-percentage>', () => {
  test('parses CSS length-percentage types strings correctly', () => {
    expect(lengthPercentage.parse('0')).toEqual(new Length(0));
    expect(lengthPercentage.parse('10px')).toEqual(new Px(10));
    expect(lengthPercentage.parse('5rem')).toEqual(new Rem(5));
    expect(lengthPercentage.parse('50%')).toEqual(new Percentage(50));
    expect(lengthPercentage.parse('10.5%')).toEqual(new Percentage(10.5));
  });

  test('parses CSS length-percentage types subStrings correctly', () => {
    let val = new SubString('0');
    expect(lengthPercentage.run(val)).toEqual(new Length(0));
    expect(val.toString()).toEqual('');

    val = new SubString('10px foo');
    expect(lengthPercentage.run(val)).toEqual(new Px(10));
    expect(val.toString()).toEqual(' foo');
  });
});
