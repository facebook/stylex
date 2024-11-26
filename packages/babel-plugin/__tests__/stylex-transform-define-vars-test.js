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

const classNamePrefix = 'x';
const defaultOpts = {
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix,
};

const rootDir = '/stylex/packages/';

function transform(source, opts = defaultOpts) {
  return transformSync(source, {
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [[stylexPlugin, { ...defaultOpts, ...opts }]],
  });
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineVars()', () => {
    test('transforms variables object', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `).code,
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms literal variables object', () => {
      const { code, metadata } = transform(`
        import stylex from 'stylex';
        export const buttonTheme = stylex.defineVars({
          '--bgColor': {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
            '@media print': 'white',
          },
          '--bgColorDisabled': {
            default: 'grey',
            '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
          },
          '--cornerRadius': 10,
          '--fgColor': {
            default: 'pink',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          "--bgColor": "var(--bgColor)",
          "--bgColorDisabled": "var(--bgColorDisabled)",
          "--cornerRadius": "var(--cornerRadius)",
          "--fgColor": "var(--fgColor)",
          __themeName__: "x568ih9"
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x568ih9",
            {
              "ltr": ":root, .x568ih9{--bgColor:blue;--bgColorDisabled:grey;--cornerRadius:10;--fgColor:pink;}",
              "rtl": null,
            },
            0,
          ],
          [
            "x568ih9-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root, .x568ih9{--bgColor:lightblue;--bgColorDisabled:rgba(0, 0, 0, 0.8);}}",
              "rtl": null,
            },
            0.1,
          ],
          [
            "x568ih9-bdddrq",
            {
              "ltr": "@media print{:root, .x568ih9{--bgColor:white;}}",
              "rtl": null,
            },
            0.1,
          ],
        ]
      `);
    });

    test('transforms variables object with import *', () => {
      expect(
        transform(`
          import * as foo from 'stylex';
          export const buttonTheme = foo.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `).code,
      ).toMatchInlineSnapshot(`
        "import * as foo from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object with named import', () => {
      expect(
        transform(`
          import {defineVars} from 'stylex';
          export const buttonTheme = defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `).code,
      ).toMatchInlineSnapshot(`
        "import { defineVars } from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms referenced local variables object', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const defaultButtonTokens = {
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          };
          export const buttonTheme = stylex.defineVars(defaultButtonTokens);
        `).code,
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const defaultButtonTokens = {
          bgColor: {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
            '@media print': 'white'
          },
          bgColorDisabled: {
            default: 'grey',
            '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)'
          },
          cornerRadius: 10,
          fgColor: {
            default: 'pink'
          }
        };
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object and add stylex.inject in dev mode', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          { dev: true, ...defaultOpts },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object in non-haste env', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          {
            moduleSystem: 'commonjs',
            rootDir,
          },
        ).code,
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object in non-haste dev env', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          {
            dev: true,
            moduleSystem: 'commonjs',
            rootDir,
          },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
          export const textInputTheme = stylex.defineVars({
            bgColor: 'white',
            labelColor: {
              default: 'black',
              '@media (prefers-color-scheme: dark)': 'white',
            },
            cornerRadius: 8,
          });
        `,
        ).code,
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        export const textInputTheme = {
          bgColor: "var(--xcateir)",
          labelColor: "var(--xmj7ivn)",
          cornerRadius: "var(--x13gxjix)",
          __themeName__: "xb35w82"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file in dev mode', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
          export const textInputTheme = stylex.defineVars({
            bgColor: 'white',
            labelColor: {
              default: 'black',
              '@media (prefers-color-scheme: dark)': 'white',
            },
            cornerRadius: 8,
          });
        `,
          {
            dev: true,
            ...defaultOpts,
          },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject2(":root, .xb35w82{--xcateir:white;--xmj7ivn:black;--x13gxjix:8;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .xb35w82{--xmj7ivn:white;}}", 0.1);
        export const textInputTheme = {
          bgColor: "var(--xcateir)",
          labelColor: "var(--xmj7ivn)",
          cornerRadius: "var(--x13gxjix)",
          __themeName__: "xb35w82"
        };"
      `);
    });

    test('transforms variables objects with references to local variables', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const RADIUS = 10;
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: RADIUS,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          { dev: true, ...defaultOpts },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const RADIUS = 10;
        _inject2(":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('allows references to local variables with static values', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const color = 'blue';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: color,
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          { dev: true, ...defaultOpts },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const color = 'blue';
        _inject2(":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('allows template literal references', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const name = 'light';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: \`\${name}blue\`,
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          { dev: true, ...defaultOpts },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const name = 'light';
        _inject2(":root, .x568ih9{--xgck17p:lightblue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('allows pure complex expressions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const RADIUS = 2;
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: RADIUS * 2,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          { dev: true, ...defaultOpts },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const RADIUS = 2;
        _inject2(":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:4;--x4y59db:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .x568ih9{--xgck17p:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object in commonJS with nested filePath', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: 10,
            fgColor: {
              default: 'pink',
            },
          });
        `,
          {
            dev: true,
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir,
            },
            filename: '/stylex/packages/utils/NestedTheme.stylex.js',
          },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(":root, .xmpye33{--x1sm8rlu:blue;--xxncinc:grey;--x4e1236:10;--xv9uic:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .xmpye33{--x1sm8rlu:lightblue;--xxncinc:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .xmpye33{--x1sm8rlu:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--x1sm8rlu)",
          bgColorDisabled: "var(--xxncinc)",
          cornerRadius: "var(--x4e1236)",
          fgColor: "var(--xv9uic)",
          __themeName__: "xmpye33"
        };"
      `);
    });

    test('transforms variables object with stylex.types wrapper', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.defineVars({
            bgColor: stylex.types.color({
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            }),
            bgColorDisabled: stylex.types.color({
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            }),
            cornerRadius: stylex.types.length('10px'),
            fgColor: stylex.types.color({
              default: 'pink',
            }),
          });
        `,
          {
            dev: true,
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir,
            },
            filename: '/stylex/packages/utils/NestedTheme.stylex.js',
          },
        ).code,
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2("@property --x1sm8rlu { syntax: \\"<color>\\"; inherits: true; initial-value: blue }", 0);
        _inject2("@property --xxncinc { syntax: \\"<color>\\"; inherits: true; initial-value: grey }", 0);
        _inject2("@property --x4e1236 { syntax: \\"<length>\\"; inherits: true; initial-value: 10px }", 0);
        _inject2("@property --xv9uic { syntax: \\"<color>\\"; inherits: true; initial-value: pink }", 0);
        _inject2(":root, .xmpye33{--x1sm8rlu:blue;--xxncinc:grey;--x4e1236:10px;--xv9uic:pink;}", 0);
        _inject2("@media (prefers-color-scheme: dark){:root, .xmpye33{--x1sm8rlu:lightblue;--xxncinc:rgba(0, 0, 0, 0.8);}}", 0.1);
        _inject2("@media print{:root, .xmpye33{--x1sm8rlu:white;}}", 0.1);
        export const buttonTheme = {
          bgColor: "var(--x1sm8rlu)",
          bgColorDisabled: "var(--xxncinc)",
          cornerRadius: "var(--x4e1236)",
          fgColor: "var(--xv9uic)",
          __themeName__: "xmpye33"
        };"
      `);
    });
  });
});
