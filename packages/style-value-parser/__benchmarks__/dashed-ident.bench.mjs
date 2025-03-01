/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Benchmark from 'benchmark';
import { DashedIdentifier as DashedIdentifierLegacy } from '../lib/css-types/dashed-ident.js';
import { DashedIdentifier as DashedIdentifierNew } from '../lib/css-types-from-tokens/dashed-ident.js';

const dashedIdentSuite = new Benchmark.Suite('DashedIdentifier');

const dashedIdentString = '--my-dashed-ident';

console.log('\n\n<dashed-ident>\n');

dashedIdentSuite
  .add('Legacy Parser', () => {
    DashedIdentifierLegacy.parse.parseToEnd(dashedIdentString);
  })
  .add('Token Parser', () => {
    DashedIdentifierNew.parser.parseToEnd(dashedIdentString);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    const fastest = dashedIdentSuite.filter('fastest').map('name')[0];
    const slowest = dashedIdentSuite.filter('slowest').map('name')[0];
    const fastestResult = dashedIdentSuite.filter('fastest')[0].stats.mean;
    const slowestResult = dashedIdentSuite.filter('slowest')[0].stats.mean;
    const speedup = (slowestResult - fastestResult) / fastestResult;
    const percentage = speedup.toFixed(2);

    console.log(`Fastest is ${fastest}, ${percentage}x faster than ${slowest}`);
  })
  .run({ async: true });
