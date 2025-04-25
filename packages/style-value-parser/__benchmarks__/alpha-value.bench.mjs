/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Benchmark from 'benchmark';
import { AlphaValue as AlphaValueLegacy } from '../lib/css-types/alpha-value.js';
import { AlphaValue as AlphaValueNew } from '../lib/css-types/alpha-value.js';

const alphaValueSuite = new Benchmark.Suite('AlphaValue');

const alphaValueString = '0.5';

console.log('\n\n<alpha-value>\n');

alphaValueSuite
  .add('Legacy Parser', () => {
    AlphaValueLegacy.parse.parseToEnd(alphaValueString);
  })
  .add('Token Parser', () => {
    AlphaValueNew.parser.parseToEnd(alphaValueString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = alphaValueSuite.filter('fastest').map('name')[0];
    const slowest = alphaValueSuite.filter('slowest').map('name')[0];
    const fastestResult = alphaValueSuite.filter('fastest')[0].stats.mean;
    const slowestResult = alphaValueSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
