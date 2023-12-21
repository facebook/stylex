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
  }).code;
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
        `),
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
        `),
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
        `),
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
        `),
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        _inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
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
        ),
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        _inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
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
        ),
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        _inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject(":root{--xcateir:white;--xmj7ivn:black;--x13gxjix:8;}@media (prefers-color-scheme: dark){:root{--xmj7ivn:white;}}", 0);
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        const RADIUS = 10;
        _inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        const color = 'blue';
        _inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        const name = 'light';
        _inject(":root{--xgck17p:lightblue;--xpegid5:grey;--xrqfjmn:10;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
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
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        const RADIUS = 2;
        _inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:4;--x4y59db:pink;}@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}@media print{:root{--xgck17p:white;}}", 0);
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
              type: 'commonjs',
              rootDir,
            },
            filename: '/stylex/packages/utils/NestedTheme.stylex.js',
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        _inject(":root{--x1sm8rlu:blue;--xxncinc:grey;--x4e1236:10;--xv9uic:pink;}@media (prefers-color-scheme: dark){:root{--x1sm8rlu:lightblue;--xxncinc:rgba(0, 0, 0, 0.8);}}@media print{:root{--x1sm8rlu:white;}}", 0);
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
