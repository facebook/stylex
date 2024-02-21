/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export default {
  directory: {
    alias: 'd',
    describe: 'The directory to compile with Stylex',
    type: 'string',
    demandOption: true,
  },
  output: {
    alias: 'o',
    describe: 'Name of the output folder',
    type: 'string',
    demandOption: false,
  },
  watch: {
    alias: 'w',
    describe: 'Enable automatic recompiling of files on change',
    type: 'boolean',
    demandOption: false,
  },
  // TODO: Add support for passing in a custom config file
  // This config file should be a JSON file, but paths within it
  // must be resolved relative to the config file's location
};
