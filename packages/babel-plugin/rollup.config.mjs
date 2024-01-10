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
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';

const extensions = ['.js', '.jsx'];

const config = {
  input: './src/index.js',
  output: {
    file: './lib/index.js',
    format: 'cjs',
  },
  external: [/@babel\/traverse/, /@babel\/types/, /@babel\/core/],
  plugins: [
    babel({ babelHelpers: 'bundled', extensions, include: ['./src/**/*'] }),
    nodeResolve({
      extensions,
      resolveOnly: process.env['HASTE']
        ? []
        : [
            '@stylexjs/shared',
            '@stylexjs/shared/**/*',
            '@stylexjs/stylex',
            '@stylexjs/stylex/**/*',
          ],
    }),
    commonjs(),
    json(),
  ],
};

export default config;
