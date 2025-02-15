/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  EasingFunction,
  LinearEasingFunction,
  CubicBezierEasingFunction,
  CubicBezierKeyword,
  StepsEasingFunction,
  StepsKeyword,
} from '../easing-function';

describe('<easing-function>', () => {
  test('parses valid CSS <easing-function> types strings correctly', () => {
    expect(EasingFunction.parser.parseToEnd('linear(1, 2)')).toEqual(
      new LinearEasingFunction([1, 2]),
    );
    expect(EasingFunction.parser.parseToEnd('linear(1.5, 2  ,   3)')).toEqual(
      new LinearEasingFunction([1.5, 2, 3]),
    );
    expect(
      EasingFunction.parser.parseToEnd('linear(  .5  , 2, 3,4  )'),
    ).toEqual(new LinearEasingFunction([0.5, 2, 3, 4]));
    expect(EasingFunction.parser.parseToEnd('ease-in')).toEqual(
      new CubicBezierKeyword('ease-in'),
    );
    expect(EasingFunction.parser.parseToEnd('ease-out')).toEqual(
      new CubicBezierKeyword('ease-out'),
    );
    expect(EasingFunction.parser.parseToEnd('ease-in-out')).toEqual(
      new CubicBezierKeyword('ease-in-out'),
    );
    expect(EasingFunction.parser.parseToEnd('ease')).toEqual(
      new CubicBezierKeyword('ease'),
    );
    expect(EasingFunction.parser.parseToEnd('step-start')).toEqual(
      new StepsKeyword('step-start'),
    );
    expect(EasingFunction.parser.parseToEnd('step-end')).toEqual(
      new StepsKeyword('step-end'),
    );
    expect(EasingFunction.parser.parseToEnd('steps(1, start)')).toEqual(
      new StepsEasingFunction(1, 'start'),
    );
    expect(EasingFunction.parser.parseToEnd('steps(1   ,     start)')).toEqual(
      new StepsEasingFunction(1, 'start'),
    );
    expect(EasingFunction.parser.parseToEnd('steps(1,end)')).toEqual(
      new StepsEasingFunction(1, 'end'),
    );
    expect(EasingFunction.parser.parseToEnd('cubic-bezier(1,1,1,1)')).toEqual(
      new CubicBezierEasingFunction([1, 1, 1, 1]),
    );
    expect(
      EasingFunction.parser.parseToEnd(
        'cubic-bezier( 1.5 ,    1 ,    .1 , 1 )',
      ),
    ).toEqual(new CubicBezierEasingFunction([1.5, 1, 0.1, 1]));
  });
  test('fails to parse invalid CSS <easing-function> types strings', () => {
    expect(() => EasingFunction.parser.parseToEnd('linear(1 2 3)')).toThrow();
    expect(() =>
      EasingFunction.parser.parseToEnd('cubic-bezier(1, 2, 3)'),
    ).toThrow();
    expect(() =>
      EasingFunction.parser.parseToEnd('cubic-bezier(1, 2, 3, 4, 5)'),
    ).toThrow();
    expect(() =>
      EasingFunction.parser.parseToEnd('cubic-bezier(1 .25 1 .25)'),
    ).toThrow();
    expect(() => EasingFunction.parser.parseToEnd('out-ease')).toThrow();
    expect(() => EasingFunction.parser.parseToEnd('linear()')).toThrow();
    expect(() => EasingFunction.parser.parseToEnd('steps(1, 2)')).toThrow();
  });
});
