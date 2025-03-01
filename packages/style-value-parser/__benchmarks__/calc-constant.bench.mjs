/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { calcConstant as calcConstantLegacy } from '../lib/css-types/calc-constant.js';
import { calcConstant as calcConstantNew } from '../lib/css-types-from-tokens/calc-constant.js';

const calcConstantSuite = new Benchmark.Suite('CalcConstant');

const calcConstantString = '-infinity';

console.log('\n\n<calc-constant>\n');

calcConstantSuite
  .add('Legacy Parser', () => {
    calcConstantLegacy.parseToEnd(calcConstantString);
  })
  .add('Token Parser', () => {
    calcConstantNew.parseToEnd(calcConstantString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = calcConstantSuite.filter('fastest').map('name')[0];
    const slowest = calcConstantSuite.filter('slowest').map('name')[0];
    const fastestResult = calcConstantSuite.filter('fastest')[0].stats.mean;
    const slowestResult = calcConstantSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
