/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import getCompressedKey, { propertyShorthands } from '../property-shorthands';

describe('property shorthands', () => {
  test('uses readable shorthands for common properties', () => {
    expect(getCompressedKey('margin')).toBe('m');
    expect(getCompressedKey('marginTop')).toBe('mt');
    expect(getCompressedKey('marginInlineStart')).toBe('ms');
    expect(getCompressedKey('paddingTop')).toBe('pt');
    expect(getCompressedKey('display')).toBe('d');
    expect(getCompressedKey('position')).toBe('po');
  });

  test('falls back to hashing uncommon properties and conditional keys', () => {
    expect(getCompressedKey('animationTimeline')).toMatch(/^k[0-9A-Za-z]+$/);
    expect(getCompressedKey(':hover_margin')).toMatch(/^k[0-9A-Za-z]+$/);
  });

  test('contains only unique shorthands of three characters or fewer', () => {
    const shorthands = Object.values(propertyShorthands);

    expect(new Set(shorthands).size).toBe(shorthands.length);
    expect(shorthands.every((key) => /^[a-z]{1,3}$/.test(key))).toBe(true);
  });
});
