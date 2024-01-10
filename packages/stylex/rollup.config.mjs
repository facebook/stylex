/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const config = {
  input: {
    stylex: './lib/es/stylex.js',
    StyleXSheet: './lib/es/StyleXSheet.js',
  },
  output: {
    dir: './lib/es/',
    // file: './lib/es/stylex.js',
    // format: 'cjs',
  },
  plugins: [nodeResolve(), commonjs()],
};

export default config;
