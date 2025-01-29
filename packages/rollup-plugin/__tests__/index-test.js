/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import path from 'path';
import rollup from 'rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import stylexPlugin from '../src/index';

describe('rollup-plugin-stylex', () => {
  async function runStylex(options) {
    // Configure a rollup bundle
    const bundle = await rollup.rollup({
      // Remove stylex runtime from bundle
      external: [
        'stylex',
        '@stylexjs/stylex',
        '@stylexjs/stylex/lib/stylex-inject',
      ],
      input: path.resolve(__dirname, '__fixtures__/index.js'),
      plugins: [
        nodeResolve(),
        commonjs(),
        babel({
          babelHelpers: 'bundled',
          configFile: path.resolve(__dirname, '__fixtures__/.babelrc.json'),
          exclude: [/npmStyles\.js/],
        }),
        stylexPlugin({
          useCSSLayers: true,
          ...options,
          lightningcssOptions: { minify: false },
        }),
      ],
    });

    // Generate output specific code in-memory
    // You can call this function multiple times on the same bundle object
    const { output } = await bundle.generate({
      file: path.resolve(__dirname, '/__builds__/bundle.js'),
    });

    let css, js;

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.fileName === 'stylex.css') {
        css = chunkOrAsset.source;
      } else if (chunkOrAsset.fileName === 'bundle.js') {
        js = chunkOrAsset.code;
      }
    }

    return { css, js, output };
  }

  it('extracts CSS and removes stylex.inject calls', async () => {
    const { css, js } = await runStylex({ fileName: 'stylex.css' });

    expect(css).toMatchInlineSnapshot(`
      "@layer priority1 {
        @keyframes xgnty7z-B {
          0% {
            opacity: .25;
          }

          100% {
            opacity: 1;
          }
        }
      }

      @layer priority2 {
        .x1oz5o6v:hover {
          background: red;
        }
      }

      @layer priority3 {
        .xeuoslp {
          animation-name: xgnty7z-B;
        }

        .xu4yf9m {
          border-start-start-radius: 7.5px;
        }

        .x1lliihq {
          display: block;
        }

        .x78zum5 {
          display: flex;
        }

        .xt0psk2 {
          display: inline;
        }

        .x1hm9lzh {
          margin-inline-start: 10px;
        }
      }

      @layer priority4 {
        .x1egiwwb {
          height: 500px;
        }

        .xlrshdv {
          margin-top: 99px;
        }

        .xh8yej3 {
          width: 100%;
        }

        .x3hqpx7 {
          width: 50%;
        }
      }
      "
    `);

    expect(js).toMatchInlineSnapshot(`
      "import stylex from 'stylex';

      /**
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       *
       */

      var styles$2 = {
        bar: {
          "1p303ag": "x1lliihq",
          u9kq91: "xh8yej3",
          $$css: true
        }
      };

      /**
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       *
       */

      const styles$1 = {
        baz: {
          "1p303ag": "xt0psk2",
          "1i36v6j": "x1egiwwb",
          u9kq91: "x3hqpx7",
          $$css: true
        }
      };

      /**
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       *
       */

      var styles = {
        foo: {
          zba70f: "xeuoslp",
          "1p303ag": "x78zum5",
          "1jcfj6v": "x1hm9lzh",
          cbn5dw: null,
          br2gl8: null,
          p4ik3q: "xlrshdv",
          "1i36v6j": "x1egiwwb",
          "1d41aeb": "x1oz5o6v",
          "1nqjm4h": null,
          bygufj: null,
          ygddfn: null,
          "2scyum": null,
          jr2mr9: null,
          edxvk7: null,
          "1eeay1m": null,
          "1yc9v4u": null,
          "4ksdn9": null,
          "2g5vb7": null,
          s99x15: "xu4yf9m",
          yxoixu: null,
          "1mpivdy": null,
          $$css: true
        }
      };
      function App() {
        return stylex(styles$2.bar, styles.foo, styles$1.baz);
      }

      export { App as default };
      "
    `);
  });

  describe('when in dev mode', () => {
    it('preserves stylex.inject calls and does not extract CSS', async () => {
      const { css, js } = await runStylex({
        dev: true,
      });

      expect(css).toBeUndefined();

      expect(js).toMatchInlineSnapshot(`
        "import _inject from '@stylexjs/stylex/lib/stylex-inject';
        import stylex from 'stylex';

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */

        var _inject2$2 = _inject;
        _inject2$2(".display-x1lliihq{display:block}", 3000);
        _inject2$2(".width-xh8yej3{width:100%}", 4000);
        var styles$2 = {
          bar: {
            "otherStyles__styles.bar": "otherStyles__styles.bar",
            "display-1p303ag": "display-x1lliihq",
            "width-u9kq91": "width-xh8yej3",
            $$css: true
          }
        };

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */

        var _inject2$1 = _inject;
        _inject2$1(".display-xt0psk2{display:inline}", 3000);
        _inject2$1(".height-x1egiwwb{height:500px}", 4000);
        _inject2$1(".width-x3hqpx7{width:50%}", 4000);
        const styles$1 = {
          baz: {
            "npmStyles__styles.baz": "npmStyles__styles.baz",
            "display-1p303ag": "display-xt0psk2",
            "height-1i36v6j": "height-x1egiwwb",
            "width-u9kq91": "width-x3hqpx7",
            $$css: true
          }
        };

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */

        var _inject2 = _inject;
        _inject2("@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}", 1);
        _inject2(".animationName-xeuoslp{animation-name:xgnty7z-B}", 3000);
        _inject2(".display-x78zum5{display:flex}", 3000);
        _inject2(".marginInlineStart-x1hm9lzh{margin-inline-start:10px}", 3000);
        _inject2(".marginTop-xlrshdv{margin-top:99px}", 4000);
        _inject2(".height-x1egiwwb{height:500px}", 4000);
        _inject2(".background-x1oz5o6v:hover{background:red}", 1130);
        _inject2(".borderStartStartRadius-xu4yf9m{border-start-start-radius:7.5px}", 3000);
        var styles = {
          foo: {
            "index__styles.foo": "index__styles.foo",
            "animationName-zba70f": "animationName-xeuoslp",
            "display-1p303ag": "display-x78zum5",
            "marginInlineStart-1jcfj6v": "marginInlineStart-x1hm9lzh",
            "marginLeft-cbn5dw": null,
            "marginRight-br2gl8": null,
            "marginTop-p4ik3q": "marginTop-xlrshdv",
            "height-1i36v6j": "height-x1egiwwb",
            ":hover_background-1d41aeb": "background-x1oz5o6v",
            ":hover_backgroundAttachment-1nqjm4h": null,
            ":hover_backgroundClip-bygufj": null,
            ":hover_backgroundColor-ygddfn": null,
            ":hover_backgroundImage-2scyum": null,
            ":hover_backgroundOrigin-jr2mr9": null,
            ":hover_backgroundPosition-edxvk7": null,
            ":hover_backgroundPositionX-1eeay1m": null,
            ":hover_backgroundPositionY-1yc9v4u": null,
            ":hover_backgroundRepeat-4ksdn9": null,
            ":hover_backgroundSize-2g5vb7": null,
            "borderStartStartRadius-s99x15": "borderStartStartRadius-xu4yf9m",
            "borderTopLeftRadius-yxoixu": null,
            "borderTopRightRadius-1mpivdy": null,
            $$css: true
          }
        };
        function App() {
          return stylex(styles$2.bar, styles.foo, styles$1.baz);
        }

        export { App as default };
        "
      `);
    });
  });
  it('output filename match pattern', async () => {
    const { output } = await runStylex({ fileName: 'stylex.[hash].css' });
    const css = output.find(
      (chunkOrAsset) =>
        chunkOrAsset.type === 'asset' &&
        /^stylex.[0-9a-f]{8}\.css$/.test(chunkOrAsset.fileName),
    );
    expect(css.source).toMatchInlineSnapshot(`
      "@layer priority1 {
        @keyframes xgnty7z-B {
          0% {
            opacity: .25;
          }

          100% {
            opacity: 1;
          }
        }
      }

      @layer priority2 {
        .x1oz5o6v:hover {
          background: red;
        }
      }

      @layer priority3 {
        .xeuoslp {
          animation-name: xgnty7z-B;
        }

        .xu4yf9m {
          border-start-start-radius: 7.5px;
        }

        .x1lliihq {
          display: block;
        }

        .x78zum5 {
          display: flex;
        }

        .xt0psk2 {
          display: inline;
        }

        .x1hm9lzh {
          margin-inline-start: 10px;
        }
      }

      @layer priority4 {
        .x1egiwwb {
          height: 500px;
        }

        .xlrshdv {
          margin-top: 99px;
        }

        .xh8yej3 {
          width: 100%;
        }

        .x3hqpx7 {
          width: 50%;
        }
      }
      "
    `);
  });
});
