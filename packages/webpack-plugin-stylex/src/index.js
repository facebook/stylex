/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const babel = require('@babel/core');
const path = require('path');
const stylexBabelPlugin = require('babel-plugin-transform-stylex');
const webpack = require('webpack');

const { NormalModule } = webpack;

const PLUGIN_NAME = 'stylex';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

const { RawSource } = webpack.sources;

class StylexPlugin {
  stylexRules = [];

  constructor({ dev = IS_DEV_ENV, filename = 'stylex.css' } = {}) {
    this.dev = dev;
    this.filename = filename;
    this.babelPlugin = [stylexBabelPlugin, { dev, stylexSheetName: filename }];
  }

  apply(compiler) {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      // Apply loader to JS modules.
      NormalModule.getCompilationHooks(compilation).loader.tap(
        PLUGIN_NAME,
        (loaderContext, module) => {
          if (/\.jsx?/.test(path.extname(module.resource))) {
            module.loaders.unshift({
              loader: path.resolve(__dirname, 'loader.js'),
              options: { stylexPlugin: this },
            });
          }
        }
      );

      // Consume collected rules and emit the stylex CSS asset
      compilation.hooks.additionalAssets.tap(PLUGIN_NAME, () => {
        try {
          const { stylexRules } = this;
          if (stylexRules.length > 0) {
            const collectedCSS =
              stylexBabelPlugin.processStylexRules(stylexRules);
            compilation.emitAsset(this.filename, new RawSource(collectedCSS));
          }
        } catch (e) {
          compilation.errors.push(e);
        }
      });
    });

    // Prevent old rules from being left behind if webpack is run in production
    // mode with watching.
    compiler.hooks.watchRun.tap(PLUGIN_NAME, () => {
      this.stylexRules = [];
    });
  }

  async transformCode(inputCode, filename, logger) {
    const { code, map, metadata } = await babel.transformAsync(inputCode, {
      babelrc: false,
      filename,
      plugins: [this.babelPlugin],
    });

    if (metadata.stylex != null && metadata.stylex.length > 0) {
      this.stylexRules = this.dev
        ? this.stylexRules
        : this.stylexRules.concat(metadata.stylex);
      logger.debug(`Read stylex from ${filename}:`, metadata.stylex);
    }

    return { code, map };
  }
}

module.exports = StylexPlugin;
