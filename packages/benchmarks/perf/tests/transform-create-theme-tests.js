/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const stylexPlugin = require('@stylexjs/babel-plugin');
const path = require('path');
const { createSuite } = require('../helpers');
const { transformFileSync } = require('@babel/core');

const defaultOpts = {
  stylexSheetName: '<>',
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix: 'x',
};

const themeBasic = path.resolve(__dirname, '../fixtures/theme-basic.js');
const themes = path.resolve(__dirname, '../fixtures/themes.js');

function transform(file, opts = defaultOpts) {
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

/**
 * Performance of 'createTheme' transform
 */
function runSuite(options) {
  const { suite, test } = createSuite('babel-plugin: createTheme', options);

  test('basic theme', () => {
    transform(themeBasic);
  });

  test('complex theme', () => {
    transform(themes);
  });

  suite.run();
}

module.exports = runSuite;
