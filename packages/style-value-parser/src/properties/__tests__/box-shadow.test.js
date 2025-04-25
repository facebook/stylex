/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { BoxShadow, BoxShadowList } from '../box-shadow';
import { Length } from '../../css-types/length';
import { HashColor, Hsla, Rgba } from '../../css-types/color';
import { Angle } from '../../css-types/angle';
import { Percentage } from '../../css-types/common-types';

describe('Test CSS property: `box-shadow`', () => {
  describe('BoxShadow', () => {
    test('Valid: box-shadow with required parameters (offsetX, offsetY, color)', () => {
      expect(BoxShadow.parse.parseToEnd('10px 5px #ff0000')).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(0, 'px'),
          new Length(0, 'px'),
          new HashColor('ff0000'),
        ),
      );
    });

    test('Valid: box-shadow with blur radius (offsetX, offsetY, blurRadius, color)', () => {
      expect(BoxShadow.parse.parseToEnd('10px 5px 15px #ff0000')).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(15, 'px'),
          new Length(0, 'px'),
          new HashColor('ff0000'),
        ),
      );
    });

    test('Valid: box-shadow with blur and spread radius (offsetX, offsetY, blurRadius, spreadRadius, color)', () => {
      expect(BoxShadow.parse.parseToEnd('10px 5px 15px 8px #ff0000')).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(15, 'px'),
          new Length(8, 'px'),
          new HashColor('ff0000'),
        ),
      );
    });

    test('Valid: box-shadow with inset keyword', () => {
      expect(BoxShadow.parse.parseToEnd('10px 5px #ff0000 inset')).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(0, 'px'),
          new Length(0, 'px'),
          new HashColor('ff0000'),
          true,
        ),
      );
    });

    test('Valid: box-shadow with inset keyword and blur/spread radius', () => {
      expect(
        BoxShadow.parse.parseToEnd('10px 5px 15px 8px #ff0000 inset'),
      ).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(15, 'px'),
          new Length(8, 'px'),
          new HashColor('ff0000'),
          true,
        ),
      );
    });

    test('Valid: box-shadow with different length units', () => {
      expect(
        BoxShadow.parse.parseToEnd('1rem 0.5em 2vw 1vh rgba(0, 0, 0, 0.5)'),
      ).toEqual(
        new BoxShadow(
          new Length(1, 'rem'),
          new Length(0.5, 'em'),
          new Length(2, 'vw'),
          new Length(1, 'vh'),
          new Rgba(0, 0, 0, 0.5),
        ),
      );
    });

    test('Valid: box-shadow with rgba color', () => {
      expect(
        BoxShadow.parse.parseToEnd('10px 5px rgba(255, 0, 0, 0.5)'),
      ).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(0, 'px'),
          new Length(0, 'px'),
          new Rgba(255, 0, 0, 0.5),
        ),
      );
    });

    test('Valid: box-shadow with hsla color', () => {
      // Note: The exact RGB values will depend on how the Color class converts HSLA to RGBA
      const result = BoxShadow.parse.parseToEnd(
        '10px 5px hsla(0, 100%, 50%, 0.5)',
      );
      expect(result).toEqual(
        new BoxShadow(
          new Length(10, 'px'),
          new Length(5, 'px'),
          new Length(0, 'px'),
          new Length(0, 'px'),
          new Hsla(
            new Angle(0, 'deg'),
            new Percentage(100),
            new Percentage(50),
            0.5,
          ),
        ),
      );
    });
  });

  describe('BoxShadowList', () => {
    test('Valid: single box-shadow', () => {
      expect(BoxShadowList.parse.parseToEnd('10px 5px #ff0000')).toEqual(
        new BoxShadowList([
          new BoxShadow(
            new Length(10, 'px'),
            new Length(5, 'px'),
            new Length(0, 'px'),
            new Length(0, 'px'),
            new HashColor('ff0000'),
          ),
        ]),
      );
    });

    test('Valid: multiple box-shadows', () => {
      expect(
        BoxShadowList.parse.parseToEnd(
          '10px 5px #ff0000, 5px 5px 10px #00ff00, 0 0 15px 5px rgba(0, 0, 255, 0.5) inset',
        ),
      ).toEqual(
        new BoxShadowList([
          new BoxShadow(
            new Length(10, 'px'),
            new Length(5, 'px'),
            new Length(0, 'px'),
            new Length(0, 'px'),
            new HashColor('ff0000'),
          ),
          new BoxShadow(
            new Length(5, 'px'),
            new Length(5, 'px'),
            new Length(10, 'px'),
            new Length(0, 'px'),
            new HashColor('00ff00'),
          ),
          new BoxShadow(
            new Length(0, ''),
            new Length(0, ''),
            new Length(15, 'px'),
            new Length(5, 'px'),
            new Rgba(0, 0, 255, 0.5),
            true,
          ),
        ]),
      );
    });

    test('Valid: box-shadows with whitespace around commas', () => {
      expect(
        BoxShadowList.parse.parseToEnd(
          '10px 5px #ff0000 , 5px 5px 10px #00ff00',
        ),
      ).toEqual(
        new BoxShadowList([
          new BoxShadow(
            new Length(10, 'px'),
            new Length(5, 'px'),
            new Length(0, 'px'),
            new Length(0, 'px'),
            new HashColor('ff0000'),
          ),
          new BoxShadow(
            new Length(5, 'px'),
            new Length(5, 'px'),
            new Length(10, 'px'),
            new Length(0, 'px'),
            new HashColor('00ff00'),
          ),
        ]),
      );
    });
  });

  describe('Invalid cases', () => {
    test('Invalid: missing required parameters', () => {
      expect(() => BoxShadow.parse.parseToEnd('10px')).toThrow();
      expect(() => BoxShadow.parse.parseToEnd('#ff0000')).toThrow();
    });

    test('Invalid: incorrect order of parameters', () => {
      expect(() => BoxShadow.parse.parseToEnd('#ff0000 10px 5px')).toThrow();
      expect(() => BoxShadow.parse.parseToEnd('inset 10px 5px')).toThrow(); // inset must come after color
    });

    test('Invalid: malformed values', () => {
      expect(() => BoxShadow.parse.parseToEnd('10px 5px #ff00')).toThrow(); // invalid hex color
      expect(() => BoxShadow.parse.parseToEnd('10 5px #ff0000')).toThrow(); // missing unit
    });
  });
});
