/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const { createSuite, transformHaste } = require('../helpers');

const createBasic = path.resolve(__dirname, '../fixtures/create-basic.js');
const createComplex = path.resolve(__dirname, '../fixtures/create-complex.js');

/**
 * Performance of 'create' transform
 */
function runSuite(options) {
  const { suite, test } = createSuite('babel-plugin: stylex.create', options);

  test('basic create', () => {
    transformHaste(createBasic);
  });

  test('complex create', () => {
    transformHaste(createComplex);
  });

  suite.run();
}

module.exports = runSuite;
