/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { Color as ColorLegacy } from '../lib/css-types/color.js';
import { Color as ColorNew } from '../lib/css-types-from-tokens/color.js';

const colorSuite = new Benchmark.Suite('Color');

const colorString = 'red';

console.log('\n\n<color>\n');

colorSuite
  .add('Legacy Parser', () => {
    ColorLegacy.parse.parseToEnd(colorString);
  })
  .add('Token Parser', () => {
    ColorNew.parser.parseToEnd(colorString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = colorSuite.filter('fastest').map('name')[0];
    const slowest = colorSuite.filter('slowest').map('name')[0];
    const fastestResult = colorSuite.filter('fastest')[0].stats.mean;
    const slowestResult = colorSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
