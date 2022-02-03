/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const babel = require('@babel/core');
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
    async transform(inputCode, id) {
      const { code, map, metadata } = await babel.transformAsync(inputCode, {
        babelrc: false,
        filename: id,
        plugins: [[stylexBabelPlugin, { dev, stylexSheetName: fileName }]],
      });

      if (!dev && metadata.stylex != null && metadata.stylex.length > 0) {
        stylexRules = stylexRules.concat(metadata.stylex);
      }

      return { code, map };
    },
  };
};
