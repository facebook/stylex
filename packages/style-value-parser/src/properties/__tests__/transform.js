/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  Matrix,
  Matrix3d,
  Perspective,
  Rotate,
  Rotate3d,
  RotateXYZ,
  Scale,
  Scale3d,
  Skew,
  Translate,
} from '../../css-types-from-tokens/transform-function';

import { Length } from '../../css-types-from-tokens/length';
import { Angle } from '../../css-types-from-tokens/angle';
import { Transform } from '../transform';

describe('Test CSS property: `transform`', () => {
  describe('single functions', () => {
    test('matrix', () => {
      expect(Transform.parse.parse('matrix(1, 0, 0, 1, 0, 0)')).toEqual(
        new Transform([new Matrix(1, 0, 0, 1, 0, 0)]),
      );

      expect(
        Transform.parse.parse(
          'matrix(1, 0, 0, 1, 0, 0) matrix(1, 0, 0.5, 1.5, 0, 0)',
        ),
      ).toEqual(
        new Transform([
          new Matrix(1, 0, 0, 1, 0, 0),
          new Matrix(1, 0, 0.5, 1.5, 0, 0),
        ]),
      );
    });
    test('matrix3d', () => {
      expect(
        Transform.parse.parse(
          'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 1.5, 0, 0, 0, 0, 1)',
        ),
      ).toEqual(
        new Transform([
          new Matrix3d([1, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 1.5, 0, 0, 0, 0, 1]),
        ]),
      );
    });
    test('perspective', () => {
      expect(Transform.parse.parse('perspective(100px)')).toEqual(
        new Transform([new Perspective(new Length(100, 'px'))]),
      );
    });
    test('rotate', () => {
      expect(Transform.parse.parse('rotate(45deg)')).toEqual(
        new Transform([new Rotate(new Angle(45, 'deg'))]),
      );
    });
    test('rotate3d', () => {
      expect(Transform.parse.parse('rotate3d(1, 2, 3, 45deg)')).toEqual(
        new Transform([new Rotate3d(1, 2, 3, new Angle(45, 'deg'))]),
      );
    });
    test('rotateX', () => {
      expect(Transform.parse.parse('rotateX(45deg)')).toEqual(
        new Transform([new RotateXYZ(new Angle(45, 'deg'), 'X')]),
      );
    });
    test('rotateY', () => {
      expect(Transform.parse.parse('rotateY(45deg)')).toEqual(
        new Transform([new RotateXYZ(new Angle(45, 'deg'), 'Y')]),
      );
    });
    test('rotateZ', () => {
      expect(Transform.parse.parse('rotateZ(45deg)')).toEqual(
        new Transform([new RotateXYZ(new Angle(45, 'deg'), 'Z')]),
      );
    });
  });
  describe('multiple functions', () => {
    test('perspective + matrix3d', () => {
      expect(
        Transform.parse.parse(
          'perspective(100px)     matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 1.5, 0, 0, 0, 0, 1)',
        ),
      ).toEqual(
        new Transform([
          new Perspective(new Length(100, 'px')),
          new Matrix3d([1, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 1.5, 0, 0, 0, 0, 1]),
        ]),
      );
    });
    test('scale + rotate', () => {
      expect(Transform.parse.parse('scale(2) rotate(45deg)')).toEqual(
        new Transform([new Scale(2, null), new Rotate(new Angle(45, 'deg'))]),
      );
    });
    test('scale3d + rotate3d', () => {
      expect(
        Transform.parse.parse('scale3d(2, 3, 4) rotate3d(1, 2, 3, 45deg)'),
      ).toEqual(
        new Transform([
          new Scale3d(2, 3, 4),
          new Rotate3d(1, 2, 3, new Angle(45, 'deg')),
        ]),
      );
    });
    test('scale + rotate + translate + skew', () => {
      expect(
        Transform.parse.parse(
          'scale(2) rotate(45deg) translate(100px) skew(45deg)',
        ),
      ).toEqual(
        new Transform([
          new Scale(2, null),
          new Rotate(new Angle(45, 'deg')),
          new Translate(new Length(100, 'px'), null),
          new Skew(new Angle(45, 'deg'), null),
        ]),
      );
    });
  });
});
