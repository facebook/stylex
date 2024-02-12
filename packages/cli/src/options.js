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
};
