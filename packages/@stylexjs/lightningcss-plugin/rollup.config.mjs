/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';

export default {
  input: './src/index.js',
  output: [
    { file: './lib/index.js', format: 'cjs' },
    { file: './lib/index.mjs', format: 'esm' },
  ],
  external: ['lightningcss'],
  plugins: [
    babel({ babelHelpers: 'bundled', include: ['./src/**/*'] }),
    nodeResolve(),
    commonjs(),
  ],
};
