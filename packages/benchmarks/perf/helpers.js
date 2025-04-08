/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const Benchmark = require('benchmark');
const stylexPlugin = require('@stylexjs/babel-plugin');
const { transformFileSync } = require('@babel/core');

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

const defaultOpts = {
  stylexSheetName: '<>',
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix: 'x',
};

function transformHaste(file, opts = defaultOpts) {
  const result = transformFileSync(file, {
    filename: opts.filename || file || themes,
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      ['babel-plugin-syntax-hermes-parser', { flow: 'detect' }],
      [stylexPlugin, { ...defaultOpts, ...opts }],
    ],
  });
  return { code: result.code, styles: result.metadata.stylex };
}

module.exports = {
  createSuite,
  transformHaste,
};
