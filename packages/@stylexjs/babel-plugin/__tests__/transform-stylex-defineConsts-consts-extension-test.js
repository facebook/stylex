/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transform } from '@babel/core';
import stylexPlugin from '../src/index.js';

function transformWithConstsExtension(source, opts = {}) {
  const options = {
    filename: '/stylex/packages/src/consts/colors.stylex.consts.js',
    unstable_moduleResolution: {
      rootDir: '/stylex/packages/',
      type: 'commonJS',
    },
    enableConstsOnlyExtension: true,
    ...opts,
  };

  return transform(source, {
    plugins: [[stylexPlugin, options]],
    filename: options.filename,
  });
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineConsts() with consts extension', () => {
    test('processes defineConsts in files with .stylex.consts.js extension', () => {
      const { code, metadata } = transformWithConstsExtension(`
        import * as stylex from '@stylexjs/stylex';
        export const colors = stylex.defineConsts({
          primary: 'red',
          secondary: 'blue'
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const colors = {
          primary: "var(--primary-x1lzcbr1)",
          secondary: "var(--secondary-x1lzcbr2)",
          __constGroupHash__: "x1bxutiz"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1bxutiz",
              {
                "ltr": ":root, .x1bxutiz{--primary-x1lzcbr1:red;--secondary-x1lzcbr2:blue;}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('does not process defineConsts in regular .stylex.js files when enableConstsOnlyExtension is true', () => {
      const options = {
        filename: '/stylex/packages/src/consts/colors.stylex.js',
        unstable_moduleResolution: {
          rootDir: '/stylex/packages/',
          type: 'commonJS',
        },
        enableConstsOnlyExtension: true,
      };

      const { code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const colors = stylex.defineConsts({
          primary: 'red'
        });
      `,
        {
          plugins: [[stylexPlugin, options]],
          filename: options.filename,
        },
      );

      // Should not transform when enableConstsOnlyExtension is true and file doesn't have .stylex.consts.js extension
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const colors = stylex.defineConsts({
          primary: 'red'
        });"
      `);

      expect(metadata).toMatchInlineSnapshot('{}');
    });

    test('processes defineConsts in regular .stylex.js files when enableConstsOnlyExtension is false', () => {
      const options = {
        filename: '/stylex/packages/src/consts/colors.stylex.js',
        unstable_moduleResolution: {
          rootDir: '/stylex/packages/',
          type: 'commonJS',
        },
        enableConstsOnlyExtension: false,
      };

      const { code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const colors = stylex.defineConsts({
          primary: 'red'
        });
      `,
        {
          plugins: [[stylexPlugin, options]],
          filename: options.filename,
        },
      );

      // Should transform normally when enableConstsOnlyExtension is false
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const colors = {
          primary: "var(--primary-x1lzcbr1)",
          __constGroupHash__: "x1bxutiz"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1bxutiz",
              {
                "ltr": ":root, .x1bxutiz{--primary-x1lzcbr1:red;}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });
  });
});
