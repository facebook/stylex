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

async function build() {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/index.js')],
    external: ['stylex'],
    minify: false,
    bundle: true,
    write: false,
    plugins: [stylexPlugin()],
  });

  return result;
}

describe('esbuild-plugin-stylex', () => {
  it('test', async () => {
    const output = await build();
    console.log(output.outputFiles[0].text);

    expect(true).toBeTruthy();
  });
});
