/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { EasingFunction as EasingFunctionLegacy } from '../css-types/easing-function';
import { EasingFunction as EasingFunctionNew } from '../css-types-from-tokens/easing-function';

const easingFunctionSuite = new Benchmark.Suite('EasingFunction');

const easingFunctionString = 'cubic-bezier(1,1,1,1)';

console.log('\n\n<easing-function>\n');

easingFunctionSuite
  .add('Legacy Parser', () => {
    EasingFunctionLegacy.parse.parseToEnd(easingFunctionString);
  })
  .add('Token Parser', () => {
    EasingFunctionNew.parser.parseToEnd(easingFunctionString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = easingFunctionSuite.filter('fastest').map('name')[0];
    const slowest = easingFunctionSuite.filter('slowest').map('name')[0];
    const fastestResult = easingFunctionSuite.filter('fastest')[0].stats.mean;
    const slowestResult = easingFunctionSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
