/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const memfs = require('memfs');
const path = require('path');
const stylexBabelPlugin = require('babel-plugin-transform-stylex');
const StylexPlugin = require('../src/index');
const webpack = require('webpack');

/**
 * Webpack compiler factory
 */
function createCompiler(fixture, pluginOptions = {}, config = {}) {
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
            options: {
              plugins: [[stylexBabelPlugin, { dev: true, ...pluginOptions }]],
              metadataSubscribers: [StylexPlugin.stylexMetadataSubscription],
            },
          },
        },
      ],
    },
    plugins: [
      new StylexPlugin({
        filename: 'stylex.css',
      }),
    ],
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

/**
 * Read assets in the webpack output
 */
function readAsset(asset, compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  let targetFile = asset;
  const queryStringIdx = targetFile.indexOf('?');
  if (queryStringIdx >= 0) {
    targetFile = targetFile.substr(0, queryStringIdx);
  }
  try {
    return usedFs.readFileSync(path.join(outputPath, targetFile)).toString();
  } catch (error) {
    return error.toString();
  }
}

describe('webpack-plugin-stylex', () => {
  it('extracts CSS and removes stylex.inject calls', (done) => {
    const compiler = createCompiler('index.js');
    compiler.run((error, stats) => {
      expect(error).toBe(null);

      const css = readAsset('stylex.css', compiler, stats);
      const js = readAsset('main.js', compiler, stats);

      expect(css).toMatchInlineSnapshot(`
        ".alzwoclg{display:flex}
        html:not([dir='rtl']) .a60616oh{margin-left:10px}
        html[dir='rtl'] .a60616oh{margin-right:10px}
        .h9hgjgce{margin-block-start:99px}
        .mjo95iq7{height:500px}
        .b6ax4al1{display:block}
        .mfclru0v{width:100%}
        .ew9r2zzs:hover{background:red}"
      `);

      expect(js).toMatchInlineSnapshot(`
        "\\"use strict\\";
        (() => {
        var exports = {};
        exports.id = 179;
        exports.ids = [179];
        exports.modules = {

        /***/ 899:
        /***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


        // UNUSED EXPORTS: default

        ;// CONCATENATED MODULE: external \\"stylex\\"
        const external_stylex_namespaceObject = stylex;
        var external_stylex_default = /*#__PURE__*/__webpack_require__.n(external_stylex_namespaceObject);
        ;// CONCATENATED MODULE: ./otherStyles.js
        // otherStyles.js



        external_stylex_default().inject(\\".b6ax4al1{display:block}\\", 1);
        external_stylex_default().inject(\\".mfclru0v{width:100%}\\", 1);
        const styles = {
          bar: {
            otherStyles__bar: \\"otherStyles__bar\\",
            display: \\"b6ax4al1\\",
            width: \\"mfclru0v\\"
          }
        };
        /* harmony default export */ const otherStyles_0 = ((/* unused pure expression or super */ null && (styles)));
        ;// CONCATENATED MODULE: ./npmStyles.js
        // npmStyles.js





        external_stylex_default().inject('.rse6dlih{display:inline}', 1);
        external_stylex_default().inject('.ezi3dscr{width:50%}', 1);
        const npmStyles_styles = {
          baz: {
            display: 'rse6dlih',
            width: 'ezi3dscr',
          },
        };

        /* harmony default export */ const npmStyles_0 = ((/* unused pure expression or super */ null && (npmStyles_styles)));

        ;// CONCATENATED MODULE: ./index.js
        // index.js





        external_stylex_default().inject(\\".alzwoclg{display:flex}\\", 1);
        external_stylex_default().inject(\\".a60616oh{margin-left:10px}\\", 1, \\".a60616oh{margin-right:10px}\\");
        external_stylex_default().inject(\\".h9hgjgce{margin-block-start:99px}\\", 1);
        external_stylex_default().inject(\\".mjo95iq7{height:500px}\\", 1);
        external_stylex_default().inject(\\".ew9r2zzs:hover{background:red}\\", 7.1);
        const index_styles = {
          foo: {
            index__foo: \\"index__foo\\",
            display: \\"alzwoclg\\",
            marginStart: \\"a60616oh\\",
            marginBlockStart: \\"h9hgjgce\\",
            height: \\"mjo95iq7\\",
            ':hover': {
              index__foo: \\"index__foo\\",
              background: \\"ew9r2zzs\\"
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
        var __webpack_exports__ = (__webpack_exec__(899));

        })();"
      `);
      done();
    });
  });
});
