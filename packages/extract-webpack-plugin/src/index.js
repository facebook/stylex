/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const babel = require('@babel/core');
const path = require('path');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const webpack = require('webpack');
const flowSyntaxPlugin = require('@babel/plugin-syntax-flow');
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx');
const typescriptSyntaxPlugin = require('@babel/plugin-syntax-typescript');
const fs = require('fs/promises');

const { NormalModule } = webpack;

const PLUGIN_NAME = 'stylex';
const MODULE_TYPE = 'css/stylex'

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

const { RawSource } = webpack.sources;

/*::
type PluginOptions = $ReadOnly<{
  dev?: boolean,
  stylexImports?: $ReadOnlyArray<string>,
  babelConfig?: $ReadOnly<{
    plugins?: $ReadOnlyArray<mixed>,
    presets?: $ReadOnlyArray<mixed>,
    babelrc?: boolean,
  }>,
  filename?: string,
  useCSSLayers?: boolean,
}>
*/

class StylexPlugin {
  stylexRules = {};

  constructor({
    dev = IS_DEV_ENV,
    filename =  '[name].css',
    chunkFilename = '[id].css',
    stylexImports = ['stylex', '@stylexjs/stylex'],
    unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
    babelConfig: { plugins = [], presets = [], babelrc = false } = {},
    useCSSLayers = false,
    ...options
  } /*: PluginOptions */ = {}) {
    this.dev = dev;
    this.filename = filename;
    this.chunkFilename = chunkFilename;
    this.babelConfig = { plugins, presets, babelrc };
    this.stylexImports = stylexImports;
    this.babelPlugin = [
      stylexBabelPlugin,
      {
        dev,
        unstable_moduleResolution,
        importSources: stylexImports,
        ...options,
      },
    ];
    this.useCSSLayers = useCSSLayers;
  }

  apply(compiler) {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      // Apply loader to JS modules.
      NormalModule.getCompilationHooks(compilation).loader.tap(
        PLUGIN_NAME,
        (loaderContext, module) => {
          if (
            // JavaScript (and Flow) modules
            /\.jsx?/.test(path.extname(module.resource)) ||
            // TypeScript modules
            /\.tsx?/.test(path.extname(module.resource))
          ) {
            // It might make sense to use .push() here instead of .unshift()
            // Webpack usually runs loaders in reverse order and we want to ideally run
            // our loader before anything else.
            module.loaders.unshift({
              loader: path.resolve(__dirname, 'loader.js'),
              options: { stylexPlugin: this },
            });
          }
        },
      );

      const getChunkModules = (chunk, chunkGraph) => {
        return typeof chunkGraph !== 'undefined'
          ? chunkGraph.getChunkModulesIterable(chunk)
          : chunk.modulesIterable;
      }

      const getStyleXRules = (modules) => {
        const { stylexRules } = this;
        if (Object.keys(stylexRules).length === 0) {
          return null;
        }

        if(modules.length === 0){
          return;
        }

        const filesInLastRun = [...modules.values()].reduce((prev, m) => {
          if(m.modules){
            return [...prev, ...m.modules.map(cm =>cm.resource)]
          }
          return [...prev, m.resource];
        },[]).filter(Boolean);

        // Take styles for the modules that were included in the last compilation.
        const allRules = Object.keys(stylexRules)
          .filter((filename) => filesInLastRun.includes(filename))
          .map((filename) => stylexRules[filename])
          .flat();

        return stylexBabelPlugin.processStylexRules(
          allRules,
          this.useCSSLayers,
        );
      };

      compilation.hooks.renderManifest.tap(
        PLUGIN_NAME,
        (result, { chunk }) => {
          if(this.dev){
            return;
          }

          const { chunkGraph } = compilation;
          const { HotUpdateChunk } = webpack;

          // We don't need hot update chunks for css
          // We will use the real asset instead to update
          if (chunk instanceof HotUpdateChunk) {
            return;
          }

          const modules = getChunkModules(chunk, chunkGraph);
          const collectedCSS = getStyleXRules(modules, chunk);

          const filenameTemplate =
            (
              chunk.canBeInitial()
                ? this.filename
                : this.chunkFilename
            );

          if (collectedCSS.length > 0) {
            result.push({
              render: () => new RawSource(collectedCSS),
              filenameTemplate,
              pathOptions: {
                chunk,
                contentHashType: MODULE_TYPE,
              },
              identifier: `${PLUGIN_NAME}.${chunk.id}`,
              hash: chunk.contentHash[MODULE_TYPE],
            });
          }
        }
      );

      compilation.hooks.contentHash.tap(PLUGIN_NAME, (chunk) => {
        if(this.dev){
          return;
        }

        const { outputOptions, chunkGraph } = compilation;
        const modules = getChunkModules(chunk, chunkGraph);

        if (modules) {
          const { hashFunction, hashDigest, hashDigestLength } = outputOptions;
          const { createHash } = compiler.webpack.util;
          const hash = createHash((hashFunction));

          for (const m of modules) {
            hash.update(chunkGraph.getModuleHash(m, chunk.runtime));
          }

          // eslint-disable-next-line no-param-reassign
          chunk.contentHash[MODULE_TYPE] = (hash.digest(hashDigest)).substring(0, hashDigestLength);
        }
      });
    });
  }

  // This function is not called by Webpack directly.
  // Instead, `NormalModule.getCompilationHooks` is used to inject a loader
  // for JS modules. The loader than calls this function.
  async transformCode(inputCode, filename, logger) {
    if (
      this.stylexImports.some((importName) => inputCode.includes(importName))
    ) {
      const originalSource = this.babelConfig.babelrc
        ? await fs.readFile(filename, 'utf8')
        : inputCode;
      const { code, map, metadata } = await babel.transformAsync(
        originalSource,
        {
          babelrc: this.babelConfig.babelrc,
          filename,
          // Use TypeScript syntax plugin if the filename ends with `.ts` or `.tsx`
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
        },
      );
      if (metadata.stylex != null && metadata.stylex.length > 0) {
        this.stylexRules[filename] = metadata.stylex;
        logger.debug(`Read stylex styles from ${filename}:`, metadata.stylex);
      }
      if (!this.babelConfig.babelrc) {
        return { code, map };
      }
    }
    return { code: inputCode };
  }
}

module.exports = StylexPlugin;
