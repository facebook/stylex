/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const rollup = require('rollup');
const { createBabelInputPluginFactory } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const stylexPlugin = require('../src/index');

const stylex = stylexPlugin({ fileName: 'stylex.css' });

describe('rollup-plugin-stylex', () => {
  it('extracts CSS and removes stylex.inject calls', async () => {
    // Configure a rollup bundle
    const bundle = await rollup.rollup({
      // Remove stylex runtime from bundle
      external: ['stylex'],
      input: path.resolve(__dirname, '__fixtures__/index.js'),
      plugins: [
        nodeResolve(),
        commonjs(),
        createBabelInputPluginFactory(stylex.babelHook)({
          babelHelpers: 'bundled',
        }),
        stylex,
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
      "import stylex from 'stylex';

      // otherStyles.js
      stylex.inject(\\".b6ax4al1{display:block}\\", 1);
      stylex.inject(\\".mfclru0v{width:100%}\\", 1);
      const styles$2 = {
        bar: {
          display: \\"b6ax4al1\\",
          width: \\"mfclru0v\\"
        }
      };

      // npmStyles.js
      stylex.inject('.rse6dlih{display:inline}', 1);
      stylex.inject('.ezi3dscr{width:50%}', 1);
      const styles$1 = {
        baz: {
          display: 'rse6dlih',
          width: 'ezi3dscr'
        }
      };

      // index.js
      stylex.inject(\\".alzwoclg{display:flex}\\", 1);
      stylex.inject(\\".a60616oh{margin-left:10px}\\", 1, \\".a60616oh{margin-right:10px}\\");
      stylex.inject(\\".h9hgjgce{margin-block-start:99px}\\", 1);
      stylex.inject(\\".mjo95iq7{height:500px}\\", 1);
      stylex.inject(\\".ew9r2zzs:hover{background:red}\\", 7.1);
      const styles = {
        foo: {
          display: \\"alzwoclg\\",
          marginStart: \\"a60616oh\\",
          marginBlockStart: \\"h9hgjgce\\",
          height: \\"mjo95iq7\\",
          ':hover': {
            background: \\"ew9r2zzs\\"
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
