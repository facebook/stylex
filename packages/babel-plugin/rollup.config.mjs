/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import path from 'path';

const extensions = ['.js', '.jsx', '.cjs', '.mjs'];

// get ESM __dirname
const __dirname = new URL('.', import.meta.url).pathname;

const rootDir = path.resolve(__dirname, '../..');

const external = [
  '@babel/traverse',
  '@babel/types',
  '@babel/core',
  'path',
  'fs',
  'assert',
  'module',
  'node:path',
  'node:fs',
  'node:module',
];

const config = {
  input: './src/index.js',
  output: {
    file: './lib/index.js',
    format: 'cjs',
  },
  external: process.env['HASTE']
    ? external
    : [...external, 'esm-resolve', '@stylexjs/shared', '@stylexjs/stylex'],
  plugins: [
    alias({
      entries: [
        {
          find: 'esm-resolve',
          replacement: path.resolve(
            rootDir,
            'node_modules/esm-resolve/bundle.js',
          ),
        },
      ],
    }),
    babel({ babelHelpers: 'bundled', extensions, include: ['./src/**/*'] }),
    nodeResolve({
      preferBuiltins: false,
      extensions,
      allowExportsFolderMapping: true,
      rootDir,
      // modulePaths: [path.resolve(__dirname, '../../node_modules')],
      // resolveOnly: !process.env['HASTE']
      //   ? []
      //   : [
      //       '@stylexjs/shared',
      //       '@stylexjs/shared/**/*',
      //       '@stylexjs/stylex',
      //       '@stylexjs/stylex/**/*',
      //       path.resolve(rootDir, 'node_modules/esm-resolve/bundle.js'),
      //     ],
    }),
    commonjs(),
    json(),
  ],
};

export default config;
