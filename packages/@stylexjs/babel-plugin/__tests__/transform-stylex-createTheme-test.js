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
    filename: opts.filename,
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

/**
 * Fixture factory
 *
 * This is used to create a consistent fixture across all the tests for
 * different ways of importing StyleX. The fixture uses all of the
 * StyleX exports to make sure they are transformed as expected.
 */

function createFixture(fixture, { varsFilename, varsLiterals } = {}) {
  const createKey = (key) => (varsLiterals ? `'--${key}'` : key);
  // Generate defineVars output first.
  // This is inlined into the fixture so that createTheme works.
  const options = {
    filename: varsFilename || '/stylex/packages/vars.stylex.js',
  };
  const defineVarsOutput = transform(
    `
    import * as stylex from '@stylexjs/stylex';
    export const vars = stylex.defineVars({
      ${createKey('color')}: {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'lightblue',
        '@media print': 'white',
      },
      ${createKey('otherColor')}: {
        default: 'grey',
        '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
      },
      ${createKey('radius')}: 10
    });
  `,
    options,
  ).code;

  return `
    ${defineVarsOutput}
    ${fixture}
  `;
}

const themeObject = `{
  color: {
    default: 'green',
    '@media (prefers-color-scheme: dark)': 'lightgreen',
    '@media print': 'transparent',
  },
  otherColor: {
    default: 'antiquewhite',
    '@media (prefers-color-scheme: dark)': 'floralwhite',
  },
  radius: '6px'
}`;

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.createTheme()', () => {
    test('theme object', () => {
      const fixture = createFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        export const theme = {
          $$css: true,
          xop34xu: "x4aw18j xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x4aw18j",
              {
                "ltr": ".x4aw18j, .x4aw18j:root{--xwx8imx:green;--xaaua2w:antiquewhite;--xbbre8:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "x4aw18j-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.x4aw18j, .x4aw18j:root{--xwx8imx:lightgreen;--xaaua2w:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "x4aw18j-bdddrq",
              {
                "ltr": "@media print{.x4aw18j, .x4aw18j:root{--xwx8imx:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('theme object (haste)', () => {
      const options = {
        unstable_moduleResolution: { type: 'haste' },
      };
      const fixture = createFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);
      const { code, metadata } = transform(fixture, options);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        export const theme = {
          $$css: true,
          xop34xu: "x4aw18j xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x4aw18j",
              {
                "ltr": ".x4aw18j, .x4aw18j:root{--xwx8imx:green;--xaaua2w:antiquewhite;--xbbre8:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "x4aw18j-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.x4aw18j, .x4aw18j:root{--xwx8imx:lightgreen;--xaaua2w:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "x4aw18j-bdddrq",
              {
                "ltr": "@media print{.x4aw18j, .x4aw18j:root{--xwx8imx:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('theme object deep in file tree', () => {
      const options = {
        varsFilename: '/stylex/packages/src/css/vars.stylex.js',
      };
      const fixture = createFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);
      const { code, metadata } = transform(fixture, options);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        export const theme = {
          $$css: true,
          xop34xu: "x4aw18j xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x4aw18j",
              {
                "ltr": ".x4aw18j, .x4aw18j:root{--xwx8imx:green;--xaaua2w:antiquewhite;--xbbre8:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "x4aw18j-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.x4aw18j, .x4aw18j:root{--xwx8imx:lightgreen;--xaaua2w:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "x4aw18j-bdddrq",
              {
                "ltr": "@media print{.x4aw18j, .x4aw18j:root{--xwx8imx:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('literal tokens theme object', () => {
      const fixture = createFixture(
        `
        export const theme = stylex.createTheme(vars, {
          '--color': 'green',
          '--otherColor': 'purple',
          '--radius': 6
        });
      `,
        { varsLiterals: true },
      );

      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          "--color": "var(--color)",
          "--otherColor": "var(--otherColor)",
          "--radius": "var(--radius)",
          __themeName__: "xop34xu"
        };
        export const theme = {
          $$css: true,
          xop34xu: "x1l2ihi1 xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1l2ihi1",
              {
                "ltr": ".x1l2ihi1, .x1l2ihi1:root{--color:green;--otherColor:purple;--radius:6;}",
                "rtl": null,
              },
              0.5,
            ],
          ],
        }
      `);
    });

    test('local variable theme object', () => {
      const fixture = createFixture(`
        const themeObj = ${themeObject};
        export const theme = stylex.createTheme(vars, themeObj);
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        const themeObj = {
          color: {
            default: 'green',
            '@media (prefers-color-scheme: dark)': 'lightgreen',
            '@media print': 'transparent'
          },
          otherColor: {
            default: 'antiquewhite',
            '@media (prefers-color-scheme: dark)': 'floralwhite'
          },
          radius: '6px'
        };
        export const theme = {
          $$css: true,
          xop34xu: "x4aw18j xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x4aw18j",
              {
                "ltr": ".x4aw18j, .x4aw18j:root{--xwx8imx:green;--xaaua2w:antiquewhite;--xbbre8:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "x4aw18j-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.x4aw18j, .x4aw18j:root{--xwx8imx:lightgreen;--xaaua2w:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "x4aw18j-bdddrq",
              {
                "ltr": "@media print{.x4aw18j, .x4aw18j:root{--xwx8imx:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('local variables used in theme objects', () => {
      const fixture = createFixture(`
        const RADIUS = 10;
        export const theme = stylex.createTheme(vars, {
          radius: RADIUS
        });
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        const RADIUS = 10;
        export const theme = {
          $$css: true,
          xop34xu: "x1s6ff5p xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1s6ff5p",
              {
                "ltr": ".x1s6ff5p, .x1s6ff5p:root{--xbbre8:10;}",
                "rtl": null,
              },
              0.5,
            ],
          ],
        }
      `);
    });

    test('template literals used in theme objects', () => {
      const fixture = createFixture(`
        const name = 'light';
        export const theme = stylex.createTheme(vars, {
          color: \`\${name}green\`
        });
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        const name = 'light';
        export const theme = {
          $$css: true,
          xop34xu: "xp8mj21 xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xp8mj21",
              {
                "ltr": ".xp8mj21, .xp8mj21:root{--xwx8imx:lightgreen;}",
                "rtl": null,
              },
              0.5,
            ],
          ],
        }
      `);
    });

    test('expressions used in theme objects', () => {
      const fixture = createFixture(`
        const RADIUS = 10;
        export const theme = stylex.createTheme(vars, {
          radius: RADIUS * 2
        });
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        const RADIUS = 10;
        export const theme = {
          $$css: true,
          xop34xu: "x1et03wi xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1et03wi",
              {
                "ltr": ".x1et03wi, .x1et03wi:root{--xbbre8:20;}",
                "rtl": null,
              },
              0.5,
            ],
          ],
        }
      `);
    });

    test('stylex.types used in theme object', () => {
      const fixture = createFixture(`
       const RADIUS = 10;
        export const theme = stylex.createTheme(vars, {
          color: stylex.types.color({
            default: 'green',
            '@media (prefers-color-scheme: dark)': 'lightgreen',
            '@media print': 'transparent',
          }),
          otherColor: stylex.types.color({
            default: 'antiquewhite',
            '@media (prefers-color-scheme: dark)': 'floralwhite',
          }),
          radius: stylex.types.length({ default: RADIUS * 2 })
        });
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        const RADIUS = 10;
        export const theme = {
          $$css: true,
          xop34xu: "x5gq8ml xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x5gq8ml",
              {
                "ltr": ".x5gq8ml, .x5gq8ml:root{--xwx8imx:green;--xaaua2w:antiquewhite;--xbbre8:20px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "x5gq8ml-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.x5gq8ml, .x5gq8ml:root{--xwx8imx:lightgreen;--xaaua2w:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "x5gq8ml-bdddrq",
              {
                "ltr": "@media print{.x5gq8ml, .x5gq8ml:root{--xwx8imx:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('multiple theme objects (same vars)', () => {
      const fixture = createFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
        export const otherTheme = stylex.createTheme(vars, {
          color: 'skyblue',
          radius: '8px',
        });
      `);
      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        export const theme = {
          $$css: true,
          xop34xu: "x4aw18j xop34xu"
        };
        export const otherTheme = {
          $$css: true,
          xop34xu: "xw6msop xop34xu"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x4aw18j",
              {
                "ltr": ".x4aw18j, .x4aw18j:root{--xwx8imx:green;--xaaua2w:antiquewhite;--xbbre8:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "x4aw18j-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.x4aw18j, .x4aw18j:root{--xwx8imx:lightgreen;--xaaua2w:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "x4aw18j-bdddrq",
              {
                "ltr": "@media print{.x4aw18j, .x4aw18j:root{--xwx8imx:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "xw6msop",
              {
                "ltr": ".xw6msop, .xw6msop:root{--xwx8imx:skyblue;--xbbre8:8px;}",
                "rtl": null,
              },
              0.5,
            ],
          ],
        }
      `);
    });

    test('multiple theme objects (different vars)', () => {
      const fixture1 = createFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);
      const fixture2 = createFixture(
        `
        export const theme = stylex.createTheme(vars, ${themeObject});
      `,
        { varsFilename: '/stylex/packages/otherVars.stylex.js' },
      );

      const { code: code1, metadata: metadata1 } = transform(fixture1);
      const { code: code2, metadata: metadata2 } = transform(fixture2);

      expect(code1).not.toEqual(code2);
      expect(metadata1).not.toEqual(metadata2);
    });

    test('themes are indifferent to order of keys', () => {
      const fixture1 = createFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);

      const fixture2 = createFixture(`
        export const theme = stylex.createTheme(vars, {
          radius: '6px',
          otherColor: {
            default: 'antiquewhite',
            '@media (prefers-color-scheme: dark)': 'floralwhite',
          },
          color: {
            default: 'green',
            '@media (prefers-color-scheme: dark)': 'lightgreen',
            '@media print': 'transparent',
          }
        });
      `);

      const { code: code1, metadata: metadata1 } = transform(fixture1);
      const { code: code2, metadata: metadata2 } = transform(fixture2);

      expect(code1).toEqual(code2);
      expect(metadata1).toEqual(metadata2);
    });

    // TODO: Add debug data to compiled themes
    describe('options `debug:true`', () => {
      test('adds debug data', () => {
        const options = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
        };
        const fixture = createFixture(`
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `);
        const { code, metadata } = transform(fixture, options);

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--xwx8imx)",
            otherColor: "var(--xaaua2w)",
            radius: "var(--xbbre8)",
            __themeName__: "xop34xu"
          };
          export const theme = {
            $$css: true,
            xop34xu: "xowvtgn xop34xu"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xowvtgn",
                {
                  "ltr": ".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}",
                  "rtl": null,
                },
                0.5,
              ],
            ],
          }
        `);
      });

      test('adds debug data for npm packages', () => {
        const options = {
          debug: true,
          filename: '/js/node_modules/npm-package/dist/components/Foo.react.js',
        };
        const fixture = createFixture(`
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `);
        const { code, metadata } = transform(fixture, options);

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--xwx8imx)",
            otherColor: "var(--xaaua2w)",
            radius: "var(--xbbre8)",
            __themeName__: "xop34xu"
          };
          export const theme = {
            $$css: true,
            xop34xu: "xowvtgn xop34xu"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xowvtgn",
                {
                  "ltr": ".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}",
                  "rtl": null,
                },
                0.5,
              ],
            ],
          }
        `);
      });

      test('adds debug data (haste)', () => {
        const options = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };
        const fixture = createFixture(`
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `);
        const { code, metadata } = transform(fixture, options);

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--xwx8imx)",
            otherColor: "var(--xaaua2w)",
            radius: "var(--xbbre8)",
            __themeName__: "xop34xu"
          };
          export const theme = {
            $$css: true,
            xop34xu: "xowvtgn xop34xu"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xowvtgn",
                {
                  "ltr": ".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}",
                  "rtl": null,
                },
                0.5,
              ],
            ],
          }
        `);
      });

      test('adds debug data for npm packages (haste)', () => {
        const options = {
          debug: true,
          filename: '/node_modules/npm-package/dist/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };
        const fixture = createFixture(`
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `);
        const { code, metadata } = transform(fixture, options);

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--xwx8imx)",
            otherColor: "var(--xaaua2w)",
            radius: "var(--xbbre8)",
            __themeName__: "xop34xu"
          };
          export const theme = {
            $$css: true,
            xop34xu: "xowvtgn xop34xu"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xowvtgn",
                {
                  "ltr": ".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}",
                  "rtl": null,
                },
                0.5,
              ],
            ],
          }
        `);
      });
    });

    describe('options `dev:true`', () => {
      test('adds dev data', () => {
        const options = {
          dev: true,
          filename: '/html/js/components/Foo.react.js',
        };
        const fixture = createFixture(`
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `);
        const { code, metadata } = transform(fixture, options);

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--xwx8imx)",
            otherColor: "var(--xaaua2w)",
            radius: "var(--xbbre8)",
            __themeName__: "xop34xu"
          };
          export const theme = {
            Foo__theme: "Foo__theme",
            $$css: true,
            xop34xu: "xowvtgn xop34xu"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xowvtgn",
                {
                  "ltr": ".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}",
                  "rtl": null,
                },
                0.5,
              ],
            ],
          }
        `);
      });
    });

    describe('options `runtimeInjection:true`', () => {
      test('adds style injection', () => {
        const options = {
          filename: '/html/js/components/Foo.react.js',
          runtimeInjection: true,
        };
        const fixture = createFixture(`
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `);
        const { code, metadata } = transform(fixture, options);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          export const vars = {
            color: "var(--xwx8imx)",
            otherColor: "var(--xaaua2w)",
            radius: "var(--xbbre8)",
            __themeName__: "xop34xu"
          };
          _inject2(".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}", 0.5);
          export const theme = {
            $$css: true,
            xop34xu: "xowvtgn xop34xu"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xowvtgn",
                {
                  "ltr": ".xowvtgn, .xowvtgn:root{--xwx8imx:orange;}",
                  "rtl": null,
                },
                0.5,
              ],
            ],
          }
        `);
      });
    });
  });
});
