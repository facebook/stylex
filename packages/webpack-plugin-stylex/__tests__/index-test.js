/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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
        "html:not([dir='rtl']) .a3oefunm{margin-left:10px}
        html[dir='rtl'] .a3oefunm{margin-right:10px}
        .bjgvxnpl{margin-block-start:99px}
        .cctpw5f5{height:500px}
        .d9w12usg{width:50%}
        .ew8mgplc{display:inline}
        .f804f6gw{display:block}
        .ln8gz9je{width:100%}
        .p357zi0d{display:flex}
        @keyframes px4mktj3-B{0%{opacity:.25;}100%{opacity:1;}}
        .rn32yjq5{animation-name:px4mktj3-B}
        .lq9oatf1:hover{background:red}"
      `);

      expect(js).toMatchInlineSnapshot(`
        "\\"use strict\\";
        (() => {
        var exports = {};
        exports.id = 179;
        exports.ids = [179];
        exports.modules = {

        /***/ \\"./index.js\\":
        /***/ (() => {


        // UNUSED EXPORTS: default

        ;// CONCATENATED MODULE: external \\"stylex\\"
        const external_stylex_namespaceObject = stylex;
        ;// CONCATENATED MODULE: ./otherStyles.js
        // otherStyles.js



        var styles = {
          bar: {
            display: \\"f804f6gw\\",
            width: \\"ln8gz9je\\"
          }
        };
        /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
        ;// CONCATENATED MODULE: ./npmStyles.js
        // npmStyles.js



        const npmStyles_styles = {
          baz: {
            display: \\"ew8mgplc\\",
            height: \\"cctpw5f5\\",
            width: \\"d9w12usg\\"
          }
        };
        /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));
        ;// CONCATENATED MODULE: ./index.js
        // index.js





        var fadeAnimation = \\"px4mktj3-B\\";
        var index_styles = {
          foo: {
            animationName: \\"rn32yjq5\\",
            display: \\"p357zi0d\\",
            marginStart: \\"a3oefunm\\",
            marginBlockStart: \\"bjgvxnpl\\",
            height: \\"cctpw5f5\\",
            ':hover': {
              background: \\"lq9oatf1\\"
            }
          }
        };
        function App() {
          return stylex(otherStyles.bar, index_styles.foo, npmStyles.baz);
        }

        /***/ })

        };
        ;

        // load runtime
        var __webpack_require__ = require(\\"./runtime.js\\");
        __webpack_require__.C(exports);
        var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
        var __webpack_exports__ = (__webpack_exec__(\\"./index.js\\"));

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
          "\\"use strict\\";
          (() => {
          var exports = {};
          exports.id = 179;
          exports.ids = [179];
          exports.modules = {

          /***/ \\"./index.js\\":
          /***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


          // UNUSED EXPORTS: default

          ;// CONCATENATED MODULE: external \\"stylex\\"
          const external_stylex_namespaceObject = stylex;
          var external_stylex_default = /*#__PURE__*/__webpack_require__.n(external_stylex_namespaceObject);
          ;// CONCATENATED MODULE: ./otherStyles.js
          // otherStyles.js



          external_stylex_default().inject(\\".f804f6gw{display:block}\\", 1);
          external_stylex_default().inject(\\".ln8gz9je{width:100%}\\", 1);
          var styles = {
            bar: {
              otherStyles__bar: \\"otherStyles__bar\\",
              display: \\"f804f6gw\\",
              width: \\"ln8gz9je\\"
            }
          };
          /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
          ;// CONCATENATED MODULE: ./npmStyles.js
          // npmStyles.js



          external_stylex_default().inject(\\".ew8mgplc{display:inline}\\", 1);
          external_stylex_default().inject(\\".cctpw5f5{height:500px}\\", 1);
          external_stylex_default().inject(\\".d9w12usg{width:50%}\\", 1);
          const npmStyles_styles = {
            baz: {
              npmStyles__baz: \\"npmStyles__baz\\",
              display: \\"ew8mgplc\\",
              height: \\"cctpw5f5\\",
              width: \\"d9w12usg\\"
            }
          };
          /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));
          ;// CONCATENATED MODULE: ./index.js
          // index.js





          external_stylex_default().inject(\\"@keyframes px4mktj3-B{0%{opacity:.25;}100%{opacity:1;}}\\", 1);
          var fadeAnimation = \\"px4mktj3-B\\";
          external_stylex_default().inject(\\".rn32yjq5{animation-name:px4mktj3-B}\\", 1);
          external_stylex_default().inject(\\".p357zi0d{display:flex}\\", 1);
          external_stylex_default().inject(\\".a3oefunm{margin-left:10px}\\", 1, \\".a3oefunm{margin-right:10px}\\");
          external_stylex_default().inject(\\".bjgvxnpl{margin-block-start:99px}\\", 1);
          external_stylex_default().inject(\\".cctpw5f5{height:500px}\\", 1);
          external_stylex_default().inject(\\".lq9oatf1:hover{background:red}\\", 7.1);
          var index_styles = {
            foo: {
              index__foo: \\"index__foo\\",
              animationName: \\"rn32yjq5\\",
              display: \\"p357zi0d\\",
              marginStart: \\"a3oefunm\\",
              marginBlockStart: \\"bjgvxnpl\\",
              height: \\"cctpw5f5\\",
              ':hover': {
                index__foo: \\"index__foo\\",
                background: \\"lq9oatf1\\"
              }
            }
          };
          function App() {
            return stylex(otherStyles.bar, index_styles.foo, npmStyles.baz);
          }

          /***/ })

          };
          ;

          // load runtime
          var __webpack_require__ = require(\\"./runtime.js\\");
          __webpack_require__.C(exports);
          var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
          var __webpack_exports__ = (__webpack_exec__(\\"./index.js\\"));

          })();"
        `);
        done();
      });
    });
  });
});
