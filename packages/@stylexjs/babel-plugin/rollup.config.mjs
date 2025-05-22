/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
  'node:crypto',
  'node:fs',
  'node:module',
  'node:path',
  'node:url',
  'assert',
  'crypto',
  'fs',
  'module',
  'path',
  'url',
];

const config = {
  input: './src/index.js',
  output: {
    file: './lib/index.js',
    format: 'cjs',
  },
  external: process.env['HASTE']
    ? external
    : [...external, '@dual-bundle/import-meta-resolve', '@stylexjs/stylex'],
  plugins: [
    babel({ babelHelpers: 'bundled', extensions, include: ['./src/**/*'] }),
    nodeResolve({
      preferBuiltins: false,
      extensions,
      allowExportsFolderMapping: true,
      rootDir,
    }),
    commonjs(),
    json(),
  ],
};

export default config;
