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
      "import stylex from 'stylex';

      // otherStyles.js
      var styles$2 = {
        bar: {
          display: \\"xntgbld\\",
          width: \\"x6mlivy\\"
        }
      };

      // npmStyles.js
      const styles$1 = {
        baz: {
          display: \\"x1wdx05y\\",
          height: \\"x1je5kxa\\",
          width: \\"x1u78jha\\"
        }
      };

      // index.js
      var styles = {
        foo: {
          animationName: \\"x1nrqb13\\",
          display: \\"x1c4r43l\\",
          marginStart: \\"x1n8p6zw\\",
          marginBlockStart: \\"x188knyk\\",
          height: \\"x1je5kxa\\",
          ':hover': {
            background: \\"x1kflwvg\\"
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
        stylex.inject(\\".xntgbld{display:block}\\", 1);
        stylex.inject(\\".x6mlivy{width:100%}\\", 1);
        var styles$2 = {
          bar: {
            otherStyles__bar: \\"otherStyles__bar\\",
            display: \\"xntgbld\\",
            width: \\"x6mlivy\\"
          }
        };

        // npmStyles.js
        stylex.inject(\\".x1wdx05y{display:inline}\\", 1);
        stylex.inject(\\".x1je5kxa{height:500px}\\", 1);
        stylex.inject(\\".x1u78jha{width:50%}\\", 1);
        const styles$1 = {
          baz: {
            npmStyles__baz: \\"npmStyles__baz\\",
            display: \\"x1wdx05y\\",
            height: \\"x1je5kxa\\",
            width: \\"x1u78jha\\"
          }
        };

        // index.js
        stylex.inject(\\"@keyframes x11gtny7-B{0%{opacity:.25;}100%{opacity:1;}}\\", 1);
        stylex.inject(\\".x1nrqb13{animation-name:x11gtny7-B}\\", 1);
        stylex.inject(\\".x1c4r43l{display:flex}\\", 1);
        stylex.inject(\\".x1n8p6zw{margin-left:10px}\\", 1, \\".x1n8p6zw{margin-right:10px}\\");
        stylex.inject(\\".x188knyk{margin-block-start:99px}\\", 1);
        stylex.inject(\\".x1je5kxa{height:500px}\\", 1);
        stylex.inject(\\".x1kflwvg:hover{background:red}\\", 7.1);
        var styles = {
          foo: {
            index__foo: \\"index__foo\\",
            animationName: \\"x1nrqb13\\",
            display: \\"x1c4r43l\\",
            marginStart: \\"x1n8p6zw\\",
            marginBlockStart: \\"x188knyk\\",
            height: \\"x1je5kxa\\",
            ':hover': {
              index__foo: \\"index__foo\\",
              background: \\"x1kflwvg\\"
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
