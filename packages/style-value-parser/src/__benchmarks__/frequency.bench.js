/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { Frequency as FrequencyLegacy } from '../css-types/frequency';
import { Frequency as FrequencyNew } from '../css-types-from-tokens/frequency';

const frequencySuite = new Benchmark.Suite('Frequency');

const frequencyString = '100Hz';

console.log('\n\n<frequency>\n');

frequencySuite
  .add('Legacy Parser', () => {
    FrequencyLegacy.parse.parseToEnd(frequencyString);
  })
  .add('Token Parser', () => {
    FrequencyNew.parser.parseToEnd(frequencyString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = frequencySuite.filter('fastest').map('name')[0];
    const slowest = frequencySuite.filter('slowest').map('name')[0];
    const fastestResult = frequencySuite.filter('fastest')[0].stats.mean;
    const slowestResult = frequencySuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
