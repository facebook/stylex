/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const memfs = require('memfs');
const path = require('path');
const StylexPlugin = require('../src/index');
const webpack = require('webpack');

/**
 * Webpack compiler factory
 */
function createCompiler(fixture, pluginOptions = {}, config = {}) {
  const stylexPlugin = new StylexPlugin(pluginOptions);
  const fullConfig = {
    context: path.resolve(__dirname, './__fixtures__'),
    entry: path.resolve(__dirname, './__fixtures__', fixture),
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
    plugins: [stylexPlugin],
    devtool: false, //'cheap-source-map',
    externals: {
      // Remove stylex runtime from bundle
      stylex: 'stylex',
    },
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

describe('webpack-plugin-stylex', () => {
  it('extracts CSS and removes stylex.inject calls', (done) => {
    const compiler = createCompiler('index.js');
    compiler.run((error, stats) => {
      expect(error).toBe(null);

      const css = readAsset('stylex.css', compiler, stats);
      const js = readAsset('main.js', compiler, stats);

      expect(css).toMatchInlineSnapshot(`
        "@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}
        .xeuoslp{animation-name:xgnty7z-B}
        .x1lliihq{display:block}
        .x78zum5{display:flex}
        .xt0psk2{display:inline}
        .x1egiwwb{height:500px}
        .x1hm9lzh{margin-inline-start:10px}
        .xlrshdv{margin-top:99px}
        .xh8yej3{width:100%}
        .x3hqpx7{width:50%}
        .x1oz5o6v:hover{background:red}"
      `);

      expect(js).toMatchInlineSnapshot(`
        ""use strict";
        (() => {
        var exports = {};
        exports.id = 179;
        exports.ids = [179];
        exports.modules = {

        /***/ "./index.js":
        /***/ (() => {


        // UNUSED EXPORTS: default

        ;// CONCATENATED MODULE: external "stylex"
        const external_stylex_namespaceObject = stylex;
        ;// CONCATENATED MODULE: ./otherStyles.js
        // otherStyles.js




        var styles = {
          bar: {
            display: "x1lliihq",
            width: "xh8yej3",
            $$css: true
          }
        };
        /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
        ;// CONCATENATED MODULE: ./npmStyles.js
        // npmStyles.js




        const npmStyles_styles = {
          baz: {
            display: "xt0psk2",
            height: "x1egiwwb",
            width: "x3hqpx7",
            $$css: true
          }
        };
        /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));
        ;// CONCATENATED MODULE: ./index.js
        // index.js






        var fadeAnimation = "xgnty7z-B";
        var index_styles = {
          foo: {
            animationName: "xeuoslp",
            display: "x78zum5",
            marginInlineStart: "x1hm9lzh",
            marginLeft: null,
            marginRight: null,
            marginTop: "xlrshdv",
            height: "x1egiwwb",
            ":hover_background": "x1oz5o6v",
            ":hover_backgroundAttachment": null,
            ":hover_backgroundClip": null,
            ":hover_backgroundColor": null,
            ":hover_backgroundImage": null,
            ":hover_backgroundOrigin": null,
            ":hover_backgroundPosition": null,
            ":hover_backgroundRepeat": null,
            ":hover_backgroundSize": null,
            $$css: true
          }
        };
        function App() {
          return stylex(otherStyles.bar, index_styles.foo, npmStyles.baz);
        }

        /***/ })

        };
        ;

        // load runtime
        var __webpack_require__ = require("./runtime.js");
        __webpack_require__.C(exports);
        var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
        var __webpack_exports__ = (__webpack_exec__("./index.js"));

        })();"
      `);
      done();
    });
  });

  describe('when in dev mode', () => {
    it('preserves stylex.inject calls and does not extract CSS', (done) => {
      const compiler = createCompiler('index.js', { dev: true });
      compiler.run((error, stats) => {
        expect(error).toBe(null);

        const cssExists = assetExists('stylex.css', compiler, stats);
        const js = readAsset('main.js', compiler, stats);

        expect(cssExists).toEqual(true);

        expect(js).toMatchInlineSnapshot(`
          ""use strict";
          (() => {
          var exports = {};
          exports.id = 179;
          exports.ids = [179];
          exports.modules = {

          /***/ "./index.js":
          /***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


          // UNUSED EXPORTS: default

          ;// CONCATENATED MODULE: external "stylex"
          const external_stylex_namespaceObject = stylex;
          var external_stylex_default = /*#__PURE__*/__webpack_require__.n(external_stylex_namespaceObject);
          ;// CONCATENATED MODULE: ./otherStyles.js
          // otherStyles.js




          external_stylex_default().inject(".x1lliihq{display:block}", 4);
          external_stylex_default().inject(".xh8yej3{width:100%}", 4);
          var styles = {
            bar: {
              "otherStyles__styles.bar": "otherStyles__styles.bar",
              display: "x1lliihq",
              width: "xh8yej3",
              $$css: true
            }
          };
          /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
          ;// CONCATENATED MODULE: ./npmStyles.js
          // npmStyles.js




          external_stylex_default().inject(".xt0psk2{display:inline}", 4);
          external_stylex_default().inject(".x1egiwwb{height:500px}", 4);
          external_stylex_default().inject(".x3hqpx7{width:50%}", 4);
          const npmStyles_styles = {
            baz: {
              "npmStyles__styles.baz": "npmStyles__styles.baz",
              display: "xt0psk2",
              height: "x1egiwwb",
              width: "x3hqpx7",
              $$css: true
            }
          };
          /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));
          ;// CONCATENATED MODULE: ./index.js
          // index.js






          external_stylex_default().inject("@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}", 1);
          var fadeAnimation = "xgnty7z-B";
          external_stylex_default().inject(".xeuoslp{animation-name:xgnty7z-B}", 4);
          external_stylex_default().inject(".x78zum5{display:flex}", 4);
          external_stylex_default().inject(".x1hm9lzh{margin-inline-start:10px}", 4);
          external_stylex_default().inject(".xlrshdv{margin-top:99px}", 4);
          external_stylex_default().inject(".x1egiwwb{height:500px}", 4);
          external_stylex_default().inject(".x1oz5o6v:hover{background:red}", 16);
          var index_styles = {
            foo: {
              "index__styles.foo": "index__styles.foo",
              animationName: "xeuoslp",
              display: "x78zum5",
              marginInlineStart: "x1hm9lzh",
              marginLeft: null,
              marginRight: null,
              marginTop: "xlrshdv",
              height: "x1egiwwb",
              ":hover_background": "x1oz5o6v",
              ":hover_backgroundAttachment": null,
              ":hover_backgroundClip": null,
              ":hover_backgroundColor": null,
              ":hover_backgroundImage": null,
              ":hover_backgroundOrigin": null,
              ":hover_backgroundPosition": null,
              ":hover_backgroundRepeat": null,
              ":hover_backgroundSize": null,
              $$css: true
            }
          };
          function App() {
            return stylex(otherStyles.bar, index_styles.foo, npmStyles.baz);
          }

          /***/ })

          };
          ;

          // load runtime
          var __webpack_require__ = require("./runtime.js");
          __webpack_require__.C(exports);
          var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
          var __webpack_exports__ = (__webpack_exec__("./index.js"));

          })();"
        `);
        done();
      });
    });
  });
});
