/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

const path = require('path');
const stylexPlugin = require('../lib/index.js');

describe('vite-stylex-plugin', () => {
  async function runStylex(options = {}) {
    const { build } = await import('vite');

    console.log(stylexPlugin);
    const bundle = await build({
      build: {
        lib: {
          entry: path.resolve(__dirname, '__fixtures__/index.js'),
          formats: ['es'],
          fileName: 'bundle',
        },
        cssMinify: false,
        minify: false,
        rollupOptions: {
          external: ['stylex'],
        },
        outDir: '__builds__',
        write: false,
      },
      plugins: [stylexPlugin(options)],
      logLevel: 'silent',
    });
    // Generate output specific code in-memory
    // You can call this function multiple times on the same bundle object
    let css, js;
    const { output } = bundle[0];
    for (const chunkOrAsset of output) {
      if (chunkOrAsset.fileName.includes('.css')) {
        css += chunkOrAsset.source;
      } else if (chunkOrAsset.fileName === 'bundle.mjs') {
        js = chunkOrAsset.code;
      }
    }
    return { css, js };
  }

  it('extracts CSS and removes stylex.inject calls', async () => {
    const { css, js } = await runStylex();
    expect(css).toMatchSnapshot();
    expect(js).toMatchSnapshot();
  });
});
