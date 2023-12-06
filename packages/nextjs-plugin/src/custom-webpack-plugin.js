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

const { NormalModule, Compilation } = webpack;

const PLUGIN_NAME = 'stylex';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

const { RawSource, ConcatSource } = webpack.sources;

/*::
type PluginOptions = $ReadOnly<{
  dev?: boolean,
  useRemForFontSize?: boolean,
  stylexImports?: $ReadOnlyArray<string>,
  babelConfig?: $ReadOnly<{
    plugins?: $ReadOnlyArray<mixed>,
    presets?: $ReadOnlyArray<mixed>,
    babelrc?: boolean,
  }>,
  filename?: string,
  appendTo?: string | (string) => boolean
}>
*/

const stylexRules = {};
const cssFiles = new Set();
const compilers = new Set();

class StylexPlugin {
  filesInLastRun = null;
  filePath = null;

  constructor({
    dev = IS_DEV_ENV,
    useRemForFontSize,
    appendTo,
    filename = appendTo == null ? 'stylex.css' : undefined,
    stylexImports = ['stylex', '@stylexjs/stylex'],
    rootDir,
    babelConfig = {},
  } /*: PluginOptions */ = {}) {
    this.dev = dev;
    this.appendTo = appendTo;
    this.filename = filename;
    // if (filename.includes("stylex")) {
    //   console.log("filename", filename);
    // }

    this.babelConfig = {
      plugins: [],
      presets: [],
      babelrc: [],
      ...babelConfig,
    };
    this.stylexImports = stylexImports;
    this.babelPlugin = [
      stylexBabelPlugin,
      {
        dev,
        useRemForFontSize,
        runtimeInjection: false,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir,
        },
        importSources: stylexImports,
      },
    ];
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
            // Typescript modules
            /\.tsx?/.test(path.extname(module.resource))
          ) {
            // We use .push() here instead of .unshift()
            // Webpack usually runs loaders in reverse order and we want to ideally run
            // our loader before anything else.
            module.loaders.push({
              loader: path.resolve(__dirname, 'custom-webpack-loader.js'),
              options: { stylexPlugin: this },
            });
          }

          if (
            // JavaScript (and Flow) modules
            /\.css/.test(path.extname(module.resource))
          ) {
            cssFiles.add(module.resource);
          }
        },
      );

      const getStyleXRules = () => {
        if (Object.keys(stylexRules).length === 0) {
          return null;
        }
        // Take styles for the modules that were included in the last compilation.
        const allRules = Object.keys(stylexRules)
          .map((filename) => stylexRules[filename])
          .flat();
        return stylexBabelPlugin.processStylexRules(allRules);
      };

      if (this.appendTo) {
        compilation.hooks.processAssets.tap(
          {
            name: PLUGIN_NAME,
            stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS, // see below for more stages
          },
          (assets) => {
            const cssFileName = Object.keys(assets).find(
              typeof this.appendTo === 'function'
                ? this.appendTo
                : (filename) => filename.endsWith(this.appendTo),
            );
            const stylexCSS = getStyleXRules();

            if (cssFileName && stylexCSS != null) {
              this.filePath = path.join(process.cwd(), '.next', cssFileName);

              const updatedSource = new ConcatSource(
                new RawSource(assets[cssFileName].source()),
                new RawSource(stylexCSS),
              );

              compilation.updateAsset(cssFileName, updatedSource);
              compilers.add(compiler);
            }
          },
        );
      } else {
        // Consume collected rules and emit the stylex CSS asset
        compilation.hooks.additionalAssets.tap(PLUGIN_NAME, () => {
          try {
            const collectedCSS = getStyleXRules();
            if (collectedCSS) {
              console.log('emitting asset', this.filename, collectedCSS);
              compilation.emitAsset(this.filename, new RawSource(collectedCSS));
              fs.writeFile(this.filename, collectedCSS).then(() =>
                console.log('wrote file', this.filename),
              );
            }
          } catch (e) {
            compilation.errors.push(e);
          }
        });
      }
    });
  }

  // This function is not called by Webpack directly.
  // Instead, `NormalModule.getCompilationHooks` is used to inject a loader
  // for JS modules. The loader than calls this function.
  async transformCode(inputCode, filename, logger) {
    const originalSource = this.babelConfig.babelrc
      ? await fs.readFile(filename, 'utf8')
      : inputCode;

    if (
      this.stylexImports.some((importName) =>
        originalSource.includes(importName),
      )
    ) {
      const { code, map, metadata } = await babel.transformAsync(
        originalSource,
        {
          babelrc: this.babelConfig.babelrc,
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
        },
      );
      if (metadata.stylex != null && metadata.stylex.length > 0) {
        const oldRules = stylexRules[filename] || [];
        stylexRules[filename] = metadata.stylex;
        logger.debug(`Read stylex styles from ${filename}:`, metadata.stylex);

        const oldClassNames = new Set(oldRules.map((rule) => rule[0]));
        const newClassNames = new Set(metadata.stylex.map((rule) => rule[0]));

        // If there are any new classNames in the output we need to recompile
        // the CSS bundle.
        if (
          oldClassNames.size !== newClassNames.size ||
          [...newClassNames].some(
            (className) => !oldClassNames.has(className),
          ) ||
          filename.endsWith('.stylex.ts') ||
          filename.endsWith('.stylex.tsx') ||
          filename.endsWith('.stylex.js')
        ) {
          compilers.forEach((compiler) => {
            cssFiles.forEach((cssFile) => {
              compiler.watchFileSystem.watcher.fileWatchers
                .get(cssFile)
                .watcher.emit('change');
            });
          });
        }
      }

      if (!this.babelConfig.babelrc) {
        return { code, map };
      }
    }
    return { code: inputCode };
  }
}

module.exports = StylexPlugin;
