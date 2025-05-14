/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

import path from 'path';
import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

const defaultOpts = {
  unstable_moduleResolution: { rootDir: '/stylex/packages/', type: 'commonJS' },
};

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
          ...defaultOpts,
          ...opts,
        },
      ],
    ],
  });
  return { code, metadata };
}

function transformWithInlineConsts(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: path.join(__dirname, '__fixtures__/main.stylex.js'),
    parserOpts: { sourceType: 'module' },
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          ...opts,
          unstable_moduleResolution: {
            rootDir: path.join(__dirname, '__fixtures__'),
            type: 'commonJS',
          },
        },
      ],
    ],
  });

  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineConsts()', () => {
    test('constants are unique', () => {
      const { code, metadata } = transform(`
        import stylex from 'stylex';
        export const breakpoints = stylex.defineConsts({ padding: '10px' });
      `);

      const { code: codeDuplicate, metadata: metadataDuplicate } = transform(`
        import stylex from 'stylex';
        export const breakpoints = stylex.defineConsts({ padding: '10px' });
      `);

      // Assert the generated constants are consistent for the same inputs
      expect(code).toEqual(codeDuplicate);
      expect(metadata).toEqual(metadataDuplicate);

      const { code: codeOther, metadata: metadataOther } = transform(`
        import stylex from 'stylex';
        export const breakpoints = stylex.defineConsts({ margin: '10px' });
      `);

      // Assert the generated constants are different for different inputs
      expect(code).not.toEqual(codeOther);
      expect(metadata).not.toEqual(metadataOther);
    });

    test('constants object', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const breakpoints = stylex.defineConsts({
          sm: '(min-width: 768px)',
          md: '(min-width: 1024px)',
          lg: '(min-width: 1280px)',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const breakpoints = {
          sm: "(min-width: 768px)",
          md: "(min-width: 1024px)",
          lg: "(min-width: 1280px)"
        };"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1izlsax",
            {
              "constKey": "x1izlsax",
              "constVal": "(min-width: 768px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "xe5hjsi",
            {
              "constKey": "xe5hjsi",
              "constVal": "(min-width: 1024px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "xmbwnbr",
            {
              "constKey": "xmbwnbr",
              "constVal": "(min-width: 1280px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('constants object (haste)', () => {
      const options = {
        unstable_moduleResolution: { type: 'haste' },
      };

      const { code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const breakpoints = stylex.defineConsts({
          sm: '(min-width: 768px)',
          md: '(min-width: 1024px)',
          lg: '(min-width: 1280px)',
        });
      `,
        options,
      );

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const breakpoints = {
          sm: "(min-width: 768px)",
          md: "(min-width: 1024px)",
          lg: "(min-width: 1280px)"
        };"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1izlsax",
            {
              "constKey": "x1izlsax",
              "constVal": "(min-width: 768px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "xe5hjsi",
            {
              "constKey": "xe5hjsi",
              "constVal": "(min-width: 1024px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "xmbwnbr",
            {
              "constKey": "xmbwnbr",
              "constVal": "(min-width: 1280px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('constant names: special characters', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const sizes = stylex.defineConsts({
          'font-size*large': '18px',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const sizes = {
          "font-size*large": "18px"
        };"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x4spo47",
            {
              "constKey": "x4spo47",
              "constVal": "18px",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('constant names: number', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const levels = stylex.defineConsts({
          1: 'one'
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const levels = {
          "1": "one"
        };"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "xr91grk",
            {
              "constKey": "xr91grk",
              "constVal": "one",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });
  });

  describe('[transform] stylex.defineConsts() in stylex.create() ', () => {
    test('adds placeholder for constant value from constants.stylex', () => {
      const { code, metadata } = transformWithInlineConsts(`
        import * as stylex from '@stylexjs/stylex';
        import { colors } from './constants.stylex';

        export const styles = stylex.create({
          root: {
            backgroundColor: colors.background,
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        import { colors } from './constants.stylex';
        export const styles = {
          root: {
            kWkggS: "xw8d3ix",
            $$css: true
          }
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xw8d3ix",
              {
                "ltr": ".xw8d3ix{background-color:var(--x180gk19)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('adds media query placeholder from constants.stylex', () => {
      const { code, metadata } = transformWithInlineConsts(`
        import * as stylex from '@stylexjs/stylex';
        import { breakpoints } from './constants.stylex';

        export const styles = stylex.create({
          root: {
            color: {
              default: 'red',
              [breakpoints.small]: 'blue',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        import { breakpoints } from './constants.stylex';
        export const styles = {
          root: {
            kMwMTN: "x1e2nbdu xbs0o1n",
            $$css: true
          }
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1e2nbdu",
              {
                "ltr": ".x1e2nbdu{color:red}",
                "rtl": null,
              },
              3000,
            ],
            [
              "xbs0o1n",
              {
                "ltr": "var(--x1r2wpmh){.xbs0o1n.xbs0o1n{color:blue}}",
                "rtl": null,
              },
              6000,
            ],
          ],
        }
      `);
    });

    test('adds multiple media query placeholders from constants.stylex', () => {
      const { code, metadata } = transformWithInlineConsts(`
        import * as stylex from '@stylexjs/stylex';
        import { breakpoints } from './constants.stylex';

        export const styles = stylex.create({
          root: {
            color: {
              default: 'red',
              [breakpoints.small]: 'blue',
              [breakpoints.big]: 'yellow',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        import { breakpoints } from './constants.stylex';
        export const styles = {
          root: {
            kMwMTN: "x1e2nbdu xbs0o1n x1ru35j7",
            $$css: true
          }
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1e2nbdu",
              {
                "ltr": ".x1e2nbdu{color:red}",
                "rtl": null,
              },
              3000,
            ],
            [
              "xbs0o1n",
              {
                "ltr": "var(--x1r2wpmh){.xbs0o1n.xbs0o1n{color:blue}}",
                "rtl": null,
              },
              6000,
            ],
            [
              "x1ru35j7",
              {
                "ltr": "var(--xr4bctk){.x1ru35j7.x1ru35j7{color:yellow}}",
                "rtl": null,
              },
              6000,
            ],
          ],
        }
      `);
    });

    test('adds nested media query placeholders from constants.stylex', () => {
      const { code, metadata } = transformWithInlineConsts(`
        import * as stylex from '@stylexjs/stylex';
        import { breakpoints, colors } from './constants.stylex';

        export const styles = stylex.create({
          root: {
            color: {
              default: 'black',
              [breakpoints.big]: {
                default: colors.red,
                [breakpoints.small]: colors.blue,
              },
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        import { breakpoints, colors } from './constants.stylex';
        export const styles = {
          root: {
            kMwMTN: "x1mqxbix x1iobwbz xrf68et",
            $$css: true
          }
        };"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1mqxbix",
              {
                "ltr": ".x1mqxbix{color:black}",
                "rtl": null,
              },
              3000,
            ],
            [
              "x1iobwbz",
              {
                "ltr": "var(--xr4bctk){.x1iobwbz.x1iobwbz{color:var(--x1itgfi6)}}",
                "rtl": null,
              },
              6000,
            ],
            [
              "xrf68et",
              {
                "ltr": "var(--x1r2wpmh){var(--xr4bctk){.xrf68et.xrf68et.xrf68et{color:var(--x9g651j)}}}",
                "rtl": null,
              },
              9000,
            ],
          ],
        }
      `);
    });
  });
});
