/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export default {
  input: {
    alias: 'i',
    describe: 'The input directory to compile with Stylex',
    type: 'string',
    demandOption: false,
  },
  output: {
    alias: 'o',
    describe: 'Name of the output directory',
    type: 'string',
    demandOption: false,
  },
  watch: {
    alias: 'w',
    describe: 'Enable automatic recompiling of files on change',
    type: 'boolean',
    demandOption: false,
  },
  config: {
    alias: 'c',
    describe: 'Location of a .stylex.json file',
    type: 'string',
    demandOptions: false,
  },
};
