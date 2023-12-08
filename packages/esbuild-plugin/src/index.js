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
// const path = require('path');
const fs = require('fs/promises');

const PACKAGE_NAME = 'esbuild-plugin-stylex';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

function stylexPlugin({
  dev = IS_DEV_ENV,
  unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
  stylexImports = ['stylex', '@stylexjs/stylex'],
  // fileName = 'stylex.css',
  babelConfig: { plugins = [], presets = [] } = {},
  ...options
} = {}) {
  return {
    name: PACKAGE_NAME,
    async setup({ onLoad, onEnd }) {
      const stylexRules = {};

      onEnd(() => {
        console.log('build ended');
        console.log(stylexRules);
        const rules = Object.values(stylexRules).flat();
        if (rules.length > 0) {
          const collectedCSS = stylexBabelPlugin.processStylexRules(
            rules,
            true,
          );
          console.log(collectedCSS);
        }
      });

      onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const inputCode = await fs.readFile(args.path, 'utf8');

        // include source map in emit
        const { code, metadata } = await babel.transformAsync(inputCode, {
          babelrc: false,
          filename: args.path,
          presets,
          plugins: [
            ...plugins,
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

        if (!dev && metadata.stylex !== null && metadata.stylex.length > 0) {
          stylexRules[args.path] = metadata.stylex;
        }

        return { contents: code, loader: getLoader(args) };
      });

      // onLoad({ filter: /\.[jt]sx?$})
    },
  };
}

function getLoader(args) {
  if (args.path.endsWith('.js')) {
    return 'js';
  }

  return 'tsx';
}

module.exports = stylexPlugin;
