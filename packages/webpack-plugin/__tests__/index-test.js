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
        "@keyframes x11gtny7-B{0%{opacity:.25;}100%{opacity:1;}}
        .x188knyk{margin-block-start:99px}
        .x1c4r43l{display:flex}
        .x1je5kxa{height:500px}
        html:not([dir='rtl']) .x1n8p6zw{margin-left:10px}
        html[dir='rtl'] .x1n8p6zw{margin-right:10px}
        .x1nrqb13{animation-name:x11gtny7-B}
        .x1u78jha{width:50%}
        .x1wdx05y{display:inline}
        .x6mlivy{width:100%}
        .xntgbld{display:block}
        .x1kflwvg:hover{background:red}"
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
            display: "xntgbld",
            width: "x6mlivy"
          }
        };
        /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
        ;// CONCATENATED MODULE: ./npmStyles.js
        // npmStyles.js




        const npmStyles_styles = {
          baz: {
            display: "x1wdx05y",
            height: "x1je5kxa",
            width: "x1u78jha"
          }
        };
        /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));
        ;// CONCATENATED MODULE: ./index.js
        // index.js






        var fadeAnimation = "x11gtny7-B";
        var index_styles = {
          foo: {
            animationName: "x1nrqb13",
            display: "x1c4r43l",
            marginStart: "x1n8p6zw",
            marginBlockStart: "x188knyk",
            height: "x1je5kxa",
            ":hover_background": "x1kflwvg"
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

        expect(cssExists).toEqual(false);

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




          external_stylex_default().inject(".xntgbld{display:block}", 1);
          external_stylex_default().inject(".x6mlivy{width:100%}", 1);
          var styles = {
            bar: {
              "otherStyles__styles.bar": "otherStyles__styles.bar",
              display: "xntgbld",
              width: "x6mlivy"
            }
          };
          /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
          ;// CONCATENATED MODULE: ./npmStyles.js
          // npmStyles.js




          external_stylex_default().inject(".x1wdx05y{display:inline}", 1);
          external_stylex_default().inject(".x1je5kxa{height:500px}", 1);
          external_stylex_default().inject(".x1u78jha{width:50%}", 1);
          const npmStyles_styles = {
            baz: {
              "npmStyles__styles.baz": "npmStyles__styles.baz",
              display: "x1wdx05y",
              height: "x1je5kxa",
              width: "x1u78jha"
            }
          };
          /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));
          ;// CONCATENATED MODULE: ./index.js
          // index.js






          external_stylex_default().inject("@keyframes x11gtny7-B{0%{opacity:.25;}100%{opacity:1;}}", 1);
          var fadeAnimation = "x11gtny7-B";
          external_stylex_default().inject(".x1nrqb13{animation-name:x11gtny7-B}", 1);
          external_stylex_default().inject(".x1c4r43l{display:flex}", 1);
          external_stylex_default().inject(".x1n8p6zw{margin-left:10px}", 1, ".x1n8p6zw{margin-right:10px}");
          external_stylex_default().inject(".x188knyk{margin-block-start:99px}", 1);
          external_stylex_default().inject(".x1je5kxa{height:500px}", 1);
          external_stylex_default().inject(".x1kflwvg:hover{background:red}", 8);
          var index_styles = {
            foo: {
              "index__styles.foo": "index__styles.foo",
              animationName: "x1nrqb13",
              display: "x1c4r43l",
              marginStart: "x1n8p6zw",
              marginBlockStart: "x188knyk",
              height: "x1je5kxa",
              ":hover_background": "x1kflwvg"
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
