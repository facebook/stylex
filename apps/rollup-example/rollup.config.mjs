/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import stylexPlugin from '@stylexjs/rollup-plugin';

const config = {
  input: './index.js',
  output: {
    file: './.build/bundle.js',
    format: 'es',
  },
  // See all options in the babel plugin configuration docs:
  // https://stylexjs.com/docs/api/configuration/babel-plugin/
  plugins: [stylexPlugin({
    fileName: 'stylex.css',
    styleResolution: 'property-specificity'
  })],
};

export default config;
