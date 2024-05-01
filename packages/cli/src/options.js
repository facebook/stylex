/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Config } from './config';
import type { Options } from 'yargs';

const options: { [$Keys<Config>]: Options } = {
  input: {
    alias: 'i',
    describe: 'The input directory to compile with Stylex',
    type: 'string',
    demandOption: true,
  },
  output: {
    alias: 'o',
    describe: 'Name of the output directory',
    type: 'string',
    demandOption: true,
  },
  styleXBundleName: {
    alias: 'b',
    describe: 'The name of the core compiled css file StyleX creates',
    type: 'string',
    default: 'stylex_bundle.css',
  },
  watch: {
    alias: 'w',
    describe: 'Enable automatic recompiling of files on change',
    type: 'boolean',
    default: false,
  },
  babelPresets: {
    describe:
      'A list of babel presets to pass to the babel transform when compiling StyleX',
    type: 'array',
    default: [],
  },
  modules_EXPERIMENTAL: {
    alias: 'm',
    describe:
      'a list of node modules to also compile with StyleX. This is experimental and may not work for all modules',
    type: 'array',
    default: [],
  },
};

export default options;
