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
    expect(Color.parse.parse('red')).toEqual(new NamedColor('red'));
    expect(Color.parse.parse('blue')).toEqual(new NamedColor('blue'));
    expect(Color.parse.parse('green')).toEqual(new NamedColor('green'));
    expect(Color.parse.parse('transparent')).toEqual(
      new NamedColor('transparent'),
    );
  });

  test('parses hash colors', () => {
    expect(Color.parse.parse('#ff0000')).toEqual(new HashColor('ff0000'));
    expect(Color.parse.parse('#00ff00')).toEqual(new HashColor('00ff00'));
    expect(Color.parse.parse('#0000ff')).toEqual(new HashColor('0000ff'));
    expect(Color.parse.parse('#ffffff')).toEqual(new HashColor('ffffff'));
  });

  test('parses RGB values', () => {
    expect(Color.parse.parse('rgb(255, 0, 0)')).toEqual(new Rgb(255, 0, 0));
    expect(Color.parse.parse('rgb(0, 255, 0)')).toEqual(new Rgb(0, 255, 0));
    expect(Color.parse.parse('rgb(0, 0, 255)')).toEqual(new Rgb(0, 0, 255));
  });

  test('parses space-separated RGB values', () => {
    expect(Color.parse.parse('rgb(255 0 0)')).toEqual(new Rgb(255, 0, 0));
    expect(Color.parse.parse('rgb(0 255 0)')).toEqual(new Rgb(0, 255, 0));
    expect(Color.parse.parse('rgb(0 0 255)')).toEqual(new Rgb(0, 0, 255));
  });

  test('parses RGBA values', () => {
    expect(Color.parse.parse('rgba(255, 0, 0, 0.5)')).toEqual(
      new Rgba(255, 0, 0, 0.5),
    );
    expect(Color.parse.parse('rgba(0, 255, 0, 0.5)')).toEqual(
      new Rgba(0, 255, 0, 0.5),
    );
    expect(Color.parse.parse('rgba(0, 0, 255, 0.5)')).toEqual(
      new Rgba(0, 0, 255, 0.5),
    );
  });

  test('parses space-separated RGBA values', () => {
    expect(Color.parse.parse('rgb(255 0 0 / 0.5)')).toEqual(
      new Rgba(255, 0, 0, 0.5),
    );
    expect(Color.parse.parse('rgb(0 255 0 / 0.5)')).toEqual(
      new Rgba(0, 255, 0, 0.5),
    );
    expect(Color.parse.parse('rgb(0 0 255 / 0.5)')).toEqual(
      new Rgba(0, 0, 255, 0.5),
    );

    expect(Color.parse.parse('rgb(255 0 0 / 50%)')).toEqual(
      new Rgba(255, 0, 0, 0.5),
    );
    expect(Color.parse.parse('rgb(0 255 0 / 50%)')).toEqual(
      new Rgba(0, 255, 0, 0.5),
    );
    expect(Color.parse.parse('rgb(0 0 255 / 50%)')).toEqual(
      new Rgba(0, 0, 255, 0.5),
    );
  });

  test('parses lch values', () => {
    expect(Lch.parse.parse('lch(50% 100 270deg)')).toEqual(
      new Lch(50, 100, new Angle(270, 'deg')),
    );
  });

  test('rejects invalid colors', () => {
    expect(() => Color.parse.parseToEnd('invalid')).toThrow();
    expect(() => Color.parse.parseToEnd('#gggggg')).toThrow();
    expect(() => Color.parse.parseToEnd('rgb(256, 0, 0)')).toThrow();
  });
});
