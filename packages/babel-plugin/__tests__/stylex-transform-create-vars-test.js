/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

const classNamePrefix = 'x';
const defaultOpts = {
  stylexSheetName: '<>',
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix,
};

const rootDir = '/stylex/packages/';

function transform(source, opts = defaultOpts) {
  return transformSync(source, {
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
    parserOpts: {
      flow: {
        all: true,
      },
    },
    babelrc: false,
    plugins: [[stylexPlugin, { ...defaultOpts, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.unstable_createVars()', () => {
    test('transforms variables object', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });
    test('transforms referenced local variables object', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const defaultButtonTokens = {
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          };
          export const buttonTheme = stylex.unstable_createVars(defaultButtonTokens);
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const defaultButtonTokens = {
          bgColor: 'blue',
          bgColorDisabled: 'grey',
          cornerRadius: 10
        };
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object and add stylex.inject in dev mode', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
        `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object in non-haste env', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
        `,
          {
            moduleSystem: 'commonjs',
            rootDir,
          }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object in non-haste dev env', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
        `,
          {
            dev: true,
            moduleSystem: 'commonjs',
            rootDir,
          }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
          export const textInputTheme = stylex.unstable_createVars({
            bgColor: 'white',
            labelColor: 'black',
            cornerRadius: 8,
          });
        `
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
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
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
          export const textInputTheme = stylex.unstable_createVars({
            bgColor: 'white',
            labelColor: 'black',
            cornerRadius: 8,
          });
        `,
          {
            dev: true,
            ...defaultOpts,
          }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        stylex.inject(":root{--xcateir:white;--xmj7ivn:black;--x13gxjix:8;}", 0);
        export const textInputTheme = {
          bgColor: "var(--xcateir)",
          labelColor: "var(--xmj7ivn)",
          cornerRadius: "var(--x13gxjix)",
          __themeName__: "xb35w82"
        };"
      `);
    });

    test('transforms variables objects with refrences to local variables', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const RADIUS = 10;
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: RADIUS,
          });
        `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const RADIUS = 10;
        stylex.inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('allows refrences to local variables with static values', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const RADIUS = 10;
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: RADIUS,
          });
        `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const RADIUS = 10;
        stylex.inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
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
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: \`\${name}blue\`,
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
        `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const name = 'light';
        stylex.inject(":root{--xgck17p:lightblue;--xpegid5:grey;--xrqfjmn:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
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
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: RADIUS * 2,
          });
        `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const RADIUS = 2;
        stylex.inject(":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:4;}", 0);
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };"
      `);
    });

    test('transforms variables object in commonJS with nested filePath', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const buttonTheme = stylex.unstable_createVars({
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: 10,
          });
        `,
          {
            dev: true,
            unstable_moduleResolution: {
              type: 'commonjs',
              rootDir,
            },
            filename: '/stylex/packages/utils/NestedTheme.stylex.js',
          }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(":root{--x1sm8rlu:blue;--xxncinc:grey;--x4e1236:10;}", 0);
        export const buttonTheme = {
          bgColor: "var(--x1sm8rlu)",
          bgColorDisabled: "var(--xxncinc)",
          cornerRadius: "var(--x4e1236)",
          __themeName__: "xmpye33"
        };"
      `);
    });
  });
});
