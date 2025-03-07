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
    expect(Resolution.parser.parse('300dpi')).toEqual(
      new Resolution(300, 'dpi'),
    );
  });

  test('parses dpcm values', () => {
    expect(Resolution.parser.parse('118.11dpcm')).toEqual(
      new Resolution(118.11, 'dpcm'),
    );
  });

  test('parses dppx values', () => {
    expect(Resolution.parser.parse('96dppx')).toEqual(
      new Resolution(96, 'dppx'),
    );
  });

  test('rejects invalid resolution values', () => {
    expect(() => Resolution.parser.parseToEnd('invalid')).toThrow();
    expect(() => Resolution.parser.parseToEnd('10abc')).toThrow();
    expect(() => Resolution.parser.parseToEnd('10')).toThrow();
  });
});
