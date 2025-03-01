/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { Flex as FlexLegacy } from '../lib/css-types/flex.js';
import { Flex as FlexNew } from '../lib/css-types-from-tokens/flex.js';

const flexSuite = new Benchmark.Suite('Flex');

const flexString = '1fr';

console.log('\n\n<flex>\n');

flexSuite
  .add('Legacy Parser', () => {
    FlexLegacy.parse.parseToEnd(flexString);
  })
  .add('Token Parser', () => {
    FlexNew.parser.parseToEnd(flexString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = flexSuite.filter('fastest').map('name')[0];
    const slowest = flexSuite.filter('slowest').map('name')[0];
    const fastestResult = flexSuite.filter('fastest')[0].stats.mean;
    const slowestResult = flexSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
