/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const { transformSync } = require('@babel/core');
const fs = require('fs');
const flowPlugin = require('@babel/plugin-syntax-flow');
const stylexPlugin = require('@stylexjs/babel-plugin');
const path = require('path');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [
      flowPlugin,
      [
        stylexPlugin,
        {
          ...opts,
          treeshakeCompensation: true,
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: path.join(__dirname, '../../'),
          },
        },
      ],
    ],
  });
}

const files = fs.readdirSync(path.join(__dirname, '../src'));

describe('commonJS results of exported styles and variables', () => {
  files.forEach((file) => {
    if (file.endsWith('.js')) {
      const filename = path.join(__dirname, '../src', file);
      const source = fs.readFileSync(filename, 'utf8');
      const { code, metadata } = transform(source, {
        dev: false,
        filename: filename,
      });

      test(file, () => {
        expect(code).toMatchSnapshot();
        expect(metadata.stylex).toMatchSnapshot();
      });
    }
  });
});
