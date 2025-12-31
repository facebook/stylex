/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import stylexPlugin from '@stylexjs/bun-plugin';

const BUILD_DIR_NAME = 'public/dist';

const result = await Bun.build({
  entrypoints: [path.resolve(import.meta.dir, '..', 'src/App.tsx')],
  outdir: path.resolve(import.meta.dir, '..', BUILD_DIR_NAME),
  minify: true,
  plugins: [
    // See all options in the babel plugin configuration docs:
    // https://stylexjs.com/docs/api/configuration/babel-plugin/
    stylexPlugin({
      fileName: 'stylex.css',
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: path.resolve(import.meta.dir, '../../..'),
      },
    }),
  ],
});

if (!result.success) {
  console.error('Build failed:');
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log('Build succeeded!');
console.log(`Output: ${BUILD_DIR_NAME}`);
