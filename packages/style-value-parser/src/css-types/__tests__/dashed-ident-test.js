/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { DashedIdentifier } from '../dashed-ident';

describe('Test CSS Type: <dashed-ident>', () => {
  test('parses CSS dashed-ident types strings correctly', () => {
    // --primary-color
    // --secondary-color
    // --tertiary-color
    expect(DashedIdentifier.parse.parse('--primary-color')).toEqual(
      new DashedIdentifier('--primary-color'),
    );
    expect(DashedIdentifier.parse.parse('--secondary-color')).toEqual(
      new DashedIdentifier('--secondary-color'),
    );
    expect(DashedIdentifier.parse.parse('--_tertiary-color')).toEqual(
      new DashedIdentifier('--_tertiary-color'),
    );
    expect(DashedIdentifier.parse.parse('--_tertiary-color-')).toEqual(
      new DashedIdentifier('--_tertiary-color-'),
    );
    expect(DashedIdentifier.parse.parse('--_1')).toEqual(
      new DashedIdentifier('--_1'),
    );
    expect(DashedIdentifier.parse.parse('--_1\\.1')).toEqual(
      new DashedIdentifier('--_1\\.1'),
    );
  });
  test('fails to parse invalid CSS dashed-ident types strings', () => {
    expect(DashedIdentifier.parse.parse('-_1')).toBeInstanceOf(Error);
    expect(DashedIdentifier.parse.parse('--')).toBeInstanceOf(Error);
    expect(DashedIdentifier.parse.parse('1')).toBeInstanceOf(Error);
    expect(DashedIdentifier.parse.parse('1-')).toBeInstanceOf(Error);
    expect(DashedIdentifier.parse.parse('1-2')).toBeInstanceOf(Error);
    expect(DashedIdentifier.parse.parse('1-2-')).toBeInstanceOf(Error);
  });
});
