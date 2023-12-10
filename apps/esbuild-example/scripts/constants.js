/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const path = require('path');

const BUILD_DIR_NAME = 'dist';
const OUTFILE = `${BUILD_DIR_NAME}/bundle.js`;
const STYLEX_BUNDLE_PATH = path.resolve(
  __dirname,
  '..',
  `${BUILD_DIR_NAME}/stylex.css`,
);

const ESBUILD_SHARED_CONFIG = {
  entryPoints: [path.resolve(__dirname, '..', 'src/App.jsx')],
  bundle: true,
  outfile: OUTFILE,
};

const STYLEX_PLUGIN_SHARED_CONFIG = {
  useCSSLayers: true,
  absoluteFilePath: STYLEX_BUNDLE_PATH,
  unstable_moduleResolution: {
    type: 'commonJS',
    rootDir: path.resolve('..', process.cwd()),
  },
};

module.exports = {
  ESBUILD_SHARED_CONFIG,
  STYLEX_PLUGIN_SHARED_CONFIG,
};
