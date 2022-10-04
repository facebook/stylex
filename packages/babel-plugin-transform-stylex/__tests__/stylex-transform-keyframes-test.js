/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    },
    plugins: [[stylexPlugin, opts]],
  }).code;
}

describe('babel-plugin-transform-stylex', () => {
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(\\"@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}\\", 1);
        const name = \\"xbopttm-B\\";"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(\\"@keyframes x3zqmp-B{from{background-color:blue;}to{background-color:red;}}\\", 1);
        const name = \\"x3zqmp-B\\";
        stylex.inject(\\".x1qs41r0{animation:3s x3zqmp-B}\\", 1);"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(\\"@keyframes x1lvx8r0-B{from{left:0;}to{left:500px;}}\\", 1, \\"@keyframes x1lvx8r0-B{from{right:0;}to{right:500px;}}\\");
        const name = \\"x1lvx8r0-B\\";
        stylex.inject(\\".x1ugarde{animation-name:x1lvx8r0-B}\\", 1);
        export const styles = {
          root: {
            animationName: \\"x1ugarde\\"
          }
        };"
      `);
    });
  });
});
