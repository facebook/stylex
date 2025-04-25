/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Benchmark from 'benchmark';
import { anglePercentage as anglePercentageLegacy } from '../lib/css-types/angle-percentage.js';
import { anglePercentage as anglePercentageNew } from '../lib/css-types/angle-percentage.js';

const anglePercentageSuite = new Benchmark.Suite('AnglePercentage');

const anglePercentageString = '10deg';

console.log('\n\n<angle-percentage>\n');

anglePercentageSuite
  .add('Legacy Parser', () => {
    anglePercentageLegacy.parseToEnd(anglePercentageString);
  })
  .add('Token Parser', () => {
    anglePercentageNew.parseToEnd(anglePercentageString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = anglePercentageSuite.filter('fastest').map('name')[0];
    const slowest = anglePercentageSuite.filter('slowest').map('name')[0];
    const fastestResult = anglePercentageSuite.filter('fastest')[0].stats.mean;
    const slowestResult = anglePercentageSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
