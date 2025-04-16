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

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');
import { messages } from '@stylexjs/shared';

const classNamePrefix = 'x';
const defaultOpts = {
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix,
  debug: false,
};

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          unstable_moduleResolution: { type: 'haste' },
          ...defaultOpts,
          ...opts,
        },
      ],
    ],
  });
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineConsts()', () => {
    test('transforms constants object', () => {
      const { code, metadata } = transform(`
        import stylex from 'stylex';
        export const breakpoints = stylex.defineConsts({
          sm: '(min-width: 768px)',
          md: '(min-width: 1024px)',
          lg: '(min-width: 1280px)',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
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

    test('throws error for constant keys that start with --', () => {
      expect(() =>
        transform(`
          import stylex from 'stylex';
          export const spacing = stylex.defineConsts({
            '--small': '8px',
            '--medium': '16px',
            '--large': '24px',
          });
        `),
      ).toThrow(messages.INVALID_CONST_KEY);
    });

    test('transforms constants object with named import', () => {
      const { code, metadata } = transform(`
        import { defineConsts } from 'stylex';
        export const breakpoints = defineConsts({
          sm: '(min-width: 768px)',
          md: '(min-width: 1024px)',
          lg: '(min-width: 1280px)',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { defineConsts } from 'stylex';
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

    test('transforms constants object with import *', () => {
      const { code, metadata } = transform(`
        import * as foo from 'stylex';
        export const colors = foo.defineConsts({
          primary: '#ff0000',
          secondary: '#00ff00',
          tertiary: '#0000ff',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as foo from 'stylex';
        export const colors = {
          primary: "#ff0000",
          secondary: "#00ff00",
          tertiary: "#0000ff",
          __constName__: "TestTheme.stylex.js//colors",
          __constHash__: "34b3b230"
        };"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "xbx9tme",
            {
              "constKey": "xbx9tme",
              "constVal": "#ff0000",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1is3lfz",
            {
              "constKey": "x1is3lfz",
              "constVal": "#00ff00",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1uyqs0n",
            {
              "constKey": "x1uyqs0n",
              "constVal": "#0000ff",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('handles special characters in constant names', () => {
      const { code, metadata } = transform(`
        import stylex from 'stylex';
        export const sizes = stylex.defineConsts({
          'max-width': '1200px',
          'font-size*large': '18px',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const sizes = {
          "max-width": "1200px",
          "font-size*large": "18px",
          __constName__: "TestTheme.stylex.js//sizes",
          __constHash__: "dfc06b6e"
        };"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1b5i5wj",
            {
              "constKey": "x1b5i5wj",
              "constVal": "1200px",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
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

    test('handles numeric keys', () => {
      const { code, metadata } = transform(`
        import stylex from 'stylex';
        export const levels = stylex.defineConsts({
          1: 'one',
          2: 'two',
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const levels = {
          "1": "one",
          "2": "two",
          __constName__: "TestTheme.stylex.js//levels",
          __constHash__: "cd095331"
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
          [
            "x5diukc",
            {
              "constKey": "x5diukc",
              "constVal": "two",
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
