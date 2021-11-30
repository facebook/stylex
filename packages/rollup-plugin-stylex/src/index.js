/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const stylexBabelPlugin = require('babel-plugin-transform-stylex');

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

module.exports = function stylexPlugin({
  dev = IS_DEV_ENV,
  fileName = 'stylex.css',
} = {}) {
  let stylexRules = [];

  return {
    name: 'rollup-plugin-stylex',
    babelHook() {
      return {
        config(currentConfig) {
          return {
            ...currentConfig.options,
            plugins: [
              ...(currentConfig.options.plugins || []),
              [stylexBabelPlugin, { dev, stylexSheetName: fileName }],
            ],
          };
        },
        result(result) {
          const { metadata } = result;
          if (!dev && metadata.stylex != null && metadata.stylex.length > 0) {
            stylexRules = stylexRules.concat(metadata.stylex);
          }
          return result;
        },
      };
    },
    buildStart() {
      stylexRules = [];
    },
    generateBundle() {
      if (stylexRules.length > 0) {
        const collectedCSS = stylexBabelPlugin.processStylexRules(stylexRules);

        this.emitFile({
          fileName,
          source: collectedCSS,
          type: 'asset',
        });
      }
    },
  };
};
