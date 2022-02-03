/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const rollup = require('rollup');
const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const stylexPlugin = require('../src/index');

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
        stylexPlugin(options),
      ],
    });

    // Generate output specific code in-memory
    // You can call this function multiple times on the same bundle object
    const { output } = await bundle.generate({
      output: {
        file: path.resolve(__dirname, '/__builds__/bundle.js'),
      },
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
      "import stylex from 'stylex';

      // otherStyles.js
      var styles$2 = {
        bar: {
          display: \\"f804f6gw\\",
          width: \\"ln8gz9je\\"
        }
      };

      // npmStyles.js
      const styles$1 = {
        baz: {
          display: \\"ew8mgplc\\",
          height: \\"cctpw5f5\\",
          width: \\"d9w12usg\\"
        }
      };

      // index.js
      var styles = {
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
        fileName: 'stylex.css',
      });

      expect(css).toBeUndefined();

      expect(js).toMatchInlineSnapshot(`
        "import stylex from 'stylex';

        // otherStyles.js
        stylex.inject(\\".f804f6gw{display:block}\\", 1);
        stylex.inject(\\".ln8gz9je{width:100%}\\", 1);
        var styles$2 = {
          bar: {
            otherStyles__bar: \\"otherStyles__bar\\",
            display: \\"f804f6gw\\",
            width: \\"ln8gz9je\\"
          }
        };

        // npmStyles.js
        stylex.inject(\\".ew8mgplc{display:inline}\\", 1);
        stylex.inject(\\".cctpw5f5{height:500px}\\", 1);
        stylex.inject(\\".d9w12usg{width:50%}\\", 1);
        const styles$1 = {
          baz: {
            npmStyles__baz: \\"npmStyles__baz\\",
            display: \\"ew8mgplc\\",
            height: \\"cctpw5f5\\",
            width: \\"d9w12usg\\"
          }
        };

        // index.js
        stylex.inject(\\"@keyframes px4mktj3-B{0%{opacity:.25;}100%{opacity:1;}}\\", 1);
        stylex.inject(\\".rn32yjq5{animation-name:px4mktj3-B}\\", 1);
        stylex.inject(\\".p357zi0d{display:flex}\\", 1);
        stylex.inject(\\".a3oefunm{margin-left:10px}\\", 1, \\".a3oefunm{margin-right:10px}\\");
        stylex.inject(\\".bjgvxnpl{margin-block-start:99px}\\", 1);
        stylex.inject(\\".cctpw5f5{height:500px}\\", 1);
        stylex.inject(\\".lq9oatf1:hover{background:red}\\", 7.1);
        var styles = {
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
          return stylex(styles$2.bar, styles.foo, styles$1.baz);
        }

        export { App as default };
        "
      `);
    });
  });
});
