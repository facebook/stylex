/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

const memfs = require('memfs');
const path = require('path');
const StylexPlugin = require('../src/index');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Webpack compiler factory
 */
function createCompiler(entry, pluginOptions = {}, config = {}) {
  const stylexPlugin = new StylexPlugin(pluginOptions);
  const fullConfig = {
    context: path.resolve(__dirname, './__fixtures__'),
    entry: Object.entries(entry).reduce((prev,[k,v]) => {
      return {...prev,[k]:path.resolve(__dirname, './__fixtures__', v)}
    },{}),
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [
            /node_modules/,
            path.resolve(__dirname, './__fixtures__/npmStyles.js'),
          ],
          use: {
            loader: require.resolve('babel-loader'),
          },
        },
      ],
    },
    plugins: [stylexPlugin, new HtmlWebpackPlugin()],
    devtool: false, //'cheap-source-map',
    externals: [
      'stylex',
      '@stylexjs/stylex',
      // '@stylexjs/stylex/lib/stylex-inject',
    ],
    mode: 'production',
    output: {
      path: path.resolve(__dirname, '__builds__'),
    },
    optimization: {
      // Keep output readable
      minimize: false,
      // Keep module IDs from changing between test runs
      // and failing the snapshot comparison
      moduleIds: 'named',
      // Remove webpack runtime from bundle
      runtimeChunk: 'single',
    },
    target: 'node',
    ...config,
  };

  const compiler = webpack(fullConfig);

  if (!config.outputFileSystem) {
    // Use in-memory file system
    compiler.outputFileSystem = memfs.createFsFromVolume(new memfs.Volume());
  }

  return compiler;
}

function getTargetFile(asset) {
  let targetFile = asset;
  const queryStringIdx = targetFile.indexOf('?');
  if (queryStringIdx >= 0) {
    targetFile = targetFile.substr(0, queryStringIdx);
  }
  return targetFile;
}

/**
 * Read assets in the webpack output
 */
function readAsset(asset, compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  const targetFile = getTargetFile(asset);
  try {
    return usedFs.readFileSync(path.join(outputPath, targetFile)).toString();
  } catch (error) {
    return error.toString();
  }
}

function assetExists(asset, compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  const targetFile = getTargetFile(asset);
  return usedFs.existsSync(path.join(outputPath, targetFile));
}

describe('extract-webpack-plugin', () => {
  it('extracts CSS and removes stylex.inject calls for each entry', (done) => {
    const compiler = createCompiler({main: 'index.js', other: 'other.js'});
    compiler.run((error, stats) => {
      expect(error).toBe(null);

      const mainCSS = readAsset('main.css', compiler, stats);
      const mainJS = readAsset('main.js', compiler, stats);
      const otherCSS = readAsset('other.css', compiler, stats);
      const otherJS = readAsset('other.js', compiler, stats);

      expect(mainCSS).toMatchInlineSnapshot(`
        "@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}
        .x1oz5o6v:hover:not(#\\#):not(#\\#){background:red}
        .xeuoslp:not(#\\#):not(#\\#):not(#\\#){animation-name:xgnty7z-B}
        .x1lliihq:not(#\\#):not(#\\#):not(#\\#){display:block}
        .x78zum5:not(#\\#):not(#\\#):not(#\\#){display:flex}
        .xt0psk2:not(#\\#):not(#\\#):not(#\\#){display:inline}
        .x1hm9lzh:not(#\\#):not(#\\#):not(#\\#){margin-inline-start:10px}
        .x1egiwwb:not(#\\#):not(#\\#):not(#\\#):not(#\\#){height:500px}
        .xlrshdv:not(#\\#):not(#\\#):not(#\\#):not(#\\#){margin-top:99px}
        .xh8yej3:not(#\\#):not(#\\#):not(#\\#):not(#\\#){width:100%}
        .x3hqpx7:not(#\\#):not(#\\#):not(#\\#):not(#\\#){width:50%}"
      `);

      expect(otherCSS).toMatchInlineSnapshot(`
        "@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}
        .x1oz5o6v:hover:not(#\\#):not(#\\#){background:red}
        .xeuoslp:not(#\\#):not(#\\#):not(#\\#){animation-name:xgnty7z-B}
        .x1lliihq:not(#\\#):not(#\\#):not(#\\#){display:block}
        .x78zum5:not(#\\#):not(#\\#):not(#\\#){display:flex}
        .x1hm9lzh:not(#\\#):not(#\\#):not(#\\#){margin-inline-start:10px}
        .x1egiwwb:not(#\\#):not(#\\#):not(#\\#):not(#\\#){height:500px}
        .xlrshdv:not(#\\#):not(#\\#):not(#\\#):not(#\\#){margin-top:99px}
        .xh8yej3:not(#\\#):not(#\\#):not(#\\#):not(#\\#){width:100%}"
      `);

      expect(mainJS).not.toContain('/lib/stylex-inject.js');
      expect(otherJS).not.toContain('/lib/stylex-inject.js');

      done();
    });
  });

  it('supports [name], [contenthash] in output filename', async () => {
    const compiler = createCompiler({
      main: 'index.js',
      other: 'other.js'
    }, {
      filename: '[name].[contenthash].css',
    });
    return new Promise((resolve, reject) => {
      compiler.run((error, stats) => {
        try {
          expect(error).toBe(null);
          expect(assetExists('main.09fffeec3686166d4767.css', compiler, stats),).toBe(true);
          expect(assetExists('other.8896b6b37d6834340ed1.css', compiler, stats),).toBe(true);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('works with HtmlWebpackPlugin', async () => {
    const compiler = createCompiler({
      main: 'index.js',
      other: 'other.js'
    }, {
      filename: '[name].[contenthash].css',
    });
    return new Promise((resolve, reject) => {
      compiler.run((error, stats) => {
        try {
          expect(error).toBe(null);
          expect(assetExists('index.html', compiler, stats),).toBe(true);
          expect(assetExists('main.09fffeec3686166d4767.css', compiler, stats),).toBe(true);
          expect(assetExists('other.8896b6b37d6834340ed1.css', compiler, stats),).toBe(true);

          const html = readAsset('index.html', compiler, stats);
          expect(html).toContain('<link href="main.09fffeec3686166d4767.css" rel="stylesheet">');
          expect(html).toContain('<link href="other.8896b6b37d6834340ed1.css" rel="stylesheet">');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  describe('when in dev mode', () => {
    it('preserves stylex.inject calls and does not extract CSS', (done) => {
      const compiler = createCompiler({
        main: 'index.js',
        other: 'other.js'
      }, { dev: true });
      compiler.run((error, stats) => {
        expect(error).toBe(null);

        const mainJS = readAsset('main.js', compiler, stats);
        const otherJS = readAsset('other.js', compiler, stats);

        expect(assetExists('main.css', compiler, stats)).toEqual(false);
        expect(assetExists('other.css', compiler, stats)).toEqual(false);

        expect(mainJS).toContain('/lib/stylex-inject.js');
        expect(otherJS).toContain('/lib/stylex-inject.js');

        done();
      });
    });
  });
});
