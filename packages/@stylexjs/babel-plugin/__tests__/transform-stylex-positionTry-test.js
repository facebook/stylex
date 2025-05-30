/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const stylexPlugin = require('../src/index');
const { transformSync } = require('@babel/core');

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, { ...opts }]],
  });

  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.positionTry', () => {
    test('positionTry object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const name = stylex.positionTry({
          positionAnchor: '--anchor',
          top: '0',
          left: '0',
          width: '100px',
          height: '100px'
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const name = "--xhs37kq";"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "--xhs37kq",
              {
                "ltr": "@position-try --xhs37kq {height:height;height:100px;left:left;left:0;position-anchor:position-anchor;position-anchor:--anchor;top:top;top:0;width:width;width:100px;}",
                "rtl": "@position-try --xhs37kq {height:100px;left:0;position-anchor:--anchor;top:0;width:100px;}",
              },
              0,
            ],
          ],
        }
      `);
    });

    test('local constants used in positionTry object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const SIZE = '100px';
        export const name = stylex.positionTry({
          positionAnchor: '--anchor',
          top: '0',
          left: '0',
          width: SIZE,
          height: SIZE
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const SIZE = '100px';
        export const name = "--xhs37kq";"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "--xhs37kq",
              {
                "ltr": "@position-try --xhs37kq {height:height;height:100px;left:left;left:0;position-anchor:position-anchor;position-anchor:--anchor;top:top;top:0;width:width;width:100px;}",
                "rtl": "@position-try --xhs37kq {height:100px;left:0;position-anchor:--anchor;top:0;width:100px;}",
              },
              0,
            ],
          ],
        }
      `);
    });

    test('positionTry value used within create', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const SIZE = '100px';
        const name = stylex.positionTry({
          top: '0',
          left: '0',
          width: SIZE,
          height: SIZE
        });
        export const styles = stylex.create({
          root: {
            positionTryFallbacks: name,
          }
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const SIZE = '100px';
        const name = "--x1oyda6q";
        export const styles = {
          root: {
            k9M3vk: "x4uh2cz",
            $$css: true
          }
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "--x1oyda6q",
              {
                "ltr": "@position-try --x1oyda6q {height:height;height:100px;left:left;left:0;top:top;top:0;width:width;width:100px;}",
                "rtl": "@position-try --x1oyda6q {height:100px;left:0;top:0;width:100px;}",
              },
              0,
            ],
            [
              "x4uh2cz",
              {
                "ltr": ".x4uh2cz{position-try-fallbacks:--x1oyda6q}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('positionTry object used inline', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({
          root: {
            positionTryFallbacks: stylex.positionTry({
              positionAnchor: '--anchor',
              top: '0',
              left: '0',
              width: '100px',
              height: '100px'
            }),
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const styles = {
          root: {
            k9M3vk: "xlj2pck",
            $$css: true
          }
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "--xhs37kq",
              {
                "ltr": "@position-try --xhs37kq {height:height;height:100px;left:left;left:0;position-anchor:position-anchor;position-anchor:--anchor;top:top;top:0;width:width;width:100px;}",
                "rtl": "@position-try --xhs37kq {height:100px;left:0;position-anchor:--anchor;top:0;width:100px;}",
              },
              0,
            ],
            [
              "xlj2pck",
              {
                "ltr": ".xlj2pck{position-try-fallbacks:--xhs37kq}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });
  });
});
