/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { FilterFunction as FilterFunctionLegacy } from '../css-types/filter-function';
import { FilterFunction as FilterFunctionNew } from '../css-types-from-tokens/filter-function';

const filterFunctionSuite = new Benchmark.Suite('FilterFunction');

const filterFunctionString = 'blur(5px)';

console.log('\n\n<filter-function>\n');

filterFunctionSuite
  .add('Legacy Parser', () => {
    FilterFunctionLegacy.parse.parseToEnd(filterFunctionString);
  })
  .add('Token Parser', () => {
    FilterFunctionNew.parser.parseToEnd(filterFunctionString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = filterFunctionSuite.filter('fastest').map('name')[0];
    const slowest = filterFunctionSuite.filter('slowest').map('name')[0];
    const fastestResult = filterFunctionSuite.filter('fastest')[0].stats.mean;
    const slowestResult = filterFunctionSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
