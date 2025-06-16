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

function transformWithFixture(fixture, fixtureOptions, pluginOptions) {
  const { varsFilename, varsLiterals } = fixtureOptions || {};

  // Generate defineVars output first.
  // This is inlined into the fixture so that createTheme works.
  const createKey = (key) => (varsLiterals ? `'--${key}'` : key);
  const fixtureTransformOptions = {
    filename: varsFilename || '/stylex/packages/vars.stylex.js',
  };
  const { code: _code, metadata: _metadata } = transform(
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
    fixtureTransformOptions,
  );

  // Generate the final transform
  const { code, metadata } = transform(
    `
    ${_code}
    ${fixture}
  `,
    pluginOptions,
  );

  _metadata.stylex.push(...metadata.stylex);

  return { code, metadata: _metadata };
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
      const { code, metadata } = transformWithFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);

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
          xop34xu: "x4aw18j",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const pluginOptions = {
        unstable_moduleResolution: { type: 'haste' },
      };
      const { code, metadata } = transformWithFixture(
        `
        export const theme = stylex.createTheme(vars, ${themeObject});
      `,
        null,
        pluginOptions,
      );

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
          xop34xu: "x4aw18j",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const fixtureOptions = {
        varsFilename: '/stylex/packages/src/css/vars.stylex.js',
      };
      const { code, metadata } = transformWithFixture(
        `
        export const theme = stylex.createTheme(vars, ${themeObject});
      `,
        fixtureOptions,
      );

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xt4ziaz)",
          otherColor: "var(--x1e3it8h)",
          radius: "var(--x1onrunl)",
          __themeName__: "x1xohuxq"
        };
        export const theme = {
          $$css: true,
          x1xohuxq: "xv0nx9o",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1xohuxq",
              {
                "ltr": ":root, .stylexvars{--xt4ziaz:blue;--x1e3it8h:grey;--x1onrunl:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "x1xohuxq-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xt4ziaz:lightblue;--x1e3it8h:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "x1xohuxq-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xt4ziaz:white;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xv0nx9o",
              {
                "ltr": ".xv0nx9o, .xv0nx9o:root{--xt4ziaz:green;--x1e3it8h:antiquewhite;--x1onrunl:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "xv0nx9o-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.xv0nx9o, .xv0nx9o:root{--xt4ziaz:lightgreen;--x1e3it8h:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "xv0nx9o-bdddrq",
              {
                "ltr": "@media print{.xv0nx9o, .xv0nx9o:root{--xt4ziaz:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('literal tokens theme object', () => {
      const fixtureOptions = { varsLiterals: true };

      const { code, metadata } = transformWithFixture(
        `
        export const theme = stylex.createTheme(vars, {
          '--color': 'green',
          '--otherColor': 'purple',
          '--radius': 6
        });
      `,
        fixtureOptions,
      );

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
          xop34xu: "x1l2ihi1",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--color:blue;--otherColor:grey;--radius:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--color:lightblue;--otherColor:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--color:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code, metadata } = transformWithFixture(`
        const themeObj = ${themeObject};
        export const theme = stylex.createTheme(vars, themeObj);
      `);

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
          xop34xu: "x4aw18j",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code, metadata } = transformWithFixture(`
        const RADIUS = 10;
        export const theme = stylex.createTheme(vars, {
          radius: RADIUS
        });
      `);

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
          xop34xu: "x1s6ff5p",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code, metadata } = transformWithFixture(`
        const name = 'light';
        export const theme = stylex.createTheme(vars, {
          color: \`\${name}green\`
        });
      `);

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
          xop34xu: "xp8mj21",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code, metadata } = transformWithFixture(`
        const RADIUS = 10;
        export const theme = stylex.createTheme(vars, {
          radius: RADIUS * 2
        });
      `);

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
          xop34xu: "x1et03wi",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code, metadata } = transformWithFixture(`
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
          xop34xu: "x5gq8ml",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code, metadata } = transformWithFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
        export const otherTheme = stylex.createTheme(vars, {
          color: 'skyblue',
          radius: '8px',
        });
      `);

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
          xop34xu: "x4aw18j",
          __rootVars__: "stylexvars"
        };
        export const otherTheme = {
          $$css: true,
          xop34xu: "xw6msop",
          __rootVars__: "stylexvars"
        };"
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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
      const { code: code1, metadata: metadata1 } = transformWithFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);
      const { code: code2, metadata: metadata2 } = transformWithFixture(
        `
        export const theme = stylex.createTheme(vars, ${themeObject});
      `,
        { varsFilename: '/stylex/packages/otherVars.stylex.js' },
      );

      expect(code1).not.toEqual(code2);
      expect(metadata1).not.toEqual(metadata2);

      expect(code1).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--xwx8imx)",
          otherColor: "var(--xaaua2w)",
          radius: "var(--xbbre8)",
          __themeName__: "xop34xu"
        };
        export const theme = {
          $$css: true,
          xop34xu: "x4aw18j",
          __rootVars__: "stylexvars"
        };"
      `);

      expect(code2).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: "var(--x103gslp)",
          otherColor: "var(--x1e7put6)",
          radius: "var(--xm3n3tg)",
          __themeName__: "x1ngxneg"
        };
        export const theme = {
          $$css: true,
          x1ngxneg: "xgl5cw9",
          __rootVars__: "stylexvars"
        };"
      `);

      expect(metadata1).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xop34xu",
              {
                "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xop34xu-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                "rtl": null,
              },
              0.1,
            ],
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

      expect(metadata2).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1ngxneg",
              {
                "ltr": ":root, .stylexvars{--x103gslp:blue;--x1e7put6:grey;--xm3n3tg:10;}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "x1ngxneg-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--x103gslp:lightblue;--x1e7put6:rgba(0, 0, 0, 0.8);}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "x1ngxneg-bdddrq",
              {
                "ltr": "@media print{:root, .stylexvars{--x103gslp:white;}}",
                "rtl": null,
              },
              0.1,
            ],
            [
              "xgl5cw9",
              {
                "ltr": ".xgl5cw9, .xgl5cw9:root{--x103gslp:green;--x1e7put6:antiquewhite;--xm3n3tg:6px;}",
                "rtl": null,
              },
              0.5,
            ],
            [
              "xgl5cw9-1lveb7",
              {
                "ltr": "@media (prefers-color-scheme: dark){.xgl5cw9, .xgl5cw9:root{--x103gslp:lightgreen;--x1e7put6:floralwhite;}}",
                "rtl": null,
              },
              0.6,
            ],
            [
              "xgl5cw9-bdddrq",
              {
                "ltr": "@media print{.xgl5cw9, .xgl5cw9:root{--x103gslp:transparent;}}",
                "rtl": null,
              },
              0.6,
            ],
          ],
        }
      `);
    });

    test('themes are indifferent to order of keys', () => {
      const { code: code1, metadata: metadata1 } = transformWithFixture(`
        export const theme = stylex.createTheme(vars, ${themeObject});
      `);
      const { code: code2, metadata: metadata2 } = transformWithFixture(`
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

      expect(code1).toEqual(code2);
      expect(metadata1).toEqual(metadata2);
    });

    // TODO: Add debug data to compiled themes
    describe('options `debug:true`', () => {
      test('adds debug data', () => {
        const pluginOptions = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
        };
        const { code, metadata } = transformWithFixture(
          `
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `,
          null,
          pluginOptions,
        );

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
            xop34xu: "xowvtgn",
            __rootVars__: "stylexvars"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-bdddrq",
                {
                  "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                  "rtl": null,
                },
                0.1,
              ],
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
        const pluginOptions = {
          debug: true,
          filename: '/js/node_modules/npm-package/dist/components/Foo.react.js',
        };
        const { code, metadata } = transformWithFixture(
          `
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `,
          null,
          pluginOptions,
        );

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
            xop34xu: "xowvtgn",
            __rootVars__: "stylexvars"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-bdddrq",
                {
                  "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                  "rtl": null,
                },
                0.1,
              ],
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
        const pluginOptions = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };
        const { code, metadata } = transformWithFixture(
          `
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `,
          null,
          pluginOptions,
        );

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
            xop34xu: "xowvtgn",
            __rootVars__: "stylexvars"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-bdddrq",
                {
                  "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                  "rtl": null,
                },
                0.1,
              ],
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
        const pluginOptions = {
          debug: true,
          filename: '/node_modules/npm-package/dist/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };
        const { code, metadata } = transformWithFixture(
          `
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `,
          null,
          pluginOptions,
        );

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
            xop34xu: "xowvtgn",
            __rootVars__: "stylexvars"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-bdddrq",
                {
                  "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                  "rtl": null,
                },
                0.1,
              ],
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
        const pluginOptions = {
          dev: true,
          filename: '/html/js/components/Foo.react.js',
        };
        const { code, metadata } = transformWithFixture(
          `
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `,
          null,
          pluginOptions,
        );

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
            xop34xu: "xowvtgn",
            __rootVars__: "stylexvars"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-bdddrq",
                {
                  "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                  "rtl": null,
                },
                0.1,
              ],
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
        const pluginOptions = {
          filename: '/html/js/components/Foo.react.js',
          runtimeInjection: true,
        };
        const { code, metadata } = transformWithFixture(
          `
          export const theme = stylex.createTheme(vars, {
            color: 'orange'
          });
        `,
          null,
          pluginOptions,
        );

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
            xop34xu: "xowvtgn",
            __rootVars__: "stylexvars"
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xop34xu",
                {
                  "ltr": ":root, .stylexvars{--xwx8imx:blue;--xaaua2w:grey;--xbbre8:10;}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-1lveb7",
                {
                  "ltr": "@media (prefers-color-scheme: dark){:root, .stylexvars{--xwx8imx:lightblue;--xaaua2w:rgba(0, 0, 0, 0.8);}}",
                  "rtl": null,
                },
                0.1,
              ],
              [
                "xop34xu-bdddrq",
                {
                  "ltr": "@media print{:root, .stylexvars{--xwx8imx:white;}}",
                  "rtl": null,
                },
                0.1,
              ],
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
