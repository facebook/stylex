/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
const babel = require('@babel/core');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const path = require('path');
const fs = require('fs/promises');

const PACKAGE_NAME = 'esbuild-plugin-stylex';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

function stylexPlugin({
  dev = IS_DEV_ENV,
  unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
  stylexImports = ['stylex', '@stylexjs/stylex'],
  fileName = 'stylex.css',
  babelConfig = ({ plugins = [], presets = [] } = {}),
  ...options
}) {
  return {
    name: PACKAGE_NAME,
    async setup(build) {
      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const inputCode = await fs.readFile(args.path, 'utf8');

        const { code, map } = await babel.transformAsync(inputCode, {
          babelrc: false,
          filename: args.path,
          plugins: [
            ...babelConfig.plugins,
            [
              stylexBabelPlugin,
              {
                dev,
                unstable_moduleResolution,
                importSources: stylexImports,
                ...options,
              },
            ],
          ],
        });

        return { content: code, loader: getLoader(args) };
      });
    },
  };
}

function getLoader(args) {
  if (args.path.endsWith('.tsx')) {
    return 'tsx';
  }

  if (args.path.endsWith('.jsx')) {
    return 'jsx';
  }

  return null;
}

module.exports = stylexPlugin;
