/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Benchmark from 'benchmark';
import { CustomIdentifier as CustomIdentifierLegacy } from '../lib/css-types/custom-ident.js';
import { CustomIdentifier as CustomIdentifierNew } from '../lib/css-types/custom-ident.js';

const customIdentSuite = new Benchmark.Suite('CustomIdentifier');

const customIdentString = 'my-custom-ident';

console.log('\n\n<custom-ident>\n');

customIdentSuite
  .add('Legacy Parser', () => {
    CustomIdentifierLegacy.parse.parseToEnd(customIdentString);
  })
  .add('Token Parser', () => {
    CustomIdentifierNew.parser.parseToEnd(customIdentString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = customIdentSuite.filter('fastest').map('name')[0];
    const slowest = customIdentSuite.filter('slowest').map('name')[0];
    const fastestResult = customIdentSuite.filter('fastest')[0].stats.mean;
    const slowestResult = customIdentSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
