/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { fileURLToPath } from 'url';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BABEL_ENV = process.env['BABEL_ENV'];

const config = {
  input: {
    stylex: './src/stylex.js',
    inject: './src/inject.js',
  },
  output: {
    dir: BABEL_ENV === 'esm' ? './lib/es/' : './lib/cjs',
    format: BABEL_ENV === 'esm' ? 'es' : 'cjs',
    entryFileNames: BABEL_ENV === 'esm' ? '[name].mjs' : '[name].js',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, '.babelrc.js'),
    }),
    resolve(),
    commonjs(),
  ],
};

export default config;
