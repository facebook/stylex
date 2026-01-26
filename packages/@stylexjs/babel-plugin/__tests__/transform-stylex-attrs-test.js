/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-syntax-jsx';
import stylexPlugin from '../src/index';
import path from 'path';

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      sourceType: 'module',
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      jsx,
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: path.parse(process.cwd()).root,
            type: 'commonJS',
          },
          ...opts,
          runtimeInjection: true,
        },
      ],
    ],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.attrs() call', () => {
    test('empty stylex.attrs call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          stylex.attrs();
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        ({});"
      `);
    });

    test('basic stylex attrs call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex.attrs(styles.red);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1e2nbdu{color:red}",
          priority: 3000
        });
        ({
          class: "x1e2nbdu"
        });"
      `);
    });

    test('attrs call within jsx spread', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          function Foo() {
            return <div {...stylex.attrs(styles.red)} />;
          }
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1e2nbdu{color:red}",
          priority: 3000
        });
        function Foo() {
          return <div class="x1e2nbdu" />;
        }"
      `);
    });
  });
});
