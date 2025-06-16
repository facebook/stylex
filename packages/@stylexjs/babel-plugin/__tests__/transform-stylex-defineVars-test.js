/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename || '/stylex/packages/vars.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: '/stylex/packages/',
            type: 'commonJS',
          },
          ...opts,
        },
      ],
    ],
  });
  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineVars()', () => {
    test('tokens as null', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: null,
          nextColor: {
            default: null
          },
          otherColor: {
            default: null,
            '@media (prefers-color-scheme: dark)': null,
            '@media print': null,
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          nextColor: "var(--xk6xtqk)",
          otherColor: "var(--xaaua2w)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [],
        }
      `);
    });

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
          color: "var(--xwx8imx)",
          nextColor: "var(--xk6xtqk)",
          otherColor: "var(--xaaua2w)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;--xk6xtqk:green;--xaaua2w:blue;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xop34xu{--xaaua2w:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .xop34xu{--xaaua2w:white;}}",
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
          color: "var(--xwx8imx)",
          nextColor: "var(--xk6xtqk)",
          otherColor: "var(--xaaua2w)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;--xk6xtqk:green;--xaaua2w:blue;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xop34xu{--xaaua2w:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .xop34xu{--xaaua2w:white;}}",
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
        filename: '/stylex/packages/src/css/vars.stylex.js',
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
          color: "var(--xt4ziaz)",
          __themeName__: "x1xohuxq"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1xohuxq",
              {
                "ltr": ":root, .x1xohuxq{--xt4ziaz:red;}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('tokens object with nested @-rules', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': {
              default: 'lightblue',
              '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
            }
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:blue;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xop34xu{--xwx8imx:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1e6ryz3",
              {
                "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xop34xu{--xwx8imx:oklab(0.7 -0.3 -0.4);}}}",
                "rtl": null,
              },
              0.2,
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
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--color:red;--otherColor:blue;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1tdxo4z",
              {
                "ltr": ":hover{:root, .xop34xu{--otherColor:lightblue;}}",
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
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--color:red;--nextColor:green;--otherColor:blue;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xop34xu{--otherColor:lightblue;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .xop34xu{--otherColor:white;}}",
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
          color: "var(--xwx8imx)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;}",
                "rtl": null,
              },
              0.1,
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
          size: "var(--xu6xznv)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xu6xznv:10rem;}",
                "rtl": null,
              },
              0.1,
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
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xbbre8:20;}",
                "rtl": null,
              },
              0.1,
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
          color: "var(--xwx8imx)",
          __themeName__: "xop34xu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xwx8imx",
              {
                "ltr": "@property --xwx8imx { syntax: "<color>"; inherits: true; initial-value: red }",
                "rtl": null,
              },
              0,
            ],
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .xop34xu{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .xop34xu{--xwx8imx:black;}}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('multiple variables objects (same file)', () => {
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
          color: "var(--xwx8imx)",
          __themeName__: "xop34xu"
        };
        export const otherVars = {
          otherColor: "var(--xnjepv0)",
          __themeName__: "x1pfrffu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "x1pfrffu",
              {
                "ltr": ":root, .x1pfrffu{--xnjepv0:orange;}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('multiple variables objects (dependency)', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red'
        });
        export const otherVars = stylex.defineVars({
          otherColor: vars.color
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          __themeName__: "xop34xu"
        };
        export const otherVars = {
          otherColor: "var(--xnjepv0)",
          __themeName__: "x1pfrffu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "x1pfrffu",
              {
                "ltr": ":root, .x1pfrffu{--xnjepv0:var(--xwx8imx);}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    test('multiple variables objects (different files)', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red'
        });
      `);

      const { code: code2, metadata: metadata2 } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const otherVars = stylex.defineVars({
          otherColor: 'orange'
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          __themeName__: "xop34xu"
        };"
      `);
      expect(code2).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const otherVars = {
          otherColor: "var(--xnjepv0)",
          __themeName__: "x1pfrffu"
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .xop34xu{--xwx8imx:red;}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
      expect(metadata2).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1pfrffu",
              {
                "ltr": ":root, .x1pfrffu{--xnjepv0:orange;}",
                "rtl": null,
              },
              0.1,
            ],
          ],
        }
      `);
    });

    describe('options `debug:true`', () => {
      test('tokens object includes debug data', () => {
        const options = { debug: true };
        const { code, metadata } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            color: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': {
                default: 'lightblue',
                '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
              }
            },
            otherColor: 'green'
          });
        `,
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--color-xwx8imx)",
            otherColor: "var(--otherColor-xaaua2w)",
            __themeName__: "xop34xu"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .xop34xu{--color-xwx8imx:blue;--otherColor-xaaua2w:green;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .xop34xu{--color-xwx8imx:lightblue;}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1e6ryz3",
                {
                  "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xop34xu{--color-xwx8imx:oklab(0.7 -0.3 -0.4);}}}",
                  "rtl": null,
                },
                0.2,
              ],
            ],
          }
        `);
      });

      test('tokens object includes debug data (keys with special characters)', () => {
        const options = { debug: true };
        const { code, metadata } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
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
            "10": "var(--_10-x187fpdw)",
            "1.5 pixels": "var(--_1_5_pixels-x15ahj5d)",
            "corner#radius": "var(--corner_radius-x2ajqv2)",
            "@@primary": "var(--__primary-x13tvx0f)",
            __themeName__: "xop34xu"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .xop34xu{--_10-x187fpdw:green;--_1_5_pixels-x15ahj5d:blue;--corner_radius-x2ajqv2:purple;--__primary-x13tvx0f:pink;}",
                  "rtl": null,
                },
                0.1,
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
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--color-xwx8imx)",
            nextColor: "var(--nextColor-xk6xtqk)",
            otherColor: "var(--otherColor-xaaua2w)",
            __themeName__: "xop34xu"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .xop34xu{--color-xwx8imx:red;--nextColor-xk6xtqk:green;--otherColor-xaaua2w:blue;}",
                  "rtl": null,
                },
                0.1,
              ],
            ],
          }
        `);
      });
    });

    describe('options `runtimeInjection:true`', () => {
      test('tokens object', () => {
        const options = { runtimeInjection: true };
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
          _inject2(":root, .xop34xu{--xwx8imx:red;--xk6xtqk:green;--xaaua2w:blue;}", 0.1);
          export const vars = {
            color: "var(--xwx8imx)",
            nextColor: "var(--xk6xtqk)",
            otherColor: "var(--xaaua2w)",
            __themeName__: "xop34xu"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .xop34xu{--xwx8imx:red;--xk6xtqk:green;--xaaua2w:blue;}",
                  "rtl": null,
                },
                0.1,
              ],
            ],
          }
        `);
      });
    });

    describe('options `themeFileExtension`', () => {
      test('processes tokens in files with configured extension', () => {
        const options = {
          debug: true,
          filename: '/stylex/packages/src/vars/default.cssvars.js',
          unstable_moduleResolution: {
            rootDir: '/stylex/packages/',
            themeFileExtension: 'cssvars',
            type: 'commonJS',
          },
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
            color: "var(--color-x1lzcbr1)",
            __themeName__: "x1bxutiz"
          };"
        `);

        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "x1bxutiz",
                {
                  "ltr": ":root, .x1bxutiz{--color-x1lzcbr1:red;}",
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
});
