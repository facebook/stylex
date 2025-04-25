/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Benchmark from 'benchmark';
import { EasingFunction as EasingFunctionLegacy } from '../lib/css-types/easing-function.js';
import { EasingFunction as EasingFunctionNew } from '../lib/css-types/easing-function.js';

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
