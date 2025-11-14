/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

const options = {
  dev: !isProd,
  runtimeInjection: !isProd,
  test: false,
  stylexSheetName: '<>',
  unstable_moduleResolution: {
    type: 'commonJS',
    rootDir: path.join(__dirname, '../..'),
  },
};

module.exports = {
  plugins: [['@stylexjs/babel-plugin', options]],
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
};
