/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, { runtimeInjection: true, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] CSS keyframes', () => {
    test('converts keyframes to CSS', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes({
            from: {
              backgroundColor: 'red',
            },

            to: {
              backgroundColor: 'blue',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject("@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}", 1);
        const name = "xbopttm-B";"
      `);
    });

    test('converts keyframes to CSS with import *', () => {
      expect(
        transform(`
          import * as stylex from 'stylex';
          const name = stylex.keyframes({
            from: {
              backgroundColor: 'red',
            },

            to: {
              backgroundColor: 'blue',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import * as stylex from 'stylex';
        stylex.inject("@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}", 1);
        const name = "xbopttm-B";"
      `);
    });

    test('converts keyframes to CSS with named import', () => {
      expect(
        transform(`
          import { keyframes } from 'stylex';
          const name = keyframes({
            from: {
              backgroundColor: 'red',
            },

            to: {
              backgroundColor: 'blue',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import { keyframes } from 'stylex';
        import __stylex__ from "stylex";
        __stylex__.inject("@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}", 1);
        const name = "xbopttm-B";"
      `);
    });

    test('allows template literal references to keyframes', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes({
            from: {
              backgroundColor: 'blue',
            },
            to: {
              backgroundColor: 'red',
            },
          });

          const styles = stylex.create({
            default: {
              animation: \`3s \${name}\`,
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject("@keyframes x3zqmp-B{from{background-color:blue;}to{background-color:red;}}", 1);
        const name = "x3zqmp-B";
        stylex.inject(".x1qs41r0{animation:3s x3zqmp-B}", 1000);"
      `);
    });

    test('allows inline references to keyframes', () => {
      expect(
        transform(`
          import stylex from 'stylex';

          const styles = stylex.create({
            default: {
              animationName: stylex.keyframes({
                from: {
                  backgroundColor: 'blue',
                },
                to: {
                  backgroundColor: 'red',
                },
              }),
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject("@keyframes x3zqmp-B{from{background-color:blue;}to{background-color:red;}}", 1);
        stylex.inject(".xcoz2pf{animation-name:x3zqmp-B}", 3000);"
      `);
    });

    test('generates RTL-specific keyframes', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes({
            from: {
              start: 0,
            },

            to: {
              start: 500,
            },
          });

          export const styles = stylex.create({
            root: {
              animationName: name,
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject("@keyframes x1jkcf39-B{from{inset-inline-start:0;}to{inset-inline-start:500px;}}", 1);
        const name = "x1jkcf39-B";
        stylex.inject(".x1vfi257{animation-name:x1jkcf39-B}", 3000);
        export const styles = {
          root: {
            animationName: "x1vfi257",
            $$css: true
          }
        };"
      `);
    });
  });
});
