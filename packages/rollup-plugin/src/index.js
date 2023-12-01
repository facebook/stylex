/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const babel = require('@babel/core');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const flowSyntaxPlugin = require('@babel/plugin-syntax-flow');
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx');
const typescriptSyntaxPlugin = require('@babel/plugin-syntax-typescript');
const path = require('path');

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

module.exports = function stylexPlugin({
  dev = IS_DEV_ENV,
  runtimeInjection,
  fileName = 'stylex.css',
  babelConfig: { plugins = [], presets = [] } = {},
  ...options
} = {}) {
  let stylexRules = {};

  return {
    name: 'rollup-plugin-stylex',
    buildStart() {
      stylexRules = {};
    },
    generateBundle() {
      const rules = Object.values(stylexRules).flat();
      if (rules.length > 0) {
        const collectedCSS = stylexBabelPlugin.processStylexRules(rules, true);

        this.emitFile({
          fileName,
          source: collectedCSS,
          type: 'asset',
        });
      }
    },
    shouldTransformCachedModule({ code: _code, id, cache: _cache, meta }) {
      stylexRules[id] = meta.stylex;
      return false;
    },
    async transform(inputCode, id) {
      const { code, map, metadata } = await babel.transformAsync(inputCode, {
        babelrc: false,
        filename: id,
        presets,
        plugins: [
          ...plugins,
          /\.jsx?/.test(path.extname(id))
            ? flowSyntaxPlugin
            : typescriptSyntaxPlugin,
          jsxSyntaxPlugin,
          [stylexBabelPlugin, { dev, runtimeInjection, ...options }],
        ],
      });

      if (!dev && metadata.stylex != null && metadata.stylex.length > 0) {
        stylexRules[id] = metadata.stylex;
      }

      return { code, map, meta: metadata };
    },
  };
};
