/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import path from 'path';
import stylexPlugin from '@stylexjs/rollup-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  input: path.resolve(__dirname, './fixtures/index.js'),
  output: {
    file: path.resolve(__dirname, './.build/bundle.js'),
    format: 'es',
  },
  // See all options in the babel plugin configuration docs:
  // https://stylexjs.com/docs/api/configuration/babel-plugin/
  plugins: [stylexPlugin({ fileName: 'stylex.css', useCSSLayers: true })],
};

export default config;
