/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { HashColor, NamedColor, Rgba } from '../../css-types/color';
import { Em, Px, Rem, Vw } from '../../css-types/length';
import { BoxShadow, BoxShadowSingle } from '../box-shadow';

describe('Test CSS property: `box-shadow`', () => {
  test('Single Shadow', () => {
    expect(BoxShadow.parse.parseToEnd('10px 10px 5px 10px red')).toEqual(
      new BoxShadow([
        new BoxShadowSingle(
          new Px(10),
          new Px(10),
          new Px(5),
          new Px(10),
          new NamedColor('red'),
        ),
      ]),
    );

    expect(
      BoxShadow.parse.parseToEnd('0.5em -2em 2em 10em rgb(0 0 0 / 20%)'),
    ).toEqual(
      new BoxShadow([
        new BoxShadowSingle(
          new Em(0.5),
          new Em(-2),
          new Em(2),
          new Em(10),
          new Rgba(0, 0, 0, 0.2),
        ),
      ]),
    );

    expect(BoxShadow.parse.parseToEnd('10px 10px 5px 10px red inset')).toEqual(
      new BoxShadow([
        new BoxShadowSingle(
          new Px(10),
          new Px(10),
          new Px(5),
          new Px(10),
          new NamedColor('red'),
          true,
        ),
      ]),
    );

    expect(
      BoxShadow.parse.parseToEnd('-2rem 5vw 1em 1rem rgba(255, 255, 0, 0.6)'),
    ).toEqual(
      new BoxShadow([
        new BoxShadowSingle(
          new Rem(-2),
          new Vw(5),
          new Em(1),
          new Rem(1),
          new Rgba(255, 255, 0, 0.6),
        ),
      ]),
    );
  });

  test('Multiple shadows seperated by comma', () => {
    expect(
      BoxShadow.parse.parseToEnd(
        '10px 10px 5px 10px #000000 inset, 3px 3px 2px 0px #0ba266',
      ),
    ).toEqual(
      new BoxShadow([
        new BoxShadowSingle(
          new Px(10),
          new Px(10),
          new Px(5),
          new Px(10),
          new HashColor('000000'),
          true,
        ),
        new BoxShadowSingle(
          new Px(3),
          new Px(3),
          new Px(2),
          new Px(0),
          new HashColor('0ba266'),
        ),
      ]),
    );
  });
});
