/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const { createSuite, transformHaste } = require('../helpers');

const createThemeBasic = path.resolve(
  __dirname,
  '../fixtures/createTheme-basic.js',
);
const createThemeComplex = path.resolve(
  __dirname,
  '../fixtures/createTheme-complex.js',
);

/**
 * Performance of 'createTheme' transform
 */
function runSuite(options) {
  const { suite, test } = createSuite(
    'babel-plugin: stylex.createTheme',
    options,
  );

  test('basic themes', () => {
    transformHaste(createThemeBasic);
  });

  test('complex themes', () => {
    transformHaste(createThemeComplex);
  });

  suite.run();
}

module.exports = runSuite;
