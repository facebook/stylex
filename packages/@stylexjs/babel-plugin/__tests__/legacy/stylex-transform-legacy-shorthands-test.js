/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../../src/index');
const jsx = require('@babel/plugin-syntax-jsx');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    },
    plugins: [
      jsx,
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          styleResolution: 'legacy-expand-shorthands',
          enableLogicalStylesPolyfill: true,
          ...opts,
        },
      ],
    ],
  }).code;
}

describe('Legacy-shorthand-expansion resolution', () => {
  describe('while using RN non-standard shorthands', () => {
    test('stylex call with exported short-form properties', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              padding: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".x1gabggj{padding-right:5px}", 3000, ".x1gabggj{padding-left:5px}");
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        export const styles = {
          foo: {
            kLKAdn: "x123j3cw",
            kwRFfy: "x1gabggj",
            kGO01o: "xs9asl8",
            kZCmMZ: "xaso8d8",
            $$css: true
          }
        };
        "x123j3cw x1gabggj xs9asl8 xaso8d8";"
      `);
    });
    test('stylex call with short-form property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingEnd: 10,
            },

            bar: {
              padding: 2,
              paddingStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".xe2zdcy{padding-left:10px}", 3000, ".xe2zdcy{padding-right:10px}");
        "x1nn3v0j x14vy60q x1120s5i xe2zdcy";"
      `);
    });
    test('stylex call with short-form property collisions with null', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingEnd: 10,
            },

            bar: {
              padding: 2,
              paddingStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        "x1nn3v0j x14vy60q x1120s5i";"
      `);
    });
  });
  describe('while using standard logical properties', () => {
    test('stylex call with exported short-form properties', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              paddingInline: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x1gabggj{padding-right:5px}", 3000, ".x1gabggj{padding-left:5px}");
        export const styles = {
          foo: {
            kZCmMZ: "xaso8d8",
            kwRFfy: "x1gabggj",
            kE3dHu: null,
            kpe85a: null,
            $$css: true
          }
        };
        "xaso8d8 x1gabggj";"
      `);
    });
    test('stylex call with short-form property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".xe2zdcy{padding-left:10px}", 3000, ".xe2zdcy{padding-right:10px}");
        "x1nn3v0j x14vy60q x1120s5i xe2zdcy";"
      `);
    });
    test('stylex call with short-form property collisions with null', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        "x1nn3v0j x14vy60q x1120s5i";"
      `);
    });
  });
});
