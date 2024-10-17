/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length, Em, Rem, Px, In, Pt } from '../length';
import { SubString } from '../../base-types';

describe('Test CSS Type: <length>', () => {
  test('parses CSS length types correctly', () => {
    expect(Length.parse.parseToEnd('0')).toEqual(new Length(0));
    expect(Length.parse.parseToEnd('10px')).toEqual(new Px(10));
    expect(Length.parse.parseToEnd('5rem')).toEqual(new Rem(5));
    expect(Length.parse.parseToEnd('2.5em')).toEqual(new Em(2.5));
    expect(Length.parse.parseToEnd('2in')).toEqual(new In(2));
    expect(Length.parse.parseToEnd('15pt')).toEqual(new Pt(15));
  });

  test('parses franctional length types correctly', () => {
    expect(Length.parse.parseToEnd('0.5px')).toEqual(new Px(0.5));
    expect(Length.parse.parseToEnd('.5px')).toEqual(new Px(0.5));
    expect(Length.parse.parseToEnd('.5rem')).toEqual(new Rem(0.5));
    expect(Length.parse.parseToEnd('0.5em')).toEqual(new Em(0.5));
    expect(Length.parse.parseToEnd('.2in')).toEqual(new In(0.2));
    expect(Length.parse.parseToEnd('1.5pt')).toEqual(new Pt(1.5));
  });

  test('parses CSS length types subStrings correctly', () => {
    let val = new SubString('0rem');
    expect(Length.parse.run(val)).toEqual(new Rem(0));
    expect(val.toString()).toEqual('');

    val = new SubString('10px foo');
    expect(Length.parse.run(val)).toEqual(new Px(10));
    expect(val.toString()).toEqual(' foo');
  });
});
