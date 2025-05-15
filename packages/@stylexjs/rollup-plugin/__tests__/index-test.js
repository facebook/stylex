/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
      "import * as stylex from 'stylex';

      /**
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */

      var styles$2 = {
        bar: {
          k1xSpc: "x1lliihq",
          kzqmXN: "xh8yej3",
          $$css: true
        }
      };

      /**
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */

      const styles$1 = {
        baz: {
          k1xSpc: "xt0psk2",
          kZKoxP: "x1egiwwb",
          kzqmXN: "x3hqpx7",
          $$css: true
        }
      };

      /**
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */

      var styles = {
        foo: {
          kKVMdj: "xeuoslp",
          k1xSpc: "x78zum5",
          keTefX: "x1hm9lzh",
          koQZXg: null,
          km5ZXQ: null,
          keoZOQ: "xlrshdv",
          kZKoxP: "x1egiwwb",
          kEyE8R: "x1oz5o6v",
          kwRxUf: null,
          kmvik3: null,
          kGzVvX: null,
          kBPHsk: null,
          kIpHjZ: null,
          kwsBex: null,
          kKEIo6: null,
          kdqC5e: null,
          kIjLOv: null,
          kA1KOB: null,
          krdFHd: "xu4yf9m",
          kIxVMA: null,
          ksF3WI: null,
          $$css: true
        }
      };
      function App() {
        return stylex.props(styles$2.bar, styles.foo, styles$1.baz);
      }

      export { App as default };
      "
    `);
  });

  describe('runtimeInjection:true', () => {
    it('preserves stylex.inject calls and does not extract CSS', async () => {
      const { css, js } = await runStylex({
        debug: true,
        runtimeInjection: true,
      });

      expect(css).toBeUndefined();

      expect(js).toMatchInlineSnapshot(`
        "import _inject from '@stylexjs/stylex/lib/stylex-inject';
        import * as stylex from 'stylex';

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var _inject2$2 = _inject;
        _inject2$2(".display-x1lliihq{display:block}", 3000);
        _inject2$2(".width-xh8yej3{width:100%}", 4000);
        var styles$2 = {
          bar: {
            "display-k1xSpc": "display-x1lliihq",
            "width-kzqmXN": "width-xh8yej3",
            $$css: "__fixtures__/otherStyles.js:14"
          }
        };

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var _inject2$1 = _inject;
        _inject2$1(".display-xt0psk2{display:inline}", 3000);
        _inject2$1(".height-x1egiwwb{height:500px}", 4000);
        _inject2$1(".width-x3hqpx7{width:50%}", 4000);
        const styles$1 = {
          baz: {
            "display-k1xSpc": "display-xt0psk2",
            "height-kZKoxP": "height-x1egiwwb",
            "width-kzqmXN": "width-x3hqpx7",
            $$css: "__fixtures__/npmStyles.js:15"
          }
        };

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
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
            "animationName-kKVMdj": "animationName-xeuoslp",
            "display-k1xSpc": "display-x78zum5",
            "marginInlineStart-keTefX": "marginInlineStart-x1hm9lzh",
            "marginLeft-koQZXg": null,
            "marginRight-km5ZXQ": null,
            "marginTop-keoZOQ": "marginTop-xlrshdv",
            "height-kZKoxP": "height-x1egiwwb",
            ":hover_background-kEyE8R": "background-x1oz5o6v",
            ":hover_backgroundAttachment-kwRxUf": null,
            ":hover_backgroundClip-kmvik3": null,
            ":hover_backgroundColor-kGzVvX": null,
            ":hover_backgroundImage-kBPHsk": null,
            ":hover_backgroundOrigin-kIpHjZ": null,
            ":hover_backgroundPosition-kwsBex": null,
            ":hover_backgroundPositionX-kKEIo6": null,
            ":hover_backgroundPositionY-kdqC5e": null,
            ":hover_backgroundRepeat-kIjLOv": null,
            ":hover_backgroundSize-kA1KOB": null,
            "borderStartStartRadius-krdFHd": "borderStartStartRadius-xu4yf9m",
            "borderTopLeftRadius-kIxVMA": null,
            "borderTopRightRadius-ksF3WI": null,
            $$css: "__fixtures__/index.js:24"
          }
        };
        function App() {
          return stylex.props(styles$2.bar, styles.foo, styles$1.baz);
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
