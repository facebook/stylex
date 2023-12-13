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
      external: ['stylex'],
      input: path.resolve(__dirname, '__fixtures__/index.js'),
      plugins: [
        nodeResolve(),
        commonjs(),
        babel({
          babelHelpers: 'bundled',
          configFile: path.resolve(__dirname, '__fixtures__/.babelrc.json'),
          exclude: [/npmStyles\.js/],
        }),
        stylexPlugin({ useCSSLayers: true, ...options }),
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

    return { css, js };
  }

  it('extracts CSS and removes stylex.inject calls', async () => {
    const { css, js } = await runStylex({ fileName: 'stylex.css' });

    expect(css).toMatchInlineSnapshot(`
      "
      @layer priority1, priority2, priority3, priority4;
      @layer priority1{
      @keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}
      }
      @layer priority2{
      .x1oz5o6v:hover{background:red}
      }
      @layer priority3{
      .xeuoslp{animation-name:xgnty7z-B}
      .x1lliihq{display:block}
      .x78zum5{display:flex}
      .xt0psk2{display:inline}
      .x1hm9lzh{margin-inline-start:10px}
      }
      @layer priority4{
      .x1egiwwb{height:500px}
      .xlrshdv{margin-top:99px}
      .xh8yej3{width:100%}
      .x3hqpx7{width:50%}
      }"
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
          display: "x1lliihq",
          width: "xh8yej3",
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
          display: "xt0psk2",
          height: "x1egiwwb",
          width: "x3hqpx7",
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
        "import stylex from 'stylex';

        /**
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         *
         *
         */

        stylex.inject(".x1lliihq{display:block}", 3000);
        stylex.inject(".xh8yej3{width:100%}", 4000);
        var styles$2 = {
          bar: {
            "otherStyles__styles.bar": "otherStyles__styles.bar",
            display: "x1lliihq",
            width: "xh8yej3",
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

        stylex.inject(".xt0psk2{display:inline}", 3000);
        stylex.inject(".x1egiwwb{height:500px}", 4000);
        stylex.inject(".x3hqpx7{width:50%}", 4000);
        const styles$1 = {
          baz: {
            "npmStyles__styles.baz": "npmStyles__styles.baz",
            display: "xt0psk2",
            height: "x1egiwwb",
            width: "x3hqpx7",
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

        stylex.inject("@keyframes xgnty7z-B{0%{opacity:.25;}100%{opacity:1;}}", 1);
        stylex.inject(".xeuoslp{animation-name:xgnty7z-B}", 3000);
        stylex.inject(".x78zum5{display:flex}", 3000);
        stylex.inject(".x1hm9lzh{margin-inline-start:10px}", 3000);
        stylex.inject(".xlrshdv{margin-top:99px}", 4000);
        stylex.inject(".x1egiwwb{height:500px}", 4000);
        stylex.inject(".x1oz5o6v:hover{background:red}", 1130);
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
          return stylex(styles$2.bar, styles.foo, styles$1.baz);
        }

        export { App as default };
        "
      `);
    });
  });
});
