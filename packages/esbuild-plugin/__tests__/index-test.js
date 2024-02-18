/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import path from 'path';
import esbuild from 'esbuild';
import stylexPlugin from '../src/index';

async function build(options = {}) {
  const { isTS, ...rest } = options;
  const tsConfigPath = path.resolve(
    __dirname,
    '__fixtures__/test-tsconfig.json',
  );

  const { outputFiles } = await esbuild.build({
    entryPoints: [
      path.resolve(__dirname, `__fixtures__/index.${isTS ? 'ts' : 'js'}`),
    ],
    external: ['@stylexjs/stylex'],
    tsconfig: isTS ? tsConfigPath : undefined,
    minify: false,
    bundle: true,
    write: false,
    plugins: [stylexPlugin({ useCSSLayers: true, ...rest })],
  });

  return { js: outputFiles[0], css: outputFiles[1] };
}

describe('esbuild-plugin-stylex', () => {
  it('extracts and bundles CSS without inject calls, bundles JS', async () => {
    const { js, css } = await build();

    expect(js.text).toMatchSnapshot();

    expect(css.text).toMatchSnapshot();
  });

  it('extracts and bundles CSS without inject calls, bundles and transforms TS', async () => {
    const { js, css } = await build({ isTS: true });

    expect(js.text).toMatchSnapshot();

    expect(css.text).toMatchSnapshot();
  });

  it('preserves stylex.inject calls and does not extract CSS in development mode', async () => {
    const { js, css } = await build({ dev: true });

    expect(js.text).toMatchSnapshot();

    expect(css).toBeUndefined();
  });
});
