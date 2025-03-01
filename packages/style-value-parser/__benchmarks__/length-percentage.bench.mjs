/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { lengthPercentage as lengthPercentageLegacy } from '../lib/css-types/length-percentage.js';
import { lengthPercentage as lengthPercentageNew } from '../lib/css-types-from-tokens/length-percentage.js';

const lengthPercentageSuite = new Benchmark.Suite('LengthPercentage');

const lengthPercentageString = '10px';

console.log('\n\n<length-percentage>\n');

lengthPercentageSuite
  .add('Legacy Parser', () => {
    lengthPercentageLegacy.parseToEnd(lengthPercentageString);
  })
  .add('Token Parser', () => {
    lengthPercentageNew.parseToEnd(lengthPercentageString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = lengthPercentageSuite.filter('fastest').map('name')[0];
    const slowest = lengthPercentageSuite.filter('slowest').map('name')[0];
    const fastestResult = lengthPercentageSuite.filter('fastest')[0].stats.mean;
    const slowestResult = lengthPercentageSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
