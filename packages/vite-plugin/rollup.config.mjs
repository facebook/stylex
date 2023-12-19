/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { defineConfig } from 'rollup';
import { babel } from '@rollup/plugin-babel';

export default defineConfig([
  {
    input: './src/index.js',
    output: {
      file: './lib/index.js',
      format: 'cjs',
    },
    plugins: [babel({ babelHelpers: 'bundled' })],
  },
  {
    input: './src/index.js',
    output: {
      file: './lib/index.mjs',
      format: 'es',
    },
    plugins: [babel({ babelHelpers: 'bundled' })],
  },
]);
