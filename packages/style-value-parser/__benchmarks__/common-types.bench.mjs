/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { Percentage as PercentageLegacy } from '../lib/css-types/common-types.js';
import { Percentage as PercentageNew } from '../lib/css-types-from-tokens/common-types.js';

const commonTypesSuite = new Benchmark.Suite('CommonTypes');

const commonTypesString = '10%';

console.log('\n\n<percentage>\n');

commonTypesSuite
  .add('Legacy Parser', () => {
    PercentageLegacy.parse.parseToEnd(commonTypesString);
  })
  .add('Token Parser', () => {
    PercentageNew.parser.parseToEnd(commonTypesString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = commonTypesSuite.filter('fastest').map('name')[0];
    const slowest = commonTypesSuite.filter('slowest').map('name')[0];
    const fastestResult = commonTypesSuite.filter('fastest')[0].stats.mean;
    const slowestResult = commonTypesSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
