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

const defaultOpts = {
  debug: false,
  unstable_moduleResolution: {
    rootDir: '/stylex/packages/',
    type: 'commonJS',
  },
};

function transform(source, opts = defaultOpts) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [[stylexPlugin, { ...defaultOpts, ...opts }]],
  });
  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineVars()', () => {
    test('tokens object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red',
          nextColor: {
            default: 'green'
          },
          otherColor: {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
            '@media print': 'white',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xjrzwe6)",
          nextColor: "var(--x1ybzi8d)",
          otherColor: "var(--x1o4mfbm)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--xjrzwe6:red;--x1ybzi8d:green;--x1o4mfbm:blue;}",
                "rtl": null,
              },
              0,
            ],
            [
              "xm1nzai-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xm1nzai{--x1o4mfbm:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xm1nzai-bdddrq",
              {
                "ltr": "@media print{:root, .xm1nzai{--x1o4mfbm:white;}}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('tokens object (haste)', () => {
      const options = {
        unstable_moduleResolution: { type: 'haste' },
      };

      const { code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red',
          nextColor: {
            default: 'green'
          },
          otherColor: {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
            '@media print': 'white',
          },
        });
      `,
        options,
      );

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xjrzwe6)",
          nextColor: "var(--x1ybzi8d)",
          otherColor: "var(--x1o4mfbm)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--xjrzwe6:red;--x1ybzi8d:green;--x1o4mfbm:blue;}",
                "rtl": null,
              },
              0,
            ],
            [
              "xm1nzai-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xm1nzai{--x1o4mfbm:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xm1nzai-bdddrq",
              {
                "ltr": "@media print{:root, .xm1nzai{--x1o4mfbm:white;}}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('tokens object deep in file tree', () => {
      const options = {
        filename: '/stylex/packages/src/css/NestedTheme.stylex.js',
      };
      const { code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red'
        });
      `,
        options,
      );

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xg2rpke)",
          __themeName__: "xc81hgp"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xc81hgp",
              {
                "ltr": ":root, .xc81hgp{--xg2rpke:red;}",
                "rtl": null,
              },
              0,
            ],
          ],
        }
      `);
    });

    test('literal tokens object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          '--color': 'red',
          '--otherColor': {
            default: 'blue',
            ':hover': 'lightblue',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          "--color": "var(--color)",
          "--otherColor": "var(--otherColor)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--color:red;--otherColor:blue;}",
                "rtl": null,
              },
              0,
            ],
            [
              "xm1nzai-1tdxo4z",
              {
                "ltr": ":hover{:root, .xm1nzai{--otherColor:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('local variable tokens object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const tokens = {
          '--color': 'red',
          '--nextColor': {
            default: 'green'
          },
          '--otherColor': {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
            '@media print': 'white',
          },
        };
        export const vars = stylex.defineVars(tokens)
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const tokens = {
          '--color': 'red',
          '--nextColor': {
            default: 'green'
          },
          '--otherColor': {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
            '@media print': 'white'
          }
        };
        export const vars = {
          "--color": "var(--color)",
          "--nextColor": "var(--nextColor)",
          "--otherColor": "var(--otherColor)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--color:red;--nextColor:green;--otherColor:blue;}",
                "rtl": null,
              },
              0,
            ],
            [
              "xm1nzai-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xm1nzai{--otherColor:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xm1nzai-bdddrq",
              {
                "ltr": "@media print{:root, .xm1nzai{--otherColor:white;}}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('local variables used in tokens objects', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const COLOR = 'red';
        export const vars = stylex.defineVars({
          color: COLOR
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const COLOR = 'red';
        export const vars = {
          color: "var(--xjrzwe6)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--xjrzwe6:red;}",
                "rtl": null,
              },
              0,
            ],
          ],
        }
      `);
    });

    test('template literals used in tokens objects', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const NUMBER = 10;
        export const vars = stylex.defineVars({
          size: \`\${NUMBER}rem\`
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const NUMBER = 10;
        export const vars = {
          size: "var(--x7bt6xx)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--x7bt6xx:10rem;}",
                "rtl": null,
              },
              0,
            ],
          ],
        }
      `);
    });

    test('expressions used in tokens objects', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const NUMBER = 10;
        export const vars = stylex.defineVars({
          radius: NUMBER * 2
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const NUMBER = 10;
        export const vars = {
          radius: "var(--x1cazb2m)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--x1cazb2m:20;}",
                "rtl": null,
              },
              0,
            ],
          ],
        }
      `);
    });

    test('stylex.types used in tokens object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: stylex.types.color({
            default: 'red',
            '@media (prefers-color-scheme: dark)': 'white',
            '@media print': 'black',
          })
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xjrzwe6)",
          __themeName__: "xm1nzai"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xjrzwe6",
              {
                "ltr": "@property --xjrzwe6 { syntax: "<color>"; inherits: true; initial-value: red }",
                "rtl": null,
              },
              0,
            ],
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--xjrzwe6:red;}",
                "rtl": null,
              },
              0,
            ],
            [
              "xm1nzai-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xm1nzai{--xjrzwe6:white;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xm1nzai-bdddrq",
              {
                "ltr": "@media print{:root, .xm1nzai{--xjrzwe6:black;}}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('multiple variables objects', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red'
        });
        export const otherVars = stylex.defineVars({
          otherColor: 'orange'
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xjrzwe6)",
          __themeName__: "xm1nzai"
        };
        export const otherVars = {
          otherColor: "var(--x162zdew)",
          __themeName__: "xc6dbti"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xm1nzai",
              {
                "ltr": ":root, .xm1nzai{--xjrzwe6:red;}",
                "rtl": null,
              },
              0,
            ],
            [
              "xc6dbti",
              {
                "ltr": ":root, .xc6dbti{--x162zdew:orange;}",
                "rtl": null,
              },
              0,
            ],
          ],
        }
      `);
    });

    describe('options `debug:true`', () => {
      test('tokens object, including keys with special characters', () => {
        const options = { debug: true };
        const { code, metadata } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            color: 'red',
            '10': 'green',
            '1.5 pixels': 'blue',
            'corner#radius': 'purple',
            '@@primary': 'pink'
          });
        `,
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            "10": "var(--_10-x1iss122)",
            color: "var(--color-xjrzwe6)",
            "1.5 pixels": "var(--_1_5_pixels-x18nvhj0)",
            "corner#radius": "var(--corner_radius-x1rt8ac5)",
            "@@primary": "var(--__primary-xxp23oy)",
            __themeName__: "xm1nzai"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xm1nzai",
                {
                  "ltr": ":root, .xm1nzai{--_10-x1iss122:green;--color-xjrzwe6:red;--_1_5_pixels-x18nvhj0:blue;--corner_radius-x1rt8ac5:purple;--__primary-xxp23oy:pink;}",
                  "rtl": null,
                },
                0,
              ],
            ],
          }
        `);
      });
    });

    describe('options `dev:true`', () => {
      test('tokens object', () => {
        const options = { dev: true };
        const { code, metadata } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            color: 'red',
            nextColor: 'green',
            otherColor: 'blue'
          });
        `,
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(":root, .xm1nzai{--xjrzwe6:red;--x1ybzi8d:green;--x1o4mfbm:blue;}", 0);
          export const vars = {
            color: "var(--xjrzwe6)",
            nextColor: "var(--x1ybzi8d)",
            otherColor: "var(--x1o4mfbm)",
            __themeName__: "xm1nzai"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xm1nzai",
                {
                  "ltr": ":root, .xm1nzai{--xjrzwe6:red;--x1ybzi8d:green;--x1o4mfbm:blue;}",
                  "rtl": null,
                },
                0,
              ],
            ],
          }
        `);
      });
    });
  });
});
