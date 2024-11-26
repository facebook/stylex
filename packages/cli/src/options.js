/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const options = {
  input: {
    alias: 'i',
    describe: 'The input directory to compile with Stylex',
    type: 'array',
    demandOption: true,
  },
  output: {
    alias: 'o',
    describe: 'Name of the output directory',
    type: 'array',
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
  useCSSLayers: {
    alias: 'l',
    describe: 'Use CSS layers to optimize CSS rendering',
    type: 'boolean',
    default: false,
  },
  babelPresets: {
    describe:
      'A list of babel presets to pass to the babel transform when compiling StyleX',
    type: 'array',
    default: [] as $ReadOnlyArray<string | $ReadOnly<[string, { ... }]>>,
  },
  babelPluginsPre: {
    describe:
      'A list of babel plugins to pass to the babel transform before StyleX is compiled',
    type: 'array',
    default: [] as $ReadOnlyArray<string | $ReadOnly<[string, { ... }]>>,
  },
  babelPluginsPost: {
    describe:
      'A list of babel plugins to pass to the babel transform after StyleX is compiled',
    type: 'array',
    default: [] as $ReadOnlyArray<string | $ReadOnly<[string, { ... }]>>,
  },
  modules_EXPERIMENTAL: {
    alias: 'm',
    describe:
      'a list of node modules to also compile with StyleX. This is experimental and may not work for all modules',
    type: 'array',
    default: [] as $ReadOnlyArray<
      string | $ReadOnly<[string, { ignore: $ReadOnlyArray<string> }]>,
    >,
  },
};

export default options;
