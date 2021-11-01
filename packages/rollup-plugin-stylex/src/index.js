/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const stylexBabelPlugin = require('babel-plugin-transform-stylex');

module.exports = function stylexPlugin({ fileName = 'stylex.css' } = {}) {
  let stylexRules = [];

  return {
    name: 'rollup-plugin-stylex',
    babelHook() {
      return {
        result(result) {
          const { metadata } = result;
          if (metadata.stylex != null && metadata.stylex.length > 0) {
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
      const collectedCSS = stylexBabelPlugin.processStylexRules(stylexRules);

      this.emitFile({
        fileName,
        source: collectedCSS,
        type: 'asset',
      });
    },
  };
};
