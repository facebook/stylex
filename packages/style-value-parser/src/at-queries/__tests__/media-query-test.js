/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length } from '../../css-types/length';
import {
  MaxHeightMediaRule,
  MinHeightMediaRule,
  MaxWidthMediaRule,
  MinWidthMediaRule,
} from '../media-query';

describe('Test Rules for @meia queries', () => {
  test('parses min-width rule correctly', () => {
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 320px)')).toEqual(
      new MinWidthMediaRule(new Length(320, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 320.1px)')).toEqual(
      new MinWidthMediaRule(new Length(320.1, 'px')),
    );
  });

  test('parses max-width rule correctly', () => {
    expect(MaxWidthMediaRule.parse.parseToEnd('(max-width: 768px)')).toEqual(
      new MaxWidthMediaRule(new Length(768, 'px')),
    );
    expect(MaxWidthMediaRule.parse.parseToEnd('(max-width: 1024px)')).toEqual(
      new MaxWidthMediaRule(new Length(1024, 'px')),
    );
  });

  test('parses min-height rule correctly', () => {
    expect(MinHeightMediaRule.parse.parseToEnd('(min-height: 480px)')).toEqual(
      new MinHeightMediaRule(new Length(480, 'px')),
    );
    expect(MinHeightMediaRule.parse.parseToEnd('(min-height: 720px)')).toEqual(
      new MinHeightMediaRule(new Length(720, 'px')),
    );
  });

  test('parses max-height rule correctly', () => {
    expect(MaxHeightMediaRule.parse.parseToEnd('(max-height: 1080px)')).toEqual(
      new MaxHeightMediaRule(new Length(1080, 'px')),
    );
    expect(MaxHeightMediaRule.parse.parseToEnd('(max-height: 1440px)')).toEqual(
      new MaxHeightMediaRule(new Length(1440, 'px')),
    );
  });
  test('parses min-width rule correctly', () => {
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 320px)')).toEqual(
      new MinWidthMediaRule(new Length(320, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 320.1px)')).toEqual(
      new MinWidthMediaRule(new Length(320.1, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 480px)')).toEqual(
      new MinWidthMediaRule(new Length(480, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 768px)')).toEqual(
      new MinWidthMediaRule(new Length(768, 'px')),
    );
  });

  test('parses max-width rule correctly', () => {
    expect(MaxWidthMediaRule.parse.parseToEnd('(max-width: 768px)')).toEqual(
      new MaxWidthMediaRule(new Length(768, 'px')),
    );
    expect(MaxWidthMediaRule.parse.parseToEnd('(max-width: 1024px)')).toEqual(
      new MaxWidthMediaRule(new Length(1024, 'px')),
    );
  });

  test('parses min-height rule correctly', () => {
    expect(MinHeightMediaRule.parse.parseToEnd('(min-height: 480px)')).toEqual(
      new MinHeightMediaRule(new Length(480, 'px')),
    );
    expect(MinHeightMediaRule.parse.parseToEnd('(min-height: 720px)')).toEqual(
      new MinHeightMediaRule(new Length(720, 'px')),
    );
  });

  test('parses max-height rule correctly', () => {
    expect(MaxHeightMediaRule.parse.parseToEnd('(max-height: 1080px)')).toEqual(
      new MaxHeightMediaRule(new Length(1080, 'px')),
    );
    expect(MaxHeightMediaRule.parse.parseToEnd('(max-height: 1440px)')).toEqual(
      new MaxHeightMediaRule(new Length(1440, 'px')),
    );
  });

  test('parses min-width rule correctly', () => {
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 320px)')).toEqual(
      new MinWidthMediaRule(new Length(320, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 320.1px)')).toEqual(
      new MinWidthMediaRule(new Length(320.1, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 480px)')).toEqual(
      new MinWidthMediaRule(new Length(480, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 768px)')).toEqual(
      new MinWidthMediaRule(new Length(768, 'px')),
    );
    expect(MinWidthMediaRule.parse.parseToEnd('(min-width: 24rem)')).toEqual(
      new MinWidthMediaRule(new Length(24, 'rem')),
    );
  });
});
