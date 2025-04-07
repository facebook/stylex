/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const Benchmark = require('benchmark');

/**
 * Test helpers
 */

function createSuite(name, options) {
  const suite = new Benchmark.Suite(name);
  const test = (...args) => suite.add(...args);

  function jsonReporter(suite) {
    const benchmarks = [];

    suite.on('cycle', (event) => {
      benchmarks.push(event.target);
    });

    suite.on('error', (event) => {
      throw new Error(String(event.target.error));
    });

    suite.on('complete', () => {
      const timestamp = Date.now();
      const result = benchmarks.map((bench) => {
        if (bench.error) {
          return {
            name: bench.name,
            id: bench.id,
            error: bench.error,
          };
        }

        return {
          name: bench.name,
          id: bench.id,
          samples: bench.stats.sample.length,
          deviation: bench.stats.rme.toFixed(2),
          ops: bench.hz.toFixed(bench.hz < 100 ? 2 : 0),
          timestamp,
        };
      });
      options.callback(result, suite.name);
    });
  }

  jsonReporter(suite);
  return { suite, test };
}

module.exports = {
  createSuite,
};
