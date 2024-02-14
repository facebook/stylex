/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import firstThatWorks from '../src/stylex-first-that-works';

describe('stylex-first-that-works test', () => {
  test('reverses simple array of values', () => {
    expect(firstThatWorks('a', 'b', 'c')).toEqual(['c', 'b', 'a']);
  });
});
