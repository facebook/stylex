/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const flowPlugin = require('@babel/plugin-syntax-flow');
const stylexPlugin = require('../../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      flowPlugin,
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          unstable_moduleResolution: { type: 'haste' },
          ...opts,
        },
      ],
    ],
  }).code;
}

describe('Throws the correct messages', () => {
  test('errors on unkown reference', () => {
    transform(`
      import stylex from 'stylex';
      const styles = stylex.create(foo);
    `);
    expect(() =>
      transform(`
        import stylex from 'stylex';
        const styles = stylex.create(foo);
      `),
    ).toThrowErrorMatchingInlineSnapshot(`
      "unknown file: stylex.create() can only accept a style object.
      [0m [90m 1 |[39m
       [90m 2 |[39m         [36mimport[39m stylex [36mfrom[39m [32m'stylex'[39m[33m;[39m
      [31m[1m>[22m[39m[90m 3 |[39m         [36mconst[39m styles [33m=[39m stylex[33m.[39mcreate(foo)[33m;[39m
       [90m   |[39m                        [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
       [90m 4 |[39m       [0m"
    `);
  });
});
