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

describe('webpack-plugin-stylex', () => {
  it('extracts CSS and removes stylex.inject calls', (done) => {
    const compiler = createCompiler('index.js');
    compiler.run((error, stats) => {
      expect(error).toBe(null);

      const css = readAsset('stylex.css', compiler, stats);
      const js = readAsset('main.js', compiler, stats);

      expect(css).toMatchInlineSnapshot(`
        "@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}
        .x1oz5o6v:hover:not(#\\#){background:red}
        .xeuoslp:not(#\\#):not(#\\#){animation-name:xgnty7z-B}
        .x1lliihq:not(#\\#):not(#\\#){display:block}
        .x78zum5:not(#\\#):not(#\\#){display:flex}
        .xt0psk2:not(#\\#):not(#\\#){display:inline}
        .x1hm9lzh:not(#\\#):not(#\\#){margin-inline-start:10px}
        .x1egiwwb:not(#\\#):not(#\\#):not(#\\#){height:500px}
        .xlrshdv:not(#\\#):not(#\\#):not(#\\#){margin-top:99px}
        .xh8yej3:not(#\\#):not(#\\#):not(#\\#){width:100%}
        .x3hqpx7:not(#\\#):not(#\\#):not(#\\#){width:50%}"
      `);

      expect(js).toMatchInlineSnapshot(`
        ""use strict";
        (() => {
        var exports = {};
        exports.id = 179;
        exports.ids = [179];
        exports.modules = {

        /***/ "./index.js":
        /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

        var __webpack_unused_export__;
        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */



        __webpack_unused_export__ = ({
          value: true
        });
        __webpack_unused_export__ = App;
        var _stylex = _interopRequireDefault(__webpack_require__("stylex"));
        var _otherStyles = _interopRequireDefault(__webpack_require__("./otherStyles.js"));
        var _npmStyles = _interopRequireDefault(__webpack_require__("./npmStyles.js"));
        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
        var fadeAnimation = "xgnty7z-B";
        var styles = {
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
            ":hover_backgroundPositionX": null,
            ":hover_backgroundPositionY": null,
            ":hover_backgroundRepeat": null,
            ":hover_backgroundSize": null,
            $$css: true
          }
        };
        function App() {
          return (0, _stylex.default)(_otherStyles.default.bar, styles.foo, _npmStyles.default.baz);
        }

        /***/ }),

        /***/ "./otherStyles.js":
        /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */

        // otherStyles.js



        Object.defineProperty(exports, "__esModule", ({
          value: true
        }));
        exports["default"] = void 0;
        var _stylex = _interopRequireDefault(__webpack_require__("stylex"));
        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
        var styles = {
          bar: {
            display: "x1lliihq",
            width: "xh8yej3",
            $$css: true
          }
        };
        var _default = exports["default"] = styles;

        /***/ }),

        /***/ "./npmStyles.js":
        /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */

        // npmStyles.js



        Object.defineProperty(exports, "__esModule", ({
          value: true
        }));
        exports["default"] = void 0;
        var _stylex = _interopRequireDefault(__webpack_require__("stylex"));
        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
        const styles = {
          baz: {
            display: "xt0psk2",
            height: "x1egiwwb",
            width: "x3hqpx7",
            $$css: true
          }
        };
        var _default = exports["default"] = styles;

        /***/ }),

        /***/ "stylex":
        /***/ ((module) => {

        module.exports = stylex;

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

  it('supports [contenthash] in output filename', async () => {
    const compiler = createCompiler('index.js', {
      filename: 'stylex.[contenthash].css',
    });
    return new Promise((resolve, reject) => {
      compiler.run((error, stats) => {
        try {
          expect(error).toBe(null);
          expect(
            assetExists('stylex.ae864b39498ef34ea2aa.css', compiler, stats),
          ).toBe(true);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
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

          /***/ "../../../stylex/lib/StyleXSheet.js":
          /***/ ((__unused_webpack_module, exports, __webpack_require__) => {



          Object.defineProperty(exports, "__esModule", ({
            value: true
          }));
          exports.styleSheet = exports.StyleXSheet = void 0;
          var _invariant = _interopRequireDefault(__webpack_require__("../../../../node_modules/invariant/invariant.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
              default: obj
            };
          }
          const LIGHT_MODE_CLASS_NAME = '__fb-light-mode';
          const DARK_MODE_CLASS_NAME = '__fb-dark-mode';
          function buildTheme(selector, theme) {
            const lines = [];
            lines.push(\`\${selector} {\`);
            for (const key in theme) {
              const value = theme[key];
              lines.push(\`  --\${key}: \${value};\`);
            }
            lines.push('}');
            return lines.join('\\n');
          }
          function makeStyleTag() {
            const tag = document.createElement('style');
            tag.setAttribute('type', 'text/css');
            tag.setAttribute('data-stylex', 'true');
            const head = document.head || document.getElementsByTagName('head')[0];
            (0, _invariant.default)(head, 'expected head');
            head.appendChild(tag);
            return tag;
          }
          function doesSupportCSSVariables() {
            return globalThis.CSS != null && globalThis.CSS.supports != null && globalThis.CSS.supports('--fake-var:0');
          }
          const VARIABLE_MATCH = /var\\(--(.*?)\\)/g;
          class StyleXSheet {
            static LIGHT_MODE_CLASS_NAME = LIGHT_MODE_CLASS_NAME;
            static DARK_MODE_CLASS_NAME = DARK_MODE_CLASS_NAME;
            constructor(opts) {
              this.tag = null;
              this.injected = false;
              this.ruleForPriority = new Map();
              this.rules = [];
              this.rootTheme = opts.rootTheme;
              this.rootDarkTheme = opts.rootDarkTheme;
              this.supportsVariables = opts.supportsVariables ?? doesSupportCSSVariables();
            }
            getVariableMatch() {
              return VARIABLE_MATCH;
            }
            isHeadless() {
              return this.tag == null || globalThis?.document?.body == null;
            }
            getTag() {
              const {
                tag
              } = this;
              (0, _invariant.default)(tag != null, 'expected tag');
              return tag;
            }
            getCSS() {
              return this.rules.join('\\n');
            }
            getRulePosition(rule) {
              return this.rules.indexOf(rule);
            }
            getRuleCount() {
              return this.rules.length;
            }
            inject() {
              if (this.injected) {
                return;
              }
              this.injected = true;
              if (globalThis.document?.body == null) {
                this.injectTheme();
                return;
              }
              this.tag = makeStyleTag();
              this.injectTheme();
            }
            injectTheme() {
              if (this.rootTheme != null) {
                this.insert(buildTheme(\`:root, .\${LIGHT_MODE_CLASS_NAME}\`, this.rootTheme), 0);
              }
              if (this.rootDarkTheme != null) {
                this.insert(buildTheme(\`.\${DARK_MODE_CLASS_NAME}:root, .\${DARK_MODE_CLASS_NAME}\`, this.rootDarkTheme), 0);
              }
            }
            __injectCustomThemeForTesting(selector, theme) {
              if (theme != null) {
                this.insert(buildTheme(selector, theme), 0);
              }
            }
            delete(rule) {
              const index = this.rules.indexOf(rule);
              (0, _invariant.default)(index >= 0, "Couldn't find the index for rule %s", rule);
              this.rules.splice(index, 1);
              if (this.isHeadless()) {
                return;
              }
              const tag = this.getTag();
              const sheet = tag.sheet;
              (0, _invariant.default)(sheet, 'expected sheet');
              sheet.deleteRule(index);
            }
            normalizeRule(rule) {
              const {
                rootTheme
              } = this;
              if (this.supportsVariables || rootTheme == null) {
                return rule;
              }
              return rule.replace(VARIABLE_MATCH, (_match, name) => {
                return rootTheme[name];
              });
            }
            getInsertPositionForPriority(priority) {
              const priorityRule = this.ruleForPriority.get(priority);
              if (priorityRule != null) {
                return this.rules.indexOf(priorityRule) + 1;
              }
              const priorities = Array.from(this.ruleForPriority.keys()).sort((a, b) => b - a).filter(num => num > priority ? 1 : 0);
              if (priorities.length === 0) {
                return this.getRuleCount();
              }
              const lastPriority = priorities.pop();
              return this.rules.indexOf(this.ruleForPriority.get(lastPriority));
            }
            insert(rawLTRRule, priority, rawRTLRule) {
              if (this.injected === false) {
                this.inject();
              }
              if (rawRTLRule != null) {
                this.insert(addAncestorSelector(rawLTRRule, "html:not([dir='rtl'])"), priority);
                this.insert(addAncestorSelector(rawRTLRule, "html[dir='rtl']"), priority);
                return;
              }
              const rawRule = rawLTRRule;
              if (this.rules.includes(rawRule)) {
                return;
              }
              const rule = this.normalizeRule(addSpecificityLevel(rawRule, Math.floor(priority / 1000)));
              const insertPos = this.getInsertPositionForPriority(priority);
              this.rules.splice(insertPos, 0, rule);
              this.ruleForPriority.set(priority, rule);
              if (this.isHeadless()) {
                return;
              }
              const tag = this.getTag();
              const sheet = tag.sheet;
              if (sheet != null) {
                try {
                  sheet.insertRule(rule, Math.min(insertPos, sheet.cssRules.length));
                } catch (err) {
                  console.error('insertRule error', err, rule, insertPos);
                }
              }
            }
          }
          exports.StyleXSheet = StyleXSheet;
          function addAncestorSelector(selector, ancestorSelector) {
            if (!selector.startsWith('@')) {
              return \`\${ancestorSelector} \${selector}\`;
            }
            const firstBracketIndex = selector.indexOf('{');
            const mediaQueryPart = selector.slice(0, firstBracketIndex + 1);
            const rest = selector.slice(firstBracketIndex + 1);
            return \`\${mediaQueryPart}\${ancestorSelector} \${rest}\`;
          }
          function addSpecificityLevel(selector, index) {
            if (selector.startsWith('@keyframes')) {
              return selector;
            }
            const pseudo = Array.from({
              length: index
            }).map(() => ':not(#\\\\#)').join('');
            const lastOpenCurly = selector.includes('::') ? selector.indexOf('::') : selector.lastIndexOf('{');
            const beforeCurly = selector.slice(0, lastOpenCurly);
            const afterCurly = selector.slice(lastOpenCurly);
            return \`\${beforeCurly}\${pseudo}\${afterCurly}\`;
          }
          const styleSheet = exports.styleSheet = new StyleXSheet({
            supportsVariables: true,
            rootTheme: {},
            rootDarkTheme: {}
          });

          /***/ }),

          /***/ "../../../stylex/lib/stylex-inject.js":
          /***/ ((__unused_webpack_module, exports, __webpack_require__) => {



          Object.defineProperty(exports, "__esModule", ({
            value: true
          }));
          exports["default"] = inject;
          var _StyleXSheet = __webpack_require__("../../../stylex/lib/StyleXSheet.js");
          function inject(ltrRule, priority) {
            let rtlRule = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            _StyleXSheet.styleSheet.insert(ltrRule, priority, rtlRule);
          }

          /***/ }),

          /***/ "./index.js":
          /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

          var __webpack_unused_export__;
          /**
           * Copyright (c) Meta Platforms, Inc. and affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           *
           *
           */



          __webpack_unused_export__ = ({
            value: true
          });
          __webpack_unused_export__ = App;
          var _stylexInject = _interopRequireDefault(__webpack_require__("../../../stylex/lib/stylex-inject.js"));
          var _stylex = _interopRequireDefault(__webpack_require__("stylex"));
          var _otherStyles = _interopRequireDefault(__webpack_require__("./otherStyles.js"));
          var _npmStyles = _interopRequireDefault(__webpack_require__("./npmStyles.js"));
          function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
          (0, _stylexInject.default)("@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}", 1);
          var fadeAnimation = "xgnty7z-B";
          _inject(".xeuoslp{animation-name:xgnty7z-B}", 3000);
          _inject(".x78zum5{display:flex}", 3000);
          _inject(".x1hm9lzh{margin-inline-start:10px}", 3000);
          _inject(".xlrshdv{margin-top:99px}", 4000);
          _inject(".x1egiwwb{height:500px}", 4000);
          _inject(".x1oz5o6v:hover{background:red}", 1130);
          var styles = {
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
              ":hover_backgroundPositionX": null,
              ":hover_backgroundPositionY": null,
              ":hover_backgroundRepeat": null,
              ":hover_backgroundSize": null,
              $$css: true
            }
          };
          function App() {
            return (0, _stylex.default)(_otherStyles.default.bar, styles.foo, _npmStyles.default.baz);
          }

          /***/ }),

          /***/ "./otherStyles.js":
          /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

          /**
           * Copyright (c) Meta Platforms, Inc. and affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           *
           *
           */

          // otherStyles.js



          Object.defineProperty(exports, "__esModule", ({
            value: true
          }));
          exports["default"] = void 0;
          var _stylexInject = _interopRequireDefault(__webpack_require__("../../../stylex/lib/stylex-inject.js"));
          var _stylex = _interopRequireDefault(__webpack_require__("stylex"));
          function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
          (0, _stylexInject.default)(".x1lliihq{display:block}", 3000);
          _inject(".xh8yej3{width:100%}", 4000);
          var styles = {
            bar: {
              "otherStyles__styles.bar": "otherStyles__styles.bar",
              display: "x1lliihq",
              width: "xh8yej3",
              $$css: true
            }
          };
          var _default = exports["default"] = styles;

          /***/ }),

          /***/ "../../../../node_modules/invariant/invariant.js":
          /***/ ((module) => {

          /**
           * Copyright (c) 2013-present, Facebook, Inc.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */



          /**
           * Use invariant() to assert state which your program assumes to be true.
           *
           * Provide sprintf-style format (only %s is supported) and arguments
           * to provide information about what broke and what you were
           * expecting.
           *
           * The invariant message will be stripped in production, but the invariant
           * will remain to ensure logic does not differ in production.
           */

          var NODE_ENV = "production";

          var invariant = function(condition, format, a, b, c, d, e, f) {
            if (NODE_ENV !== 'production') {
              if (format === undefined) {
                throw new Error('invariant requires an error message argument');
              }
            }

            if (!condition) {
              var error;
              if (format === undefined) {
                error = new Error(
                  'Minified exception occurred; use the non-minified dev environment ' +
                  'for the full error message and additional helpful warnings.'
                );
              } else {
                var args = [a, b, c, d, e, f];
                var argIndex = 0;
                error = new Error(
                  format.replace(/%s/g, function() { return args[argIndex++]; })
                );
                error.name = 'Invariant Violation';
              }

              error.framesToPop = 1; // we don't care about invariant's own frame
              throw error;
            }
          };

          module.exports = invariant;


          /***/ }),

          /***/ "./npmStyles.js":
          /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

          /**
           * Copyright (c) Meta Platforms, Inc. and affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           *
           *
           */

          // npmStyles.js



          Object.defineProperty(exports, "__esModule", ({
            value: true
          }));
          exports["default"] = void 0;
          var _stylexInject = _interopRequireDefault(__webpack_require__("../../../stylex/lib/stylex-inject.js"));
          var _stylex = _interopRequireDefault(__webpack_require__("stylex"));
          function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
          (0, _stylexInject.default)(".xt0psk2{display:inline}", 3000);
          _inject(".x1egiwwb{height:500px}", 4000);
          _inject(".x3hqpx7{width:50%}", 4000);
          const styles = {
            baz: {
              "npmStyles__styles.baz": "npmStyles__styles.baz",
              display: "xt0psk2",
              height: "x1egiwwb",
              width: "x3hqpx7",
              $$css: true
            }
          };
          var _default = exports["default"] = styles;

          /***/ }),

          /***/ "stylex":
          /***/ ((module) => {

          module.exports = stylex;

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
