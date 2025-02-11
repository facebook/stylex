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
  test('parses valid dashed identifiers', () => {
    expect(DashedIdentifier.parse.parse('--custom-property')).toEqual(
      new DashedIdentifier('--custom-property'),
    );
    expect(DashedIdentifier.parse.parse('--theme-color')).toEqual(
      new DashedIdentifier('--theme-color'),
    );
    expect(DashedIdentifier.parse.parse('--123')).toEqual(
      new DashedIdentifier('--123'),
    );
    expect(DashedIdentifier.parse.parse('--_private')).toEqual(
      new DashedIdentifier('--_private'),
    );
  });

  // test('rejects invalid dashed identifiers', () => {
  //   expect(() =>
  //     DashedIdentifier.parse.parseToEnd('custom-property'),
  //   ).toThrow();
  //   expect(() =>
  //     DashedIdentifier.parse.parseToEnd('-custom-property'),
  //   ).toThrow();
  //   expect(() => DashedIdentifier.parse.parseToEnd('---property')).toThrow();
  //   expect(() => DashedIdentifier.parse.parseToEnd('property')).toThrow();
  //   expect(() => DashedIdentifier.parse.parseToEnd('--')).toThrow();
  // });
});
