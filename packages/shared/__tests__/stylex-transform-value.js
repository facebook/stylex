/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import transformValue from '../src/transform-value';

describe('transformValue content property tests', () => {
  test('preserves CSS functions without quotes', () => {
    const functions = [
      'counters(div, ".")',
      'counter(chapter)',
      'counter(chapter, upper-roman)',
      'attr(href)',
      'url(image.jpg)',
      'linear-gradient(#e66465, #9198e5)',
      'image-set("image1x.png" 1x, "image2x.png" 2x)',
      '"prefix"attr(href)',
      'url(foo.jpg)attr(alt)',
    ];

    functions.forEach((input) => {
      expect(transformValue('content', input, {})).toBe(input);
    });
  });

  test('preserves CSS keywords without quotes', () => {
    const keywords = [
      'normal',
      'none',
      'open-quote',
      'close-quote',
      'no-open-quote',
      'no-close-quote',
      'inherit',
      'initial',
      'revert',
      'revert-layer',
      'unset',
    ];

    keywords.forEach((keyword) => {
      expect(transformValue('content', keyword, {})).toBe(keyword);
    });
  });

  test('handles mixed content values', () => {
    const mixedValues = [
      'open-quote counter(chapter)',
      '"prefix"url(image.jpg)',
      'url("test.png")/"Alt text"',
      'open-quotecounter(chapter)close-quote',
      'attr(href)normal',
      '"text"attr(href)"more text"',
      'counter(x)"text"counter(y)',
    ];

    mixedValues.forEach((input) => {
      expect(transformValue('content', input, {})).toBe(input);
    });
  });

  test('adds quotes to plain strings', () => {
    const strings = [
      ['Hello world', '"Hello world"'],
      ['Simple text', '"Simple text"'],
      ['123', '"123"'],
    ];

    strings.forEach(([input, expected]) => {
      expect(transformValue('content', input, {})).toBe(expected);
    });
  });
});
