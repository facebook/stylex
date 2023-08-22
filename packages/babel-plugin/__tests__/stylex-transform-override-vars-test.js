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
      flow: 'all',
    },
    babelrc: false,
    plugins: [[stylexPlugin, { ...defaultOpts, ...opts }]],
  }).code;
}
let createVarsOutput = '';

const overrideVars = `{
  bgColor: {
    default: 'green',
    '@media (prefers-color-scheme: dark)': 'lightgreen',
    '@media print': 'transparent',
  },
  bgColorDisabled: {
    default: 'antiquewhite',
    '@media (prefers-color-scheme: dark)': 'floralwhite',
  },
  cornerRadius: { default: '6px' },
  fgColor: 'coral',
}`;

const overrideVarsWithDifferentOrder = `{
  bgColorDisabled: {
    default: 'antiquewhite',
    '@media (prefers-color-scheme: dark)': 'floralwhite',
  },
  fgColor: { default: 'coral' },
  bgColor: {
    default: 'green',
    '@media print': 'transparent',
    '@media (prefers-color-scheme: dark)': 'lightgreen',
  },
  cornerRadius: '6px',
}`;

describe('@stylexjs/babel-plugin', () => {
  beforeEach(() => {
    createVarsOutput = transform(`
      import stylex from 'stylex';
      export const buttonTheme = stylex.unstable_createVars({
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
    `);
  });
  test('ouput of stylex.unstable_createVars()', () => {
    expect(createVarsOutput).toMatchInlineSnapshot(`
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
  describe('[transform] stylex.unstable_overrideVars()', () => {
    test('variables order does not change the className hash', () => {
      const output1 = transform(
        `
         ${createVarsOutput}
         const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
       `,
        { dev: true, ...defaultOpts },
      );
      const output2 = transform(
        `
         ${createVarsOutput}
         const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVarsWithDifferentOrder});
       `,
        { dev: true, ...defaultOpts },
      );
      expect(output1).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
      expect(output1).toEqual(output2);
    });

    test('transforms variables object', () => {
      expect(
        transform(`
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
    });

    test('transforms variables object and add stylex.inject in dev mode', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
         `,
          { dev: true, ...defaultOpts },
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
        stylex.inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
    });

    test('transforms variables object in non-haste env', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
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
        };
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
    });

    test('transforms variables object in non-haste dev env', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
         `,
          {
            dev: true,
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
        };
        stylex.inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
           const buttonThemeNew = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'skyblue',
            cornerRadius: '8px',
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
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };
        const buttonThemeNew = {
          $$css: true,
          x568ih9: "xgesurt"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file in dev mode', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
           const buttonThemeMonochromatic = stylex.unstable_overrideVars(
            buttonTheme, {
              bgColor: 'white',
              bgColorDisabled: 'black',
              cornerRadius: '0px',
            });
         `,
          {
            dev: true,
            ...defaultOpts,
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
        };
        stylex.inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };
        stylex.inject(".xpsjjyf{--xgck17p:white;--xpegid5:black;--xrqfjmn:0px;}", 0.99);
        const buttonThemeMonochromatic = {
          $$css: true,
          x568ih9: "xpsjjyf"
        };"
      `);
    });

    test('transforms variables objects with refrences to local variables', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const RADIUS = 10;
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: {
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            },
            bgColorDisabled: {
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            },
            cornerRadius: { default: RADIUS },
            fgColor: 'coral',
          });
         `,
          { dev: true, ...defaultOpts },
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
        const RADIUS = 10;
        stylex.inject(".xrpt93l{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:10;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xrpt93l{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xrpt93l{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xrpt93l"
        };"
      `);
    });

    test('allows refrences to local variables with static values', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const COLOR = 'coral';
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: {
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            },
            bgColorDisabled: {
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            },
            cornerRadius: { default: '6px' },
            fgColor: COLOR,
          });
         `,
          { dev: true, ...defaultOpts },
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
        const COLOR = 'coral';
        stylex.inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
    });

    test('allows template literal references', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const name = 'light';
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: {
              default: \`\${name}green\`,
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            },
            bgColorDisabled: {
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            },
            cornerRadius: { default: '6px' },
            fgColor: 'coral',
          });
         `,
          { dev: true, ...defaultOpts },
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
        const name = 'light';
        stylex.inject(".x1u43pop{--xgck17p:lightgreen;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.x1u43pop{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.x1u43pop{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1u43pop"
        };"
      `);
    });

    test('allows pure complex expressions', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const RADIUS = 2;
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: {
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            },
            bgColorDisabled: {
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            },
            cornerRadius: { default: RADIUS * 2 },
            fgColor: 'coral',
          });
         `,
          { dev: true, ...defaultOpts },
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
        const RADIUS = 2;
        stylex.inject(".x1ubmxd4{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:4;--x4y59db:coral;}@media (prefers-color-scheme: dark){.x1ubmxd4{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.x1ubmxd4{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1ubmxd4"
        };"
      `);
    });

    test('transforms variables object in commonJS with nested filePath', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, ${overrideVars});
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
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk"
        };"
      `);
    });
  });
});
