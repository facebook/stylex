/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { types as t } from '../../src/';

describe('stylex-types-test', () => {
  describe('class methods', () => {
    test('angle', () => {
      const obj = t.Angle.create('45deg');
      expect(obj.value).toEqual('45deg');
      expect(obj.syntax).toEqual('<angle>');
    });

    test('color', () => {
      const value = { default: 'red' };

      const obj = t.Color.create<string>(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<color>');
    });

    test('image', () => {
      const value = 'url(#image)';
      const obj = t.Image.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<image>');
    });

    test('integer', () => {
      const value = 1;
      const obj = t.Integer.create(value);
      expect(obj.value).toEqual('1');
      expect(obj.syntax).toEqual('<integer>');
    });

    test('length', () => {
      const value = '1px';
      const obj = t.Length.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<length>');

      const obj2 = t.Length.create(1);
      expect(obj2.value).toEqual(value);
      expect(obj2.syntax).toEqual('<length>');
    });

    test('percentage', () => {
      const value = '50%';
      const obj = t.Percentage.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<percentage>');

      const obj2 = t.Percentage.create(0.5);
      expect(obj2.value).toEqual(value);
      expect(obj2.syntax).toEqual('<percentage>');
    });

    test('num', () => {
      const value = 1;
      const obj = t.Num.create(value);
      expect(obj.value).toEqual('1');
      expect(obj.syntax).toEqual('<number>');
    });

    test('integer', () => {
      const value = 1;
      const obj = t.Integer.create(value);
      expect(obj.value).toEqual('1');
      expect(obj.syntax).toEqual('<integer>');
    });

    test('resolution', () => {
      const value = '96dpi';
      const obj = t.Resolution.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<resolution>');
    });

    test('time', () => {
      const value = '1s';
      const obj = t.Time.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<time>');
    });

    test('transformFunction', () => {
      const value = 'translateX(10px)';
      const obj = t.TransformFunction.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<transform-function>');
    });

    test('transformList', () => {
      const value = 'translateX(10px)';
      const obj = t.TransformList.create(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<transform-list>');
    });

    test('url', () => {
      const value = 'url(#image)';
      const obj = t.Url.create(value);
      expect(obj.value).toEqual(value);
    });
  });
  describe('standalone factory functions', () => {
    test('angle', () => {
      const obj = t.angle('45deg');
      expect(obj.value).toEqual('45deg');
      expect(obj.syntax).toEqual('<angle>');
    });

    test('color', () => {
      const value = { default: 'red' };

      const obj = t.color<string>(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<color>');
    });

    test('image', () => {
      const value = 'url(#image)';
      const obj = t.image(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<image>');
    });

    test('integer', () => {
      const value = 1;
      const obj = t.integer(value);
      expect(obj.value).toEqual('1');
      expect(obj.syntax).toEqual('<integer>');
    });

    test('length', () => {
      const value = '1px';
      const obj = t.length(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<length>');

      const obj2 = t.length(1);
      expect(obj2.value).toEqual(value);
      expect(obj2.syntax).toEqual('<length>');
    });

    test('percentage', () => {
      const value = '50%';
      const obj = t.percentage(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<percentage>');

      const obj2 = t.percentage(0.5);
      expect(obj2.value).toEqual(value);
      expect(obj2.syntax).toEqual('<percentage>');
    });

    test('num', () => {
      const value = 1;
      const obj = t.number(value);
      expect(obj.value).toEqual('1');
      expect(obj.syntax).toEqual('<number>');
    });

    test('integer', () => {
      const value = 1;
      const obj = t.integer(value);
      expect(obj.value).toEqual('1');
      expect(obj.syntax).toEqual('<integer>');
    });

    test('resolution', () => {
      const value = '96dpi';
      const obj = t.resolution(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<resolution>');
    });

    test('time', () => {
      const value = '1s';
      const obj = t.time(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<time>');
    });

    test('transformFunction', () => {
      const value = 'translateX(10px)';
      const obj = t.transformFunction(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<transform-function>');
    });

    test('transformList', () => {
      const value = 'translateX(10px)';
      const obj = t.transformList(value);
      expect(obj.value).toEqual(value);
      expect(obj.syntax).toEqual('<transform-list>');
    });

    test('url', () => {
      const value = 'url(#image)';
      const obj = t.url(value);
      expect(obj.value).toEqual(value);
    });
  });
});
