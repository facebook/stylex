/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { alphaValue } from '../alpha-value';

describe('Test CSS Type: <alpha-value>', () => {
  describe('Number Fractions', () => {
    test('0.5', () => {
      expect(alphaValue.parse('0.5')).toEqual(0.5);
    });
    test('.5', () => {
      expect(alphaValue.parse('.5')).toEqual(0.5);
    });
    test('0.25', () => {
      expect(alphaValue.parse('0.25')).toEqual(0.25);
    });
    test('.25', () => {
      expect(alphaValue.parse('.25')).toEqual(0.25);
    });
    test('0.75', () => {
      expect(alphaValue.parse('0.75')).toEqual(0.75);
    });
    test('.75', () => {
      expect(alphaValue.parse('.75')).toEqual(0.75);
    });
    test('1', () => {
      expect(alphaValue.parse('1')).toEqual(1);
    });
    test('parses decimal alpha values', () => {
      expect(alphaValue.parse('0')).toEqual(0);
      expect(alphaValue.parse('0.25')).toEqual(0.25);
      expect(alphaValue.parse('0.5')).toEqual(0.5);
      expect(alphaValue.parse('1')).toEqual(1);
    });
  });
  describe('Percentages', () => {
    test('50%', () => {
      expect(alphaValue.parse('50%')).toEqual(0.5);
    });
    test('25%', () => {
      expect(alphaValue.parse('25%')).toEqual(0.25);
    });
    test('75%', () => {
      expect(alphaValue.parse('75%')).toEqual(0.75);
    });
    test('75.5%', () => {
      expect(alphaValue.parse('75.5%')).toEqual(0.755);
    });
    test('0.25%', () => {
      expect(alphaValue.parse('0.25%')).toEqual(0.0025);
    });
    test('.25%', () => {
      expect(alphaValue.parse('.25%')).toEqual(0.0025);
    });
    test('parses percentage alpha values', () => {
      expect(alphaValue.parse('0%')).toEqual(0);
      expect(alphaValue.parse('25%')).toEqual(0.25);
      expect(alphaValue.parse('50%')).toEqual(0.5);
      expect(alphaValue.parse('100%')).toEqual(1);
    });
  });
});
