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
    filename: opts.filename || '/stylex/packages/tokens.stylex.js',
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
  describe('[transform] stylex.unstable_defineVarsNested()', () => {
    test('basic nested tokens', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({
          button: {
            background: 'red',
            color: 'blue',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          button: {
            background: "var(--x16caxfb)",
            color: "var(--xi1hctn)"
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1edtgoo",
            {
              "ltr": ":root, .x1edtgoo{--x16caxfb:red;--xi1hctn:blue;}",
              "rtl": null,
            },
            0.1,
          ],
        ]
      `);
    });

    test('deeply nested tokens (3 levels)', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({
          button: {
            primary: {
              background: '#00FF00',
            },
            secondary: {
              background: '#CCCCCC',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          button: {
            primary: {
              background: "var(--xekzafr)"
            },
            secondary: {
              background: "var(--x8n1mhe)"
            }
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1edtgoo",
            {
              "ltr": ":root, .x1edtgoo{--xekzafr:#00FF00;--x8n1mhe:#CCCCCC;}",
              "rtl": null,
            },
            0.1,
          ],
        ]
      `);
    });

    test('conditional @media values inside nesting', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({
          button: {
            color: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          button: {
            color: "var(--xi1hctn)"
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1edtgoo",
            {
              "ltr": ":root, .x1edtgoo{--xi1hctn:blue;}",
              "rtl": null,
            },
            0.1,
          ],
          [
            "x1edtgoo-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root, .x1edtgoo{--xi1hctn:lightblue;}}",
              "rtl": null,
            },
            0.2,
          ],
        ]
      `);
    });

    test('mixed flat and nested values', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({
          flatValue: 'red',
          nested: {
            deep: 'blue',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          flatValue: "var(--x1h9v5ir)",
          nested: {
            deep: "var(--xz6lukc)"
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1edtgoo",
            {
              "ltr": ":root, .x1edtgoo{--x1h9v5ir:red;--xz6lukc:blue;}",
              "rtl": null,
            },
            0.1,
          ],
        ]
      `);
    });

    test('works with named import', () => {
      const { code, metadata } = transform(`
        import { unstable_defineVarsNested } from '@stylexjs/stylex';
        export const tokens = unstable_defineVarsNested({
          spacing: {
            sm: '4px',
            lg: '16px',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { unstable_defineVarsNested } from '@stylexjs/stylex';
        export const tokens = {
          spacing: {
            sm: "var(--x1o7hcty)",
            lg: "var(--xsuxlvu)"
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1edtgoo",
            {
              "ltr": ":root, .x1edtgoo{--x1o7hcty:4px;--xsuxlvu:16px;}",
              "rtl": null,
            },
            0.1,
          ],
        ]
      `);
    });

    test('works with renamed named import', () => {
      const { code } = transform(`
        import { unstable_defineVarsNested as defineNested } from '@stylexjs/stylex';
        export const tokens = defineNested({
          spacing: {
            sm: '4px',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { unstable_defineVarsNested as defineNested } from '@stylexjs/stylex';
        export const tokens = {
          spacing: {
            sm: "var(--x1o7hcty)"
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
    });

    test('produces different hashes for different nested keys', () => {
      const { code } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({
          a: { x: 'red' },
          b: { x: 'blue' },
        });
      `);

      const varRefs = code.match(/var\(--[a-z0-9]+\)/g) || [];
      const unique = new Set(varRefs);
      expect(unique.size).toBe(2);
    });

    test('deeply nested conditional with @supports', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({
          color: {
            primary: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': {
                default: 'lightblue',
                '@supports (color: oklch(0 0 0))': 'oklch(0.7 -0.3 -0.4)',
              },
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          color: {
            primary: "var(--xegmn9y)"
          },
          __varGroupHash__: "x1edtgoo"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1edtgoo",
            {
              "ltr": ":root, .x1edtgoo{--xegmn9y:blue;}",
              "rtl": null,
            },
            0.1,
          ],
          [
            "x1edtgoo-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root, .x1edtgoo{--xegmn9y:lightblue;}}",
              "rtl": null,
            },
            0.2,
          ],
          [
            "x1edtgoo-7iokyd",
            {
              "ltr": "@supports (color: oklch(0 0 0)){@media (prefers-color-scheme: dark){:root, .x1edtgoo{--xegmn9y:oklch(0.7 -0.3 -0.4);}}}",
              "rtl": null,
            },
            0.3,
          ],
        ]
      `);
    });

    // Validation tests
    test('throws: must be a named export', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        const tokens = stylex.unstable_defineVarsNested({
          button: { bg: 'red' },
        });
      `),
      ).toThrow();
    });

    test('throws: must have exactly 1 argument', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested({}, {});
      `),
      ).toThrow();
    });

    test('throws: must have an argument', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineVarsNested();
      `),
      ).toThrow();
    });
  });
});
