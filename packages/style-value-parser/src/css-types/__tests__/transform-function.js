/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  TransformFunction,
  Matrix,
  Matrix3d,
  Perspective,
  Rotate,
  Rotate3d,
  RotateAxis,
  Scale,
  Scale3d,
  ScaleAxis,
  Skew,
  SkewAxis,
  Translate,
  Translate3d,
  TranslateX,
  TranslateY,
} from '../transform-function';

import { Length, Px, Em } from '../length';
import { Angle, Deg, Grad, Rad, Turn } from '../angle';
import { Percentage } from '../common-types';

describe('Test CSS Type: <transform-function>', () => {
  describe('Test <matrix> function', () => {
    test('valid uses', () => {
      expect(
        TransformFunction.parse.parseToEnd('matrix(1, 0, 0, 1, 0, 0)'),
      ).toEqual(new Matrix(1, 0, 0, 1, 0, 0));
      expect(
        TransformFunction.parse.parseToEnd('matrix(1.2,0.2,  -1, 0.9, 0, 20 )'),
      ).toEqual(new Matrix(1.2, 0.2, -1, 0.9, 0, 20));
      expect(
        TransformFunction.parse.parseToEnd('matrix(\n.4,0,0.5,1.200,60,10   )'),
      ).toEqual(new Matrix(0.4, 0, 0.5, 1.2, 60, 10));
      expect(
        TransformFunction.parse.parseToEnd('matrix(0.1, 1, -0.3, 1, 0, 0)'),
      ).toEqual(new Matrix(0.1, 1, -0.3, 1, 0, 0));
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() =>
        TransformFunction.parse.parseToEnd('matrix(1, 0, 0, 1, 0)'),
      ).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('matrix(1, 0, 0, 1, 0, 0, 0)'),
      ).toThrow();
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('matrix(1, 0, 0, 1, 0, foo)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('matrix(1px, 0, 0, 1, 0, 0)'),
      ).toThrow();
      // wrong separator
      expect(() =>
        TransformFunction.parse.parseToEnd('matrix(1 0 0 1 0 0)'),
      ).toThrow();
    });
  });

  describe('Test <matrix3d> function', () => {
    test('valid uses', () => {
      expect(
        TransformFunction.parse.parseToEnd(
          `matrix3d(
            1,  0, 0, 0, 
            0,  1, 0, 0,
            0, .5, 1, 0,
            0, 0, 0, 1
          )`,
        ),
      ).toEqual(
        new Matrix3d([1, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 1, 0, 0, 0, 0, 1]),
      );
      expect(
        TransformFunction.parse.parseToEnd(
          'matrix3d(-0.6,1.34788,0,0,-2.34788,-.6,0, 0,0,0,1,0,0,0,10,1)',
        ),
      ).toEqual(
        new Matrix3d([
          -0.6, 1.34788, 0, 0, -2.34788, -0.6, 0, 0, 0, 0, 1, 0, 0, 0, 10, 1,
        ]),
      );
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() =>
        TransformFunction.parse.parseToEnd(
          `matrix3d(
            1,  0, 0, 0, 
            0,  1, 0, 0,
            0, .5, 1, 0,
            0, 0, 0
          )`,
        ),
      ).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd(
          `matrix3d(
            1,  0, 0, 0, 
            0,  1, 0, 0,
            0, .5, 1, 0,
            0, 0, 0, 1, 0
          )`,
        ),
      ).toThrow();
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd(
          `matrix3d(
            1,  0, 0, 0, 
            0,  1, 0, 0,
            0, .5, 1, 0,
            0, 0, 0, foo
          )`,
        ),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd(
          `matrix3d(
            1px,  0, 0, 0, 
            0,  1, 0, 0,
            0, .5, 1, 0,
            0, 0, 0, 1
          )`,
        ),
      ).toThrow();
    });
  });

  describe('Test <perspective> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('perspective(0)')).toEqual(
        new Perspective(new Length(0)),
      );
      expect(TransformFunction.parse.parseToEnd('perspective(100px)')).toEqual(
        new Perspective(new Px(100)),
      );
      expect(TransformFunction.parse.parseToEnd('perspective(1.5em)')).toEqual(
        new Perspective(new Em(1.5)),
      );
      // expect(TransformFunction.parse.parseToEnd("perspective(1.5e2)")).toEqual(
      //   new Perspective(150)
      // );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('perspective(foo)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('perspective(1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('perspective(1%)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('perspective(1deg)'),
      ).toThrow();
    });
  });

  describe('Test <rotate> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('rotate(0)')).toEqual(
        new Rotate(new Angle(0)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(45deg)')).toEqual(
        new Rotate(new Deg(45)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(90deg)')).toEqual(
        new Rotate(new Deg(90)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(180deg)')).toEqual(
        new Rotate(new Deg(180)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(270deg)')).toEqual(
        new Rotate(new Deg(270)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(-90deg)')).toEqual(
        new Rotate(new Deg(-90)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(0.5turn)')).toEqual(
        new Rotate(new Turn(0.5)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(2rad)')).toEqual(
        new Rotate(new Rad(2)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(100grad)')).toEqual(
        new Rotate(new Grad(100)),
      );
      expect(TransformFunction.parse.parseToEnd('rotate(1.5deg)')).toEqual(
        new Rotate(new Deg(1.5)),
      );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() => TransformFunction.parse.parseToEnd('rotate(foo)')).toThrow();
      // wrong type of values
      expect(() => TransformFunction.parse.parseToEnd('rotate(1)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('rotate(1%)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('rotate(1px)')).toThrow();
    });
  });

  describe('Test <rotate3d> function', () => {
    test('valid uses', () => {
      expect(
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, 0)'),
      ).toEqual(new Rotate3d(0, 0, 1, new Angle(0)));
      expect(
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, 45deg)'),
      ).toEqual(new Rotate3d(0, 0, 1, new Deg(45)));
      expect(
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, .1, 90deg)'),
      ).toEqual(new Rotate3d(0, 0, 0.1, new Deg(90)));
      expect(
        TransformFunction.parse.parseToEnd('rotate3d(0, 0.5, 1, 180rad)'),
      ).toEqual(new Rotate3d(0, 0.5, 1, new Rad(180)));
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() =>
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1)'),
      ).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, 0, 0)'),
      ).toThrow();
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, foo)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, 1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, 1%)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('rotate3d(0, 0, 1, 1px)'),
      ).toThrow();
    });
  });

  describe('Test <rotate-axis> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('rotateX(0)')).toEqual(
        new RotateAxis(new Angle(0), 'X'),
      );
      expect(TransformFunction.parse.parseToEnd('rotateX(  0   )')).toEqual(
        new RotateAxis(new Angle(0), 'X'),
      );
      expect(TransformFunction.parse.parseToEnd('rotateY( 45deg\n)')).toEqual(
        new RotateAxis(new Deg(45), 'Y'),
      );
      expect(
        TransformFunction.parse.parseToEnd('rotateZ(   90deg     )'),
      ).toEqual(new RotateAxis(new Deg(90), 'Z'));
      expect(TransformFunction.parse.parseToEnd('rotateZ( 90rad )')).toEqual(
        new RotateAxis(new Rad(90), 'Z'),
      );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('rotateX(foo)'),
      ).toThrow();
      // wrong type of values
      expect(() => TransformFunction.parse.parseToEnd('rotateX(1)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('rotateX(1%)')).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('rotateX(1px)'),
      ).toThrow();
    });
  });

  describe('Test <scale> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('scale(0)')).toEqual(
        new Scale(0, null),
      );
      expect(TransformFunction.parse.parseToEnd('scale(1.5)')).toEqual(
        new Scale(1.5, null),
      );
      expect(TransformFunction.parse.parseToEnd('scale(1.5, 2)')).toEqual(
        new Scale(1.5, 2),
      );
      expect(TransformFunction.parse.parseToEnd('scale(150%, 2.5)')).toEqual(
        new Scale(new Percentage(150), 2.5),
      );
      expect(TransformFunction.parse.parseToEnd('scale(1.5, 2.5)')).toEqual(
        new Scale(1.5, 2.5),
      );
      expect(TransformFunction.parse.parseToEnd('scale(1.5, 2.5)')).toEqual(
        new Scale(1.5, 2.5),
      );
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() => TransformFunction.parse.parseToEnd('scale()')).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('scale(1, 2, 3)'),
      ).toThrow();
      // Non-numeric values
      expect(() => TransformFunction.parse.parseToEnd('scale(foo)')).toThrow();
      // wrong type of values
      expect(() => TransformFunction.parse.parseToEnd('scale(1px)')).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('scale(1, 1px)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('scale(1px, 1)'),
      ).toThrow();
    });
  });

  describe('Test <scale3d> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('scale3d(0, 0, 1)')).toEqual(
        new Scale3d(0, 0, 1),
      );
      expect(
        TransformFunction.parse.parseToEnd('scale3d(1.5, 2, 0.5)'),
      ).toEqual(new Scale3d(1.5, 2, 0.5));
      expect(
        TransformFunction.parse.parseToEnd('scale3d(150%, 2.5, 1)'),
      ).toEqual(new Scale3d(new Percentage(150), 2.5, 1));
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() =>
        TransformFunction.parse.parseToEnd('scale3d(0, 0)'),
      ).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('scale3d(1, 2, 3, 4)'),
      ).toThrow();
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('scale3d(foo, 0, 1)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('scale3d(1px, 0, 1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('scale3d(1, 0, 1px)'),
      ).toThrow();
    });
  });

  describe('Test <scale-axis> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('scaleX(0)')).toEqual(
        new ScaleAxis(0, 'X'),
      );
      expect(TransformFunction.parse.parseToEnd('scaleX(  0   )')).toEqual(
        new ScaleAxis(0, 'X'),
      );
      expect(TransformFunction.parse.parseToEnd('scaleY( 45\n)')).toEqual(
        new ScaleAxis(45, 'Y'),
      );
      expect(TransformFunction.parse.parseToEnd('scaleY( 45%\n)')).toEqual(
        new ScaleAxis(new Percentage(45), 'Y'),
      );
      expect(TransformFunction.parse.parseToEnd('scaleZ(   90     )')).toEqual(
        new ScaleAxis(90, 'Z'),
      );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() => TransformFunction.parse.parseToEnd('scaleX(foo)')).toThrow();
      // wrong type of values
      expect(() => TransformFunction.parse.parseToEnd('scaleX(1px)')).toThrow();
      // too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('scaleX(1, 2)'),
      ).toThrow();
    });
  });

  describe('Test <skew> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('skew(0)')).toEqual(
        new Skew(new Angle(0), null),
      );
      expect(TransformFunction.parse.parseToEnd('skew( 0   \n)')).toEqual(
        new Skew(new Angle(0), null),
      );
      expect(TransformFunction.parse.parseToEnd('skew(15deg)')).toEqual(
        new Skew(new Deg(15), null),
      );
      expect(TransformFunction.parse.parseToEnd('skew(\n15deg\n)')).toEqual(
        new Skew(new Deg(15), null),
      );
      expect(TransformFunction.parse.parseToEnd('skew(15deg, 2turn)')).toEqual(
        new Skew(new Deg(15), new Turn(2)),
      );
      expect(TransformFunction.parse.parseToEnd('skew(15deg,2turn)')).toEqual(
        new Skew(new Deg(15), new Turn(2)),
      );
      expect(
        TransformFunction.parse.parseToEnd('skew(   150deg,\n2.5rad)'),
      ).toEqual(new Skew(new Deg(150), new Rad(2.5)));
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() => TransformFunction.parse.parseToEnd('skew()')).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('skew(1deg, 2deg, 3rad)'),
      ).toThrow();
      // Non-numeric values
      expect(() => TransformFunction.parse.parseToEnd('skew(foo)')).toThrow();
      // wrong type of values
      expect(() => TransformFunction.parse.parseToEnd('skew(1px)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('skew(1, 1)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('skew(1)')).toThrow();
    });
  });

  describe('Test <skew-axis> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('skewX(0)')).toEqual(
        new SkewAxis(new Angle(0), 'X'),
      );
      expect(TransformFunction.parse.parseToEnd('skewX(  0   )')).toEqual(
        new SkewAxis(new Angle(0), 'X'),
      );
      expect(TransformFunction.parse.parseToEnd('skewY( 45deg\n)')).toEqual(
        new SkewAxis(new Deg(45), 'Y'),
      );
      expect(TransformFunction.parse.parseToEnd('skewY( 45deg\n)')).toEqual(
        new SkewAxis(new Deg(45), 'Y'),
      );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() => TransformFunction.parse.parseToEnd('skewX(foo)')).toThrow();
      // wrong unit
      expect(() => TransformFunction.parse.parseToEnd('skewX(1px)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('skewX(1)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('skewX(1ms)')).toThrow();
      expect(() => TransformFunction.parse.parseToEnd('skewX(.1)')).toThrow();
      // too many values
      expect(() => TransformFunction.parse.parseToEnd('skewX(1, 2)')).toThrow();
    });
  });

  describe('Test <translate> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('translate(0)')).toEqual(
        new Translate(new Length(0), null),
      );
      expect(TransformFunction.parse.parseToEnd('translate( 0   \n)')).toEqual(
        new Translate(new Length(0), null),
      );
      expect(TransformFunction.parse.parseToEnd('translate(15px)')).toEqual(
        new Translate(new Px(15), null),
      );
      expect(TransformFunction.parse.parseToEnd('translate(\n15px\n)')).toEqual(
        new Translate(new Px(15), null),
      );
      expect(
        TransformFunction.parse.parseToEnd('translate(15px, 2em)'),
      ).toEqual(new Translate(new Px(15), new Em(2)));
      expect(TransformFunction.parse.parseToEnd('translate(15px,2em)')).toEqual(
        new Translate(new Px(15), new Em(2)),
      );
      expect(
        TransformFunction.parse.parseToEnd('translate(   150%,\n2.5px)'),
      ).toEqual(new Translate(new Percentage(150), new Px(2.5)));
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() => TransformFunction.parse.parseToEnd('translate()')).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate(1px, 2px, 3px)'),
      ).toThrow();
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate(foo)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate(1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translate(1deg)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translate(1, 1px)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translate(1px, 1)'),
      ).toThrow();
    });
  });

  describe('Test <translate3d> function', () => {
    test('valid uses', () => {
      expect(Translate3d.parse.parseToEnd('translate3d(  0,0, 1px)')).toEqual(
        new Translate3d(new Length(0), new Length(0), new Px(1)),
      );
      expect(
        Translate3d.parse.parseToEnd('translate3d(1.5px, 2em,\n.5px)'),
      ).toEqual(new Translate3d(new Px(1.5), new Em(2), new Px(0.5)));
      expect(
        Translate3d.parse.parseToEnd('translate3d(1.5px, 2em,\n0.5px)'),
      ).toEqual(new Translate3d(new Px(1.5), new Em(2), new Px(0.5)));
      expect(
        Translate3d.parse.parseToEnd(
          'translate3d(\n\n\n150%,\n2.5em, 1px    )',
        ),
      ).toEqual(new Translate3d(new Percentage(150), new Em(2.5), new Px(1)));
    });
    test('invalid uses', () => {
      // Not enough values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate3d(0, 0)'),
      ).toThrow();
      // Too many values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate3d(1, 2, 3, 4)'),
      ).toThrow();
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate3d(foo, 0, 1)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('translate3d(1px, 0, 1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translate3d(1, 0, 1px)'),
      ).toThrow();
    });
  });

  describe('Test <translateX> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('translateX(  0   )')).toEqual(
        new TranslateX(new Length(0)),
      );
      expect(TransformFunction.parse.parseToEnd('translateX(15px)')).toEqual(
        new TranslateX(new Px(15)),
      );
      expect(
        TransformFunction.parse.parseToEnd('translateX(\n15px\n)'),
      ).toEqual(new TranslateX(new Px(15)));
      expect(TransformFunction.parse.parseToEnd('translateX(150%)')).toEqual(
        new TranslateX(new Percentage(150)),
      );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('translateX(foo)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('translateX(1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translateX(20)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translateX(20s)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translateX(1deg)'),
      ).toThrow();
    });
  });

  describe('Test <translateY> function', () => {
    test('valid uses', () => {
      expect(TransformFunction.parse.parseToEnd('translateY(  0   )')).toEqual(
        new TranslateY(new Length(0)),
      );
      expect(TransformFunction.parse.parseToEnd('translateY(15px)')).toEqual(
        new TranslateY(new Px(15)),
      );
      expect(
        TransformFunction.parse.parseToEnd('translateY(\n15px\n)'),
      ).toEqual(new TranslateY(new Px(15)));
      expect(TransformFunction.parse.parseToEnd('translateY(150%)')).toEqual(
        new TranslateY(new Percentage(150)),
      );
    });
    test('invalid uses', () => {
      // Non-numeric values
      expect(() =>
        TransformFunction.parse.parseToEnd('translateY(foo)'),
      ).toThrow();
      // wrong type of values
      expect(() =>
        TransformFunction.parse.parseToEnd('translateY(1)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translateY(20)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translateY(20s)'),
      ).toThrow();
      expect(() =>
        TransformFunction.parse.parseToEnd('translateY(1deg)'),
      ).toThrow();
    });
  });
});
