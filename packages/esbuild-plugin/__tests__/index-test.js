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
const esbuild = require('esbuild');
const stylexPlugin = require('../src/index');

async function build(options = {}) {
  const { outputFiles } = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/index.js')],
    external: ['@stylexjs/stylex'],
    minify: false,
    bundle: true,
    write: false,
    plugins: [stylexPlugin({ ...options })],
  });

  return { js: outputFiles[0], css: outputFiles[1] };
}

describe('esbuild-plugin-stylex', () => {
  it('prod', async () => {
    const { js, css } = await build();

    expect(js).toBeDefined();
    expect(css).toBeDefined();
  });

  it('dev', async () => {
    const { js, css } = await build({ dev: true });

    expect(js).toBeDefined();
    expect(css).toBeUndefined();
  });
});
