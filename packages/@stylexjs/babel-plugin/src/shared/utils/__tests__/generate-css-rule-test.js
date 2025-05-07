/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { generateCSSRule } from '../generate-css-rule';

describe('generateCSSRule', () => {
  test('handles array of values', () => {
    const result = generateCSSRule(
      'abc123',
      'height',
      ['100vh', '100dvh'],
      [],
      [],
      [],
    );
    expect(result.ltr).toBe('.abc123{height:100vh;height:100dvh}');
    expect(result.rtl).toBe(null);
  });

  test('applies pseudo selector', () => {
    const result = generateCSSRule('abc123', 'color', 'red', [':hover'], [], []);
    expect(result.ltr).toBe('.abc123:hover{color:red}');
    expect(result.rtl).toBe(null);
  });

  test('wraps with one at-rule and bumps specificity once', () => {
    const result = generateCSSRule(
      'abc123',
      'display',
      'none',
      [],
      ['@media (max-width: 600px)'],
      [],
    );
    expect(result.ltr).toBe(
      '@media (max-width: 600px){.abc123.abc123{display:none}}',
    );
    expect(result.rtl).toBe(null);
  });

  test('wraps with two at-rules and bumps specificity twice', () => {
    const result = generateCSSRule(
      'abc123',
      'font-size',
      '16px',
      [],
      ['@supports (font-size: 1rem)', '@media (min-width: 768px)'],
      [],
    );
    expect(result.ltr).toBe(
      '@media (min-width: 768px){@supports (font-size: 1rem){.abc123.abc123.abc123{font-size:16px}}}',
    );
    expect(result.rtl).toBe(null);
  });

  test('applies thumb pseudo with at-rule', () => {
    const result = generateCSSRule(
      'abc123',
      'background',
      'red',
      ['::thumb'],
      ['@media (hover: hover)'],
      [],
    );
    expect(result.ltr).toBe(
      '@media (hover: hover){.abc123.abc123::-webkit-slider-thumb, .abc123.abc123::-moz-range-thumb, .abc123.abc123::-ms-thumb{background:red}}',
    );
    expect(result.rtl).toBe(null);
  });
});
