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
  stylexImports = ['@stylexjs/stylex'],
  // path
  outPath = 'stylex.css',
  babelConfig: { plugins = [], presets = [] } = {},
  ...options
} = {}) {
  return {
    name: PACKAGE_NAME,
    async setup({ onLoad, onEnd, initialOptions }) {
      const stylexRules = {};

      onEnd(({ outputFiles }) => {
        const rules = Object.values(stylexRules).flat();

        if (rules.length === 0) {
          return;
        }

        const collectedCSS = stylexBabelPlugin.processStylexRules(rules, true);
        const shouldWriteToDisk =
          initialOptions.write === undefined || initialOptions.write;

        if (shouldWriteToDisk) {
          // write to disk
          // fs.writeFile(path.resolve(__dirname, outPath))
          return;
        }

        outputFiles.push({
          path: '<stdout>',
          contents: new TextEncoder().encode(collectedCSS),
          get text() {
            return collectedCSS;
          },
        });
      });

      onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const currFileName = args.path;
        const inputCode = await fs.readFile(currFileName, 'utf8');

        if (
          !stylexImports.some((importName) => inputCode.includes(importName))
        ) {
          // avoid transform if file doesn't have stylex imports
          // esbuild proceeds to the next callback
          return;
        }

        // sourcemap?
        const { code, metadata } = await babel.transformAsync(inputCode, {
          babelrc: false,
          filename: currFileName,
          presets,
          plugins: [
            ...plugins,
            [
              stylexBabelPlugin,
              // handle Flow or TS plugin here
              {
                dev,
                unstable_moduleResolution,
                ...options,
              },
            ],
          ],
        });

        if (!dev && metadata.stylex !== null && metadata.stylex.length > 0) {
          stylexRules[args.path] = metadata.stylex;
        }

        return {
          contents: code,
          loader: currFileName.endsWith('.js') ? 'js' : 'tsx',
        };
      });
    },
  };
}

module.exports = stylexPlugin;
