/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { Length as LengthLegacy } from '../lib/css-types/length.js';
import { Length as LengthNew } from '../lib/css-types-from-tokens/length.js';

const lengthSuite = new Benchmark.Suite('Length');

const lengthString = '10px';

console.log('\n\n<length>\n');

lengthSuite
  .add('Legacy Parser', () => {
    LengthLegacy.parse.parseToEnd(lengthString);
  })
  .add('Token Parser', () => {
    LengthNew.parser.parseToEnd(lengthString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = lengthSuite.filter('fastest').map('name')[0];
    const slowest = lengthSuite.filter('slowest').map('name')[0];
    const fastestResult = lengthSuite.filter('fastest')[0].stats.mean;
    const slowestResult = lengthSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
