/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const babel = require('@babel/core');
const path = require('path');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const webpack = require('webpack');
const flowSyntaxPlugin = require('@babel/plugin-syntax-flow');
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx');
const typescriptSyntaxPlugin = require('@babel/plugin-syntax-typescript');

const { NormalModule } = webpack;

const PLUGIN_NAME = 'stylex';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

const { RawSource } = webpack.sources;

class StylexPlugin {
  stylexRules = {};
  filesInLastRun = null;

  constructor({
    dev = IS_DEV_ENV,
    filename = 'stylex.css',
    babelConig: { plugins = [], presets = [] } = {},
  } = {}) {
    this.dev = dev;
    this.filename = filename;
    this.babelConfig = { plugins, presets };
    this.babelPlugin = [stylexBabelPlugin, { dev, stylexSheetName: '<>' }];
  }

  apply(compiler) {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      // Apply loader to JS modules.
      NormalModule.getCompilationHooks(compilation).loader.tap(
        PLUGIN_NAME,
        (loaderContext, module) => {
          if (
            // Javascript (and Flow) modules
            /\.jsx?/.test(path.extname(module.resource)) ||
            // Typescript modules
            /\.tsx?/.test(path.extname(module.resource))
          ) {
            module.loaders.unshift({
              loader: path.resolve(__dirname, 'loader.js'),
              options: { stylexPlugin: this },
            });
          }
        }
      );

      // Make a list of all modules that were included in the last compilation.
      compilation.hooks.finishModules.tap(PLUGIN_NAME, (modules) => {
        this.filesInLastRun = [...modules.values()].map((m) => m.resource);
      });

      // Consume collected rules and emit the stylex CSS asset
      compilation.hooks.additionalAssets.tap(PLUGIN_NAME, () => {
        try {
          const { stylexRules } = this;
          if (Object.keys(stylexRules).length > 0) {
            // Take styles for the modules that were included in the last compilation.
            const allRules = Object.keys(stylexRules)
              .filter((filename) =>
                this.filesInLastRun == null
                  ? true
                  : this.filesInLastRun.includes(filename)
              )
              .map((filename) => stylexRules[filename])
              .flat();
            const collectedCSS = stylexBabelPlugin.processStylexRules(allRules);
            compilation.emitAsset(this.filename, new RawSource(collectedCSS));
          }
        } catch (e) {
          compilation.errors.push(e);
        }
      });
    });
  }

  // This function is not called by Webpack directly.
  // Instead, `NormalModule.getCompilationHooks` is used to inject a loader
  // for JS modules. The loader than calls this function.
  async transformCode(inputCode, filename, logger) {
    const { code, map, metadata } = await babel.transformAsync(inputCode, {
      babelrc: false,
      filename,
      // Use Typescript syntax plugin if the filename ends with `.ts` or `.tsx`
      // and use the Flow syntax plugin otherwise.
      plugins: [
        ...this.babelConfig.plugins,
        /\.jsx?/.test(path.extname(filename))
          ? flowSyntaxPlugin
          : typescriptSyntaxPlugin,
        jsxSyntaxPlugin,
        this.babelPlugin,
      ],
      presets: this.babelConfig.presets,
    });

    if (metadata.stylex != null && metadata.stylex.length > 0) {
      this.stylexRules[filename] = metadata.stylex;
      logger.debug(`Read stylex from ${filename}:`, metadata.stylex);
    }

    return { code, map };
  }
}

module.exports = StylexPlugin;
