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
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
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

function transformWithFixture(fixture, opts = {}) {
  const fixtureFilename =
    opts.filename || '/stylex/packages/TestTheme.stylex.js';

  const { code: varsCode } = transform(
    `
    import * as stylex from '@stylexjs/stylex';
    export const vars = stylex.unstable_defineVarsNested({
      color: {
        primary: 'blue',
        secondary: 'grey',
      },
      spacing: {
        sm: '4px',
        lg: '16px',
      },
    });
  `,
    { filename: '/stylex/packages/vars.stylex.js' },
  );

  const { code, metadata } = transform(
    `
    ${varsCode}
    ${fixture}
  `,
    { filename: fixtureFilename },
  );

  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.unstable_createThemeNested()', () => {
    test('creates theme override for nested vars', () => {
      const { code, metadata } = transformWithFixture(`
        export const theme = stylex.unstable_createThemeNested(vars, {
          color: {
            primary: 'green',
            secondary: 'darkgreen',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: {
            primary: "var(--x1n06l0x)",
            secondary: "var(--xtjtmik)"
          },
          spacing: {
            sm: "var(--xaymh01)",
            lg: "var(--x8i77v7)"
          },
          __varGroupHash__: "xop34xu"
        };
        export const theme = {
          xop34xu: "x1cl03ny xop34xu",
          $$css: true
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1cl03ny",
            {
              "ltr": ".x1cl03ny, .x1cl03ny:root{--x1n06l0x:green;--xtjtmik:darkgreen;}",
              "rtl": null,
            },
            0.5,
          ],
        ]
      `);
    });

    test('partial override (only some branches)', () => {
      const { code, metadata } = transformWithFixture(`
        export const theme = stylex.unstable_createThemeNested(vars, {
          color: {
            primary: 'red',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: {
            primary: "var(--x1n06l0x)",
            secondary: "var(--xtjtmik)"
          },
          spacing: {
            sm: "var(--xaymh01)",
            lg: "var(--x8i77v7)"
          },
          __varGroupHash__: "xop34xu"
        };
        export const theme = {
          xop34xu: "xhf9uhy xop34xu",
          $$css: true
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "xhf9uhy",
            {
              "ltr": ".xhf9uhy, .xhf9uhy:root{--x1n06l0x:red;}",
              "rtl": null,
            },
            0.5,
          ],
        ]
      `);
    });

    test('conditional override with @media', () => {
      const { code, metadata } = transformWithFixture(`
        export const theme = stylex.unstable_createThemeNested(vars, {
          color: {
            primary: {
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          color: {
            primary: "var(--x1n06l0x)",
            secondary: "var(--xtjtmik)"
          },
          spacing: {
            sm: "var(--xaymh01)",
            lg: "var(--x8i77v7)"
          },
          __varGroupHash__: "xop34xu"
        };
        export const theme = {
          xop34xu: "x10oxme4 xop34xu",
          $$css: true
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x10oxme4",
            {
              "ltr": ".x10oxme4, .x10oxme4:root{--x1n06l0x:green;}",
              "rtl": null,
            },
            0.5,
          ],
          [
            "x10oxme4-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){.x10oxme4, .x10oxme4:root{--x1n06l0x:lightgreen;}}",
              "rtl": null,
            },
            0.6000000000000001,
          ],
        ]
      `);
    });

    test('works with named import', () => {
      const { code: varsCode } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.unstable_defineVarsNested({
          bg: { primary: 'white' },
        });
      `,
        { filename: '/stylex/packages/vars.stylex.js' },
      );

      const { code } = transform(
        `
        ${varsCode}
        import { unstable_createThemeNested } from '@stylexjs/stylex';
        export const theme = unstable_createThemeNested(vars, {
          bg: { primary: 'black' },
        });
      `,
      );

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const vars = {
          bg: {
            primary: "var(--x1gxda9x)"
          },
          __varGroupHash__: "xop34xu"
        };
        import { unstable_createThemeNested } from '@stylexjs/stylex';
        export const theme = {
          xop34xu: "x1nmcert xop34xu",
          $$css: true
        };"
      `);
    });

    test('override CSS uses correct var hashes from defineVarsNested', () => {
      const { code: varsCode } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.unstable_defineVarsNested({
          button: { bg: 'red' },
        });
      `,
        { filename: '/stylex/packages/vars.stylex.js' },
      );

      const varHashMatch = varsCode.match(/var\(--([\w]+)\)/);
      expect(varHashMatch).not.toBeNull();
      const varHash = varHashMatch[1];

      const { metadata } = transform(
        `
        ${varsCode}
        export const theme = stylex.unstable_createThemeNested(vars, {
          button: { bg: 'green' },
        });
      `,
      );

      const overrideCSS = metadata.stylex.find(
        (m) => m[1].ltr && m[1].ltr.includes('green'),
      );
      expect(overrideCSS).toBeDefined();
      expect(overrideCSS[1].ltr).toContain(`--${varHash}`);
    });

    // Validation tests
    test('throws: must have exactly 2 arguments', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const theme = stylex.unstable_createThemeNested({});
      `),
      ).toThrow();
    });

    test('throws: must be assigned to a variable', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        stylex.unstable_createThemeNested({}, {});
      `),
      ).toThrow();
    });

    test('throws: first arg must have __varGroupHash__', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const theme = stylex.unstable_createThemeNested(
          { color: { primary: 'var(--fake)' } },
          { color: { primary: 'green' } },
        );
      `),
      ).toThrow();
    });
  });
});
