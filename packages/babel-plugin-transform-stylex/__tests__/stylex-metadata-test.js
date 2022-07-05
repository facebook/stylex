/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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
    plugins: [stylexPlugin, opts],
  });
}

describe('babel-plugin-transform-stylex', () => {
  describe('[metadata] plugin metadata', () => {
    test('stylex metadata is correctly set', () => {
      const output = transform(`
        const styles = stylex.create({
          foo: {
            color: 'red',
            height: 5,
            ':hover': {
              start: 10,
            },
            '@media (min-width: 1000px)': {
              end: 5
            }
          },
        });

        const name = stylex.keyframes({
          from: {
            start: 0,
          },
          to: {
            start: 100,
          }
        });
      `);

      expect(output.metadata).toMatchInlineSnapshot(`
        Object {
          "stylex": Array [
            Array [
              "x1e2nbdu",
              Object {
                "ltr": ".x1e2nbdu{color:red}",
                "rtl": null,
              },
              1,
            ],
            Array [
              "x1ycjhwn",
              Object {
                "ltr": ".x1ycjhwn{height:5px}",
                "rtl": null,
              },
              1,
            ],
            Array [
              "x15uk0yd",
              Object {
                "ltr": ".x15uk0yd:hover{left:10px}",
                "rtl": ".x15uk0yd:hover{right:10px}",
              },
              8,
            ],
            Array [
              "x10tbbcl",
              Object {
                "ltr": "@media (min-width: 1000px){.x10tbbcl.x10tbbcl{right:5px}}",
                "rtl": "@media (min-width: 1000px){.x10tbbcl.x10tbbcl{left:5px}}",
              },
              2,
            ],
            Array [
              "x18kvd1d-B",
              Object {
                "ltr": "@keyframes x18kvd1d-B{from{left:0;}to{left:100px;}}",
                "rtl": "@keyframes x18kvd1d-B{from{right:0;}to{right:100px;}}",
              },
              1,
            ],
          ],
        }
      `);
    });
  });
});
