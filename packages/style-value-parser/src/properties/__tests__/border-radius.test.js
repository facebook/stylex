/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  BorderRadiusIndividual,
  BorderRadiusShorthand,
} from '../border-radius';
import { Px, Rem } from '../../css-types/length';
import { Percentage } from '../../css-types/common-types';

describe('Test CSS property: `border-<dir>-<dir>-radius`', () => {
  test('Valid: border-<dir>-<dir>-radius: <length-percentage>', () => {
    expect(BorderRadiusIndividual.parse.parseToEnd('10px')).toEqual(
      new BorderRadiusIndividual(new Px(10)),
    );
    expect(BorderRadiusIndividual.parse.parseToEnd('0.5px')).toEqual(
      new BorderRadiusIndividual(new Px(0.5)),
    );
    expect(BorderRadiusIndividual.parse.parseToEnd('.5px')).toEqual(
      new BorderRadiusIndividual(new Px(0.5)),
    );
    expect(BorderRadiusIndividual.parse.parseToEnd('1rem')).toEqual(
      new BorderRadiusIndividual(new Rem(1)),
    );
  });

  test('Valid: border-<dir>-<dir>-radius: <length-percentage> <length-percentage>', () => {
    expect(BorderRadiusIndividual.parse.parseToEnd('10px 20px')).toEqual(
      new BorderRadiusIndividual(new Px(10), new Px(20)),
    );
    expect(BorderRadiusIndividual.parse.parseToEnd('0.5px 2rem')).toEqual(
      new BorderRadiusIndividual(new Px(0.5), new Rem(2)),
    );
    expect(BorderRadiusIndividual.parse.parseToEnd('.5px \n   4.5rem')).toEqual(
      new BorderRadiusIndividual(new Px(0.5), new Rem(4.5)),
    );
    expect(BorderRadiusIndividual.parse.parseToEnd('1rem .0005px')).toEqual(
      new BorderRadiusIndividual(new Rem(1), new Px(0.0005)),
    );
  });

  test('Invalid: border-<dir>-<dir>-radius', () => {
    expect(() => BorderRadiusIndividual.parse.parseToEnd('skchdj')).toThrow();
    expect(() => BorderRadiusIndividual.parse.parseToEnd('red')).toThrow();
    expect(() => BorderRadiusIndividual.parse.parseToEnd('10')).toThrow();
    expect(() => BorderRadiusIndividual.parse.parseToEnd('1.0 2.0')).toThrow();
    expect(() => BorderRadiusIndividual.parse.parseToEnd('0.5')).toThrow();
    expect(() => BorderRadiusIndividual.parse.parseToEnd('1.5')).toThrow();
    expect(() => BorderRadiusIndividual.parse.parseToEnd('1.5 20')).toThrow();
  });
});

describe('Test CSS property shorthand: `border-radius`', () => {
  test('Valid: border-radius: <length-percentage>', () => {
    expect(BorderRadiusShorthand.parse.parseToEnd('10px')).toEqual(
      new BorderRadiusShorthand(new Px(10)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('0.5px')).toEqual(
      new BorderRadiusShorthand(new Px(0.5)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('.5px')).toEqual(
      new BorderRadiusShorthand(new Px(0.5)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('1rem')).toEqual(
      new BorderRadiusShorthand(new Rem(1)),
    );
  });

  test('Valid: border-radius: <length-percentage> <length-percentage>', () => {
    expect(BorderRadiusShorthand.parse.parseToEnd('10px 20px')).toEqual(
      new BorderRadiusShorthand(new Px(10), new Px(20)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('0.5px 2rem')).toEqual(
      new BorderRadiusShorthand(new Px(0.5), new Rem(2)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('.5px \n   4.5rem')).toEqual(
      new BorderRadiusShorthand(new Px(0.5), new Rem(4.5)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('1rem .0005px')).toEqual(
      new BorderRadiusShorthand(new Rem(1), new Px(0.0005)),
    );
  });

  test('Valid: border-radius: <length-percentage> <length-percentage> <length-percentage>', () => {
    expect(BorderRadiusShorthand.parse.parseToEnd('10px 20px 30px')).toEqual(
      new BorderRadiusShorthand(new Px(10), new Px(20), new Px(30)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('0.5px 2rem 3rem')).toEqual(
      new BorderRadiusShorthand(new Px(0.5), new Rem(2), new Rem(3)),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('.5px \n   4.5rem 6rem'),
    ).toEqual(new BorderRadiusShorthand(new Px(0.5), new Rem(4.5), new Rem(6)));
    expect(
      BorderRadiusShorthand.parse.parseToEnd('1rem .0005px 0.0005rem'),
    ).toEqual(
      new BorderRadiusShorthand(new Rem(1), new Px(0.0005), new Rem(0.0005)),
    );
  });

  test('Valid: border-radius: <length-percentage> <length-percentage> <length-percentage> <length-percentage>', () => {
    expect(
      BorderRadiusShorthand.parse.parseToEnd('10px 20px 30px 40px'),
    ).toEqual(
      new BorderRadiusShorthand(new Px(10), new Px(20), new Px(30), new Px(40)),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('0.5px 2rem 3rem 4rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Rem(2),
        new Rem(3),
        new Rem(4),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('.5px \n   4.5rem 6rem 7rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Rem(4.5),
        new Rem(6),
        new Rem(7),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('1rem .0005px 0.0005rem 0.5rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Rem(1),
        new Px(0.0005),
        new Rem(0.0005),
        new Rem(0.5),
      ),
    );
  });

  test('Valid: border-radius: <percentage>...', () => {
    expect(BorderRadiusShorthand.parse.parseToEnd('50%')).toEqual(
      new BorderRadiusShorthand(new Percentage(50)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('0.5%')).toEqual(
      new BorderRadiusShorthand(new Percentage(0.5)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('.5%')).toEqual(
      new BorderRadiusShorthand(new Percentage(0.5)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('10% 20%')).toEqual(
      new BorderRadiusShorthand(new Percentage(10), new Percentage(20)),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('10% 20% 30%')).toEqual(
      new BorderRadiusShorthand(
        new Percentage(10),
        new Percentage(20),
        new Percentage(30),
      ),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('10% 20% 30% 40%')).toEqual(
      new BorderRadiusShorthand(
        new Percentage(10),
        new Percentage(20),
        new Percentage(30),
        new Percentage(40),
      ),
    );
  });

  // Assymentric border-radius
  test('Valid: border-radius: <length-percentage> / <length-percentage>', () => {
    expect(BorderRadiusShorthand.parse.parseToEnd('10px / 20px')).toEqual(
      new BorderRadiusShorthand(
        new Px(10),
        new Px(10),
        new Px(10),
        new Px(10),
        new Px(20),
      ),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('0.5px / 2rem')).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Px(0.5),
        new Px(0.5),
        new Px(0.5),
        new Rem(2),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('.5px \n   / 4.5rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Px(0.5),
        new Px(0.5),
        new Px(0.5),
        new Rem(4.5),
      ),
    );
    expect(BorderRadiusShorthand.parse.parseToEnd('1rem / .0005px')).toEqual(
      new BorderRadiusShorthand(
        new Rem(1),
        new Rem(1),
        new Rem(1),
        new Rem(1),
        new Px(0.0005),
      ),
    );
  });

  test('Valid: border-radius: <length-percentage> <length-percentage> / <length-percentage> <length-percentage>', () => {
    expect(
      BorderRadiusShorthand.parse.parseToEnd('10px 20px / 30px 40px'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(10),
        new Px(20),
        new Px(10),
        new Px(20),
        new Px(30),
        new Px(40),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('0.5px 2rem / 3rem 4rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Rem(2),
        new Px(0.5),
        new Rem(2),
        new Rem(3),
        new Rem(4),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('.5px \n   4.5rem / 6rem 7rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Rem(4.5),
        new Px(0.5),
        new Rem(4.5),
        new Rem(6),
        new Rem(7),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd('1rem .0005px / 0.0005rem 0.5rem'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Rem(1),
        new Px(0.0005),
        new Rem(1),
        new Px(0.0005),
        new Rem(0.0005),
        new Rem(0.5),
      ),
    );
  });

  test('Valid: border-radius: <length-percentage> <length-percentage> <length-percentage> / <length-percentage> <length-percentage> <length-percentage>', () => {
    expect(
      BorderRadiusShorthand.parse.parseToEnd('10px 20px 30px / 40px 50px 60px'),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(10),
        new Px(20),
        new Px(30),
        new Px(20),
        new Px(40),
        new Px(50),
        new Px(60),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd(
        '0.5px 2rem 3rem / 4rem 5rem 6rem',
      ),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Rem(2),
        new Rem(3),
        new Rem(2),
        new Rem(4),
        new Rem(5),
        new Rem(6),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd(
        '.5px \n   4.5rem 6rem / 7rem 8rem 9rem',
      ),
    ).toEqual(
      new BorderRadiusShorthand(
        new Px(0.5),
        new Rem(4.5),
        new Rem(6),
        new Rem(4.5),
        new Rem(7),
        new Rem(8),
        new Rem(9),
      ),
    );
    expect(
      BorderRadiusShorthand.parse.parseToEnd(
        '1rem .0005px 0.0005rem / 0.5rem 0.6rem 0.7rem',
      ),
    ).toEqual(
      new BorderRadiusShorthand(
        new Rem(1),
        new Px(0.0005),
        new Rem(0.0005),
        new Px(0.0005),
        new Rem(0.5),
        new Rem(0.6),
        new Rem(0.7),
      ),
    );
  });
});
