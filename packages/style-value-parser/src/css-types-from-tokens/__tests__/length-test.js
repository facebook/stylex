/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length } from '../length';

describe('Test CSS Type: <length>', () => {
  test('parses font-based units', () => {
    expect(Length.parse.parse('10ch')).toEqual(new Length(10, 'ch'));
    expect(Length.parse.parse('2em')).toEqual(new Length(2, 'em'));
    expect(Length.parse.parse('1.5ex')).toEqual(new Length(1.5, 'ex'));
    expect(Length.parse.parse('3ic')).toEqual(new Length(3, 'ic'));
    expect(Length.parse.parse('1.2lh')).toEqual(new Length(1.2, 'lh'));
    expect(Length.parse.parse('2rem')).toEqual(new Length(2, 'rem'));
    expect(Length.parse.parse('1rlh')).toEqual(new Length(1, 'rlh'));
  });

  test('parses viewport-based units', () => {
    expect(Length.parse.parse('50vh')).toEqual(new Length(50, 'vh'));
    expect(Length.parse.parse('100vw')).toEqual(new Length(100, 'vw'));
    expect(Length.parse.parse('80svh')).toEqual(new Length(80, 'svh'));
    expect(Length.parse.parse('90lvw')).toEqual(new Length(90, 'lvw'));
    expect(Length.parse.parse('70dvh')).toEqual(new Length(70, 'dvh'));
    expect(Length.parse.parse('60vmin')).toEqual(new Length(60, 'vmin'));
    expect(Length.parse.parse('85vmax')).toEqual(new Length(85, 'vmax'));
  });

  test('parses container-based units', () => {
    expect(Length.parse.parse('30cqw')).toEqual(new Length(30, 'cqw'));
    expect(Length.parse.parse('40cqi')).toEqual(new Length(40, 'cqi'));
    expect(Length.parse.parse('50cqh')).toEqual(new Length(50, 'cqh'));
    expect(Length.parse.parse('60cqb')).toEqual(new Length(60, 'cqb'));
    expect(Length.parse.parse('45cqmin')).toEqual(new Length(45, 'cqmin'));
    expect(Length.parse.parse('75cqmax')).toEqual(new Length(75, 'cqmax'));
  });

  test('parses absolute units', () => {
    expect(Length.parse.parse('16px')).toEqual(new Length(16, 'px'));
    expect(Length.parse.parse('2cm')).toEqual(new Length(2, 'cm'));
    expect(Length.parse.parse('10mm')).toEqual(new Length(10, 'mm'));
    expect(Length.parse.parse('1in')).toEqual(new Length(1, 'in'));
    expect(Length.parse.parse('12pt')).toEqual(new Length(12, 'pt'));
  });

  test('rejects invalid units', () => {
    expect(() => Length.parse.parseToEnd('10abc')).toThrow();
    expect(() => Length.parse.parseToEnd('20pc')).toThrow();
    expect(() => Length.parse.parseToEnd('30')).toThrow();
    expect(() => Length.parse.parseToEnd('xyz')).toThrow();
  });
});
