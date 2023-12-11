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
    plugins: [stylexPlugin({ useCSSLayers: true, ...options })],
  });

  return { js: outputFiles[0], css: outputFiles[1] };
}

describe('esbuild-plugin-stylex', () => {
  it('extracts and bundles CSS without inject calls, bundles JS', async () => {
    const { js, css } = await build();

    expect(js.text).toMatchSnapshot();

    expect(css.text).toMatchSnapshot;
  });

  it('preserves stylex.inject calls and does not extract CSS in development mode', async () => {
    const { js, css } = await build({ dev: true });

    expect(js.text).toMatchSnapshot();

    expect(css).toBeUndefined();
  });
});
