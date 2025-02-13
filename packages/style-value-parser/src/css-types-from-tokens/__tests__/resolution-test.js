/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Resolution } from '../resolution';

describe('Test CSS Type: <resolution>', () => {
  test('parses dpi values', () => {
    expect(Resolution.parse.parse('300dpi')).toEqual(
      new Resolution(300, 'dpi'),
    );
  });

  test('parses dpcm values', () => {
    expect(Resolution.parse.parse('118.11dpcm')).toEqual(
      new Resolution(118.11, 'dpcm'),
    );
  });

  test('parses dppx values', () => {
    expect(Resolution.parse.parse('96dppx')).toEqual(
      new Resolution(96, 'dppx'),
    );
  });

  test('rejects invalid resolution values', () => {
    expect(() => Resolution.parse.parseToEnd('invalid')).toThrow();
    expect(() => Resolution.parse.parseToEnd('10abc')).toThrow();
    expect(() => Resolution.parse.parseToEnd('10')).toThrow();
  });
});
