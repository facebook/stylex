/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const isProd = process.env.NODE_ENV === 'production';

const options = {
  dev: !isProd,
  test: false,
  stylexSheetName: isProd ? 'custom' : undefined,
};

module.exports = {
  plugins: [['@stylexjs/babel-plugin', options]],
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
};
