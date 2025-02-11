/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import Benchmark from 'benchmark';
import { AlphaValue as AlphaValueOriginal } from '../css-types/alpha-value';
import { AlphaValue as AlphaValueTokens } from '../css-types-from-tokens/alpha-value';

const suite = new Benchmark.Suite();

// Test cases from the test files
const TEST_CASES = [
  '0.5',
  '.5',
  '0.25',
  '.25',
  '0.75',
  '.75',
  '1',
  '50%',
  '25%',
  '75%',
  '75.5%',
  '0.25%',
  '.25%',
  '0%',
  '100%',
];

// Add tests
suite
  .add('Original Parser', () => {
    TEST_CASES.forEach((input) => {
      AlphaValueOriginal.parse.parse(input);
    });
  })
  .add('Token Parser', () => {
    TEST_CASES.forEach((input) => {
      AlphaValueTokens.parse.parse(input);
    });
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
