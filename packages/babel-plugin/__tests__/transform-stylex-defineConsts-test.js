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
          lg: "(min-width: 1280px)",
          __constName__: "TestTheme.stylex.js//breakpoints",
          __constHash__: "1050fec2"
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
          lg: "(min-width: 1280px)",
          __constName__: "TestTheme.stylex.js//breakpoints",
          __constHash__: "1050fec2"
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
          "font-size*large": "18px",
          __constName__: "TestTheme.stylex.js//sizes",
          __constHash__: "5fa8e495"
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
          "1": "one",
          __constName__: "TestTheme.stylex.js//levels",
          __constHash__: "37cea1df"
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
});
