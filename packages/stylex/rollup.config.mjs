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
    stylex: './lib/es/stylex.mjs',
    StyleXSheet: './lib/es/StyleXSheet.mjs',
  },
  output: {
    dir: './lib/es/',
    format: 'es',
    // ensure that output files use the `.mjs` extension
    entryFileNames: '[name].mjs',
  },
  plugins: [nodeResolve(), commonjs()],
};

export default config;
