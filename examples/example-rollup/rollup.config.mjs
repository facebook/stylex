/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import stylexPlugin from '@stylexjs/rollup-plugin';

const babelPlugin = babel({
  babelHelpers: 'bundled',
});

const config = {
  input: './src/index.js',
  output: {
    file: './.build/bundle.js',
    format: 'cjs',
  },
  // See all options in the babel plugin configuration docs:
  // https://stylexjs.com/docs/api/configuration/babel-plugin/
  plugins: [
    babelPlugin,
    resolve(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
      preventAssignment: true,
    }),
    stylexPlugin({
      fileName: 'stylex.css',
      runtimeInjection: true,
    }),
  ],
};

export default config;
