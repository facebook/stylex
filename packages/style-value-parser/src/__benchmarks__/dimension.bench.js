/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { dimension as dimensionLegacy } from '../css-types/dimension';
import { dimension as dimensionNew } from '../css-types-from-tokens/dimension';

const dimensionSuite = new Benchmark.Suite('Dimension');

const dimensionString = '10px';

console.log('\n\n<dimension>\n');

dimensionSuite
  .add('Legacy Parser', () => {
    dimensionLegacy.parseToEnd(dimensionString);
  })
  .add('Token Parser', () => {
    dimensionNew.parseToEnd(dimensionString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = dimensionSuite.filter('fastest').map('name')[0];
    const slowest = dimensionSuite.filter('slowest').map('name')[0];
    const fastestResult = dimensionSuite.filter('fastest')[0].stats.mean;
    const slowestResult = dimensionSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
