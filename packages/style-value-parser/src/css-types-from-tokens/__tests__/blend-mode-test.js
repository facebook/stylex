/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { blendMode } from '../blend-mode';

describe('Test CSS Type: <blend-mode>', () => {
  test('parses valid blend mode values', () => {
    expect(blendMode.parse('normal')).toBe('normal');
    expect(blendMode.parse('multiply')).toBe('multiply');
    expect(blendMode.parse('screen')).toBe('screen');
    expect(blendMode.parse('overlay')).toBe('overlay');
    expect(blendMode.parse('darken')).toBe('darken');
    expect(blendMode.parse('lighten')).toBe('lighten');
    expect(blendMode.parse('color-dodge')).toBe('color-dodge');
    expect(blendMode.parse('color-burn')).toBe('color-burn');
    expect(blendMode.parse('hard-light')).toBe('hard-light');
    expect(blendMode.parse('soft-light')).toBe('soft-light');
    expect(blendMode.parse('difference')).toBe('difference');
    expect(blendMode.parse('exclusion')).toBe('exclusion');
    expect(blendMode.parse('hue')).toBe('hue');
    expect(blendMode.parse('saturation')).toBe('saturation');
    expect(blendMode.parse('color')).toBe('color');
    expect(blendMode.parse('luminosity')).toBe('luminosity');
  });

  test('rejects invalid blend mode values', () => {
    expect(() => blendMode.parseToEnd('invalid')).toThrow();
    expect(() => blendMode.parseToEnd('blend')).toThrow();
    expect(() => blendMode.parseToEnd('123')).toThrow();
  });
});
