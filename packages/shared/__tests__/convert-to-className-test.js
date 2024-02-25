/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { convertStyleToClassName } from '../src/convert-to-className';

const extractBody = (str: string) => str.slice(str.indexOf('{') + 1, -1);

const convert = (styles: Parameters<typeof convertStyleToClassName>[0]) =>
  extractBody(convertStyleToClassName(styles, [], [])[2].ltr);

describe('convert-to-className test', () => {
  test('converts style to className', () => {
    expect(convert(['margin', 10])).toEqual('margin:10px');
  });
  test('converts margin number to px', () => {
    expect(convert(['margin', 10])).toEqual('margin:10px');
  });
  test('keeps number for zIndex', () => {
    expect(convert(['zIndex', 10])).toEqual('z-index:10');
  });
  test('keeps number for opacity', () => {
    expect(convert(['opacity', 0.25])).toEqual('opacity:.25');
  });
  test('handles array of values', () => {
    // Last value wins.
    expect(convert(['height', [500, '100vh', '100dvh']])).toEqual(
      'height:500px;height:100vh;height:100dvh',
    );
  });
  test('handles array of values with var', () => {
    expect(convert(['height', [500, 'var(--height)', '100dvh']])).toEqual(
      'height:var(--height,500px);height:100dvh',
    );
  });
  test('handles array with multiple vars', () => {
    expect(
      convert(['height', [500, 'var(--x)', 'var(--y)', '100dvh']]),
    ).toEqual('height:var(--y,var(--x,500px));height:100dvh');
  });
  test('handles array with multiple vars and multiple fallbacks', () => {
    expect(
      convert(['height', [500, '100vh', 'var(--x)', 'var(--y)', '100dvh']]),
    ).toEqual(
      'height:var(--y,var(--x,500px));height:var(--y,var(--x,100vh));height:100dvh',
    );
  });
});
