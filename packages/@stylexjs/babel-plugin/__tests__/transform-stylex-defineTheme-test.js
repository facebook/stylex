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
  describe('[transform] stylex.defineTheme() — single binding', () => {
    test('tokens only (no themes)', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: {
            color: {
              primary: '#0077B6',
            },
          },
        });
      `);

      expect(code).toContain('export const ds');
      expect(code).toContain('var(--');
      expect(code).toContain('__varGroupHash__');
      expect(code).toContain('tokens');
      expect(code).toContain('themes');
      expect(metadata.stylex.length).toBeGreaterThan(0);
      const allLtr = metadata.stylex.map((m) => m[1].ltr).join('');
      expect(allLtr).toContain('#0077B6');
    });

    test('tokens + single theme', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: {
            color: {
              primary: '#0077B6',
              background: '#F1F5F9',
            },
          },
          themes: {
            dark: {
              color: {
                background: '#0F172A',
              },
            },
          },
        });
      `);

      expect(code).toContain('export const ds');
      expect(code).toContain('tokens');
      expect(code).toContain('themes');
      expect(code).toContain('dark');
      expect(code).toContain('$$css');
      expect(metadata.stylex.length).toBeGreaterThan(1);
      const allLtr = metadata.stylex.map((m) => m[1].ltr).join('');
      expect(allLtr).toContain('#0077B6');
      expect(allLtr).toContain('#F1F5F9');
      expect(allLtr).toContain('#0F172A');
    });

    test('tokens + multiple themes', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: {
            color: {
              primary: '#0077B6',
            },
            radius: {
              md: '8px',
            },
          },
          themes: {
            dark: {
              color: { primary: '#48CAE4' },
            },
            ocean: {
              radius: { md: '24px' },
            },
          },
        });
      `);

      expect(code).toContain('dark');
      expect(code).toContain('ocean');
      expect(code).toContain('$$css');
      const allLtr = metadata.stylex.map((m) => m[1].ltr).join('');
      expect(allLtr).toContain('#48CAE4');
      expect(allLtr).toContain('24px');
    });

    test('conditional @media values in tokens', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: {
            color: {
              background: {
                default: '#FFFFFF',
                '@media (prefers-color-scheme: dark)': '#0F172A',
              },
            },
          },
        });
      `);

      expect(code).toContain('var(--');
      const allLtr = metadata.stylex.map((m) => m[1].ltr).join('');
      expect(allLtr).toContain('#FFFFFF');
      expect(allLtr).toContain('#0F172A');
      expect(allLtr).toContain('@media (prefers-color-scheme: dark)');
    });
  });

  describe('[transform] stylex.defineTheme() — destructured', () => {
    test('basic destructured export', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const { tokens, themes } = stylex.defineTheme({
          tokens: {
            color: {
              primary: '#0077B6',
              background: '#F1F5F9',
            },
          },
          themes: {
            dark: {
              color: {
                background: '#0F172A',
              },
            },
          },
        });
      `);

      // Destructuring should be expanded into separate exports
      expect(code).toContain('export const tokens');
      expect(code).toContain('export const themes');
      expect(code).toContain('var(--');
      expect(code).toContain('__varGroupHash__');
      expect(code).toContain('$$css');
      expect(metadata.stylex.length).toBeGreaterThan(1);
    });

    test('partial destructured (tokens only)', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const { tokens } = stylex.defineTheme({
          tokens: {
            spacing: { sm: '4px', lg: '16px' },
          },
          themes: {
            compact: {
              spacing: { lg: '12px' },
            },
          },
        });
      `);

      expect(code).toContain('export const tokens');
      // themes not destructured, should not appear as separate export
      expect(code).not.toContain('export const themes');
      expect(metadata.stylex.length).toBeGreaterThan(0);
    });

    test('destructured with renaming', () => {
      const { code } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const { tokens: myTokens, themes: myThemes } = stylex.defineTheme({
          tokens: {
            color: { primary: 'blue' },
          },
          themes: {
            dark: { color: { primary: 'lightblue' } },
          },
        });
      `);

      expect(code).toContain('export const myTokens');
      expect(code).toContain('export const myThemes');
      expect(code).toContain('var(--');
    });

    test('destructured tokens-only (no themes in config)', () => {
      const { code } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const { tokens } = stylex.defineTheme({
          tokens: {
            color: { primary: 'blue' },
          },
        });
      `);

      expect(code).toContain('export const tokens');
      expect(code).toContain('var(--');
      expect(code).toContain('__varGroupHash__');
    });
  });

  describe('[transform] stylex.defineTheme() — import patterns', () => {
    test('works with named import', () => {
      const { code, metadata } = transform(`
        import { defineTheme } from '@stylexjs/stylex';
        export const ds = defineTheme({
          tokens: {
            color: { primary: 'red' },
          },
        });
      `);

      expect(code).toContain('var(--');
      expect(metadata.stylex.length).toBeGreaterThan(0);
    });

    test('works with renamed named import', () => {
      const { code } = transform(`
        import { defineTheme as dt } from '@stylexjs/stylex';
        export const ds = dt({
          tokens: {
            spacing: { sm: '4px' },
          },
        });
      `);

      expect(code).toContain('var(--');
    });

    test('works with member expression', () => {
      const { code } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: {
            color: { primary: 'blue' },
          },
        });
      `);

      expect(code).toContain('var(--');
    });
  });

  describe('[transform] stylex.defineTheme() — error cases', () => {
    test('throws: not exported', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        const ds = stylex.defineTheme({
          tokens: { color: { primary: 'blue' } },
        });
      `),
      ).toThrow();
    });

    test('throws: wrong arg count (too many)', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: { color: { primary: 'blue' } },
        }, {});
      `),
      ).toThrow();
    });

    test('throws: no arguments', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme();
      `),
      ).toThrow();
    });

    test('throws: missing tokens property', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          themes: { dark: { color: { primary: 'blue' } } },
        });
      `),
      ).toThrow(/tokens/);
    });

    test('throws: invalid destructured key', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const { tokens, invalid } = stylex.defineTheme({
          tokens: { color: { primary: 'blue' } },
        });
      `),
      ).toThrow(/invalid/);
    });

    test('throws: expression statement (not assigned)', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        stylex.defineTheme({
          tokens: { color: { primary: 'blue' } },
        });
      `),
      ).toThrow();
    });
  });

  describe('[transform] stylex.defineTheme() — snapshot tests', () => {
    test('basic single binding snapshot', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const ds = stylex.defineTheme({
          tokens: {
            color: {
              primary: 'blue',
            },
          },
          themes: {
            dark: {
              color: { primary: 'lightblue' },
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const ds = {
          tokens: {
            color: {
              primary: "var(--xntbrjg)"
            },
            __varGroupHash__: "x18ki7qh"
          },
          themes: {
            dark: {
              x18ki7qh: "xlnng9u x18ki7qh",
              $$css: true
            }
          }
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x18ki7qh",
            {
              "ltr": ":root, .x18ki7qh{--xntbrjg:blue;}",
              "rtl": null,
            },
            0.1,
          ],
          [
            "xlnng9u",
            {
              "ltr": ".xlnng9u, .xlnng9u:root{--xntbrjg:lightblue;}",
              "rtl": null,
            },
            0.5,
          ],
        ]
      `);
    });

    test('basic destructured snapshot', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const { tokens, themes } = stylex.defineTheme({
          tokens: {
            color: {
              primary: 'blue',
            },
          },
          themes: {
            dark: {
              color: { primary: 'lightblue' },
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
        };
        export const themes = {
          dark: {
            x1edtgoo: "x9t7ig4 x1edtgoo",
            $$css: true
          }
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
            "x9t7ig4",
            {
              "ltr": ".x9t7ig4, .x9t7ig4:root{--xegmn9y:lightblue;}",
              "rtl": null,
            },
            0.5,
          ],
        ]
      `);
    });
  });
});
