/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { Angle as AngleLegacy } from '../css-types/angle';
import { Angle as AngleNew } from '../css-types-from-tokens/angle';

const angleSuite = new Benchmark.Suite('Angle');

const angleString = '10deg';

console.log('\n\n<angle>\n');

angleSuite
  .add('Legacy Parser', () => {
    AngleLegacy.parse.parseToEnd(angleString);
  })
  .add('Token Parser', () => {
    AngleNew.parse.parseToEnd(angleString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = angleSuite.filter('fastest').map('name')[0];
    const slowest = angleSuite.filter('slowest').map('name')[0];
    const fastestResult = angleSuite.filter('fastest')[0].stats.mean;
    const slowestResult = angleSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
