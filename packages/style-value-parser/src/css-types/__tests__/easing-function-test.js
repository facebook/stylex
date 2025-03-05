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
    expect(EasingFunction.parse.parse('linear(1, 2)')).toEqual(
      new LinearEasingFunction([1, 2]),
    );
    expect(EasingFunction.parse.parse('linear(1.5, 2  ,   3)')).toEqual(
      new LinearEasingFunction([1.5, 2, 3]),
    );
    expect(EasingFunction.parse.parse('linear(  .5  , 2, 3,4  )')).toEqual(
      new LinearEasingFunction([0.5, 2, 3, 4]),
    );
    expect(EasingFunction.parse.parse('ease-in')).toEqual(
      new CubicBezierKeyword('ease-in'),
    );
    expect(EasingFunction.parse.parse('ease-out')).toEqual(
      new CubicBezierKeyword('ease-out'),
    );
    expect(EasingFunction.parse.parse('ease-in-out')).toEqual(
      new CubicBezierKeyword('ease-in-out'),
    );
    expect(EasingFunction.parse.parse('ease')).toEqual(
      new CubicBezierKeyword('ease'),
    );
    expect(EasingFunction.parse.parse('step-start')).toEqual(
      new StepsKeyword('step-start'),
    );
    expect(EasingFunction.parse.parse('step-end')).toEqual(
      new StepsKeyword('step-end'),
    );
    expect(EasingFunction.parse.parse('steps(1, start)')).toEqual(
      new StepsEasingFunction(1, 'start'),
    );
    expect(EasingFunction.parse.parse('steps(1   ,     start)')).toEqual(
      new StepsEasingFunction(1, 'start'),
    );
    expect(EasingFunction.parse.parse('steps(1,end)')).toEqual(
      new StepsEasingFunction(1, 'end'),
    );
    expect(EasingFunction.parse.parse('cubic-bezier(1,1,1,1)')).toEqual(
      new CubicBezierEasingFunction([1, 1, 1, 1]),
    );
    expect(
      EasingFunction.parse.parse('cubic-bezier( 1.5 ,    1 ,    .1 , 1 )'),
    ).toEqual(new CubicBezierEasingFunction([1.5, 1, 0.1, 1]));
  });
  test('fails to parse invalid CSS <easing-function> types strings', () => {
    expect(EasingFunction.parse.parse('linear(1 2 3)')).toBeInstanceOf(Error);
    expect(EasingFunction.parse.parse('cubic-bezier(1, 2, 3)')).toBeInstanceOf(
      Error,
    );
    expect(
      EasingFunction.parse.parse('cubic-bezier(1, 2, 3, 4, 5)'),
    ).toBeInstanceOf(Error);
    expect(
      EasingFunction.parse.parse('cubic-bezier(1 .25 1 .25)'),
    ).toBeInstanceOf(Error);
    expect(EasingFunction.parse.parse('out-ease')).toBeInstanceOf(Error);
    expect(EasingFunction.parse.parse('linear()')).toBeInstanceOf(Error);
    expect(EasingFunction.parse.parse('steps(1, 2)')).toBeInstanceOf(Error);
  });
});
