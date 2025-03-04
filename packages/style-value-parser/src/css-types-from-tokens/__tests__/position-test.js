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
    expect(Position.parser.parse('left')).toEqual(
      new Position('left', undefined),
    );
    expect(Position.parser.parse('right')).toEqual(
      new Position('right', undefined),
    );
    expect(Position.parser.parse('center')).toEqual(
      new Position('center', undefined),
    );
    expect(Position.parser.parse('top')).toEqual(
      new Position(undefined, 'top'),
    );
    expect(Position.parser.parse('bottom')).toEqual(
      new Position(undefined, 'bottom'),
    );
    expect(Position.parser.parse('center')).toEqual(
      new Position('center', undefined),
    );
  });

  test('parses keyword combinations', () => {
    expect(Position.parser.parse('left top')).toEqual(
      new Position('left', 'top'),
    );
    expect(Position.parser.parse('right bottom')).toEqual(
      new Position('right', 'bottom'),
    );
    expect(Position.parser.parse('center center')).toEqual(
      new Position('center', 'center'),
    );
    expect(Position.parser.parse('left bottom')).toEqual(
      new Position('left', 'bottom'),
    );
    expect(Position.parser.parse('right top')).toEqual(
      new Position('right', 'top'),
    );
  });

  test('parses keyword with length-percentage', () => {
    expect(Position.parser.parse('left 50% top 20px')).toEqual(
      new Position(['left', new Percentage(50)], ['top', new Length(20, 'px')]),
    );
    expect(Position.parser.parse('right 20px')).toEqual(
      new Position(['right', new Length(20, 'px')]),
    );
    expect(Position.parser.parse('50% top')).toEqual(
      new Position(new Percentage(50), 'top'),
    );
    expect(Position.parser.parse('30px bottom')).toEqual(
      new Position(new Length(30, 'px'), 'bottom'),
    );
  });

  test('parses length-percentage combinations', () => {
    expect(Position.parser.parse('50% 50%')).toEqual(
      new Position(new Percentage(50), new Percentage(50)),
    );
    expect(Position.parser.parse('20px 30px')).toEqual(
      new Position(new Length(20, 'px'), new Length(30, 'px')),
    );
    expect(Position.parser.parse('25% 40px')).toEqual(
      new Position(new Percentage(25), new Length(40, 'px')),
    );
  });

  test('parses keyword with offset', () => {
    expect(Position.parser.parse('left 20% top 30%')).toEqual(
      new Position(['left', new Percentage(20)], ['top', new Percentage(30)]),
    );
    expect(Position.parser.parse('right 10px bottom 15px')).toEqual(
      new Position(
        ['right', new Length(10, 'px')],
        ['bottom', new Length(15, 'px')],
      ),
    );
  });

  test('rejects invalid positions', () => {
    expect(() => Position.parser.parseToEnd('invalid')).toThrow();
    expect(() => Position.parser.parseToEnd('left left')).toThrow();
    expect(() => Position.parser.parseToEnd('top right bottom')).toThrow();
    expect(() => Position.parser.parseToEnd('20')).toThrow();
  });
});
