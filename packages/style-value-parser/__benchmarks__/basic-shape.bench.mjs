/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Benchmark from 'benchmark';
import { Inset as InsetLegacy } from '../lib/css-types/basic-shape.js';
import { Inset as InsetNew } from '../lib/css-types/basic-shape.js';

const basicShapeSuite = new Benchmark.Suite('BasicShape');

const basicShapeString = 'inset(10px)';

console.log('\n\n<basic-shape>\n');

basicShapeSuite
  .add('Legacy Parser', () => {
    InsetLegacy.parse.parseToEnd(basicShapeString);
  })
  .add('Token Parser', () => {
    InsetNew.parser.parseToEnd(basicShapeString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = basicShapeSuite.filter('fastest').map('name')[0];
    const slowest = basicShapeSuite.filter('slowest').map('name')[0];
    const fastestResult = basicShapeSuite.filter('fastest')[0].stats.mean;
    const slowestResult = basicShapeSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
