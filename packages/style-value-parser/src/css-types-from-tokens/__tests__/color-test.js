/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Angle } from '../angle';
import { Color, NamedColor, HashColor, Rgb, Rgba, Lch } from '../color';

describe('Test CSS Type: <color>', () => {
  test('parses named colors', () => {
    expect(Color.parser.parse('red')).toEqual(new NamedColor('red'));
    expect(Color.parser.parse('blue')).toEqual(new NamedColor('blue'));
    expect(Color.parser.parse('green')).toEqual(new NamedColor('green'));
    expect(Color.parser.parse('transparent')).toEqual(
      new NamedColor('transparent'),
    );
  });

  test('parses hash colors', () => {
    expect(Color.parser.parse('#ff0000')).toEqual(new HashColor('ff0000'));
    expect(Color.parser.parse('#00ff00')).toEqual(new HashColor('00ff00'));
    expect(Color.parser.parse('#0000ff')).toEqual(new HashColor('0000ff'));
    expect(Color.parser.parse('#ffffff')).toEqual(new HashColor('ffffff'));
  });

  test('parses RGB values', () => {
    expect(Color.parser.parse('rgb(255, 0, 0)')).toEqual(new Rgb(255, 0, 0));
    expect(Color.parser.parse('rgb(0, 255, 0)')).toEqual(new Rgb(0, 255, 0));
    expect(Color.parser.parse('rgb(0, 0, 255)')).toEqual(new Rgb(0, 0, 255));
  });

  test('parses space-separated RGB values', () => {
    expect(Color.parser.parse('rgb(255 0 0)')).toEqual(new Rgb(255, 0, 0));
    expect(Color.parser.parse('rgb(0 255 0)')).toEqual(new Rgb(0, 255, 0));
    expect(Color.parser.parse('rgb(0 0 255)')).toEqual(new Rgb(0, 0, 255));
  });

  test('parses RGBA values', () => {
    expect(Color.parser.parse('rgba(255, 0, 0, 0.5)')).toEqual(
      new Rgba(255, 0, 0, 0.5),
    );
    expect(Color.parser.parse('rgba(0, 255, 0, 0.5)')).toEqual(
      new Rgba(0, 255, 0, 0.5),
    );
    expect(Color.parser.parse('rgba(0, 0, 255, 0.5)')).toEqual(
      new Rgba(0, 0, 255, 0.5),
    );
  });

  test('parses space-separated RGBA values', () => {
    expect(Color.parser.parse('rgb(255 0 0 / 0.5)')).toEqual(
      new Rgba(255, 0, 0, 0.5),
    );
    expect(Color.parser.parse('rgb(0 255 0 / 0.5)')).toEqual(
      new Rgba(0, 255, 0, 0.5),
    );
    expect(Color.parser.parse('rgb(0 0 255 / 0.5)')).toEqual(
      new Rgba(0, 0, 255, 0.5),
    );

    expect(Color.parser.parse('rgb(255 0 0 / 50%)')).toEqual(
      new Rgba(255, 0, 0, 0.5),
    );
    expect(Color.parser.parse('rgb(0 255 0 / 50%)')).toEqual(
      new Rgba(0, 255, 0, 0.5),
    );
    expect(Color.parser.parse('rgb(0 0 255 / 50%)')).toEqual(
      new Rgba(0, 0, 255, 0.5),
    );
  });

  test('parses lch values', () => {
    expect(Lch.parser.parse('lch(50% 100 270deg)')).toEqual(
      new Lch(50, 100, new Angle(270, 'deg')),
    );
  });

  test('rejects invalid colors', () => {
    expect(() => Color.parser.parseToEnd('invalid')).toThrow();
    expect(() => Color.parser.parseToEnd('#gggggg')).toThrow();
    expect(() => Color.parser.parseToEnd('rgb(256, 0, 0)')).toThrow();
  });
});
