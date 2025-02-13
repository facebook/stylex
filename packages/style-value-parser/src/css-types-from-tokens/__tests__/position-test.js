/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Position } from '../position';
import { Length } from '../length';
import { Percentage } from '../common-types';

describe('Test CSS Type: <position>', () => {
  test('parses single keywords', () => {
    expect(Position.parse.parse('left')).toEqual(
      new Position('left', undefined),
    );
    expect(Position.parse.parse('right')).toEqual(
      new Position('right', undefined),
    );
    expect(Position.parse.parse('center')).toEqual(
      new Position('center', undefined),
    );
    expect(Position.parse.parse('top')).toEqual(new Position(undefined, 'top'));
    expect(Position.parse.parse('bottom')).toEqual(
      new Position(undefined, 'bottom'),
    );
    expect(Position.parse.parse('center')).toEqual(
      new Position('center', undefined),
    );
  });

  test('parses keyword combinations', () => {
    expect(Position.parse.parse('left top')).toEqual(
      new Position('left', 'top'),
    );
    expect(Position.parse.parse('right bottom')).toEqual(
      new Position('right', 'bottom'),
    );
    expect(Position.parse.parse('center center')).toEqual(
      new Position('center', 'center'),
    );
    expect(Position.parse.parse('left bottom')).toEqual(
      new Position('left', 'bottom'),
    );
    expect(Position.parse.parse('right top')).toEqual(
      new Position('right', 'top'),
    );
  });

  test('parses keyword with length-percentage', () => {
    expect(Position.parse.parse('left 50% top 20px')).toEqual(
      new Position(['left', new Percentage(50)], ['top', new Length(20, 'px')]),
    );
    expect(Position.parse.parse('right 20px')).toEqual(
      new Position(['right', new Length(20, 'px')]),
    );
    expect(Position.parse.parse('50% top')).toEqual(
      new Position(new Percentage(50), 'top'),
    );
    expect(Position.parse.parse('30px bottom')).toEqual(
      new Position(new Length(30, 'px'), 'bottom'),
    );
  });

  test('parses length-percentage combinations', () => {
    expect(Position.parse.parse('50% 50%')).toEqual(
      new Position(new Percentage(50), new Percentage(50)),
    );
    expect(Position.parse.parse('20px 30px')).toEqual(
      new Position(new Length(20, 'px'), new Length(30, 'px')),
    );
    expect(Position.parse.parse('25% 40px')).toEqual(
      new Position(new Percentage(25), new Length(40, 'px')),
    );
  });

  test('parses keyword with offset', () => {
    expect(Position.parse.parse('left 20% top 30%')).toEqual(
      new Position(['left', new Percentage(20)], ['top', new Percentage(30)]),
    );
    expect(Position.parse.parse('right 10px bottom 15px')).toEqual(
      new Position(
        ['right', new Length(10, 'px')],
        ['bottom', new Length(15, 'px')],
      ),
    );
  });

  test('rejects invalid positions', () => {
    expect(() => Position.parse.parseToEnd('invalid')).toThrow();
    expect(() => Position.parse.parseToEnd('left left')).toThrow();
    expect(() => Position.parse.parseToEnd('top right bottom')).toThrow();
    expect(() => Position.parse.parseToEnd('20')).toThrow();
  });
});
