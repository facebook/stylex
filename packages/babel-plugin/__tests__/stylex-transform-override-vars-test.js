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
let defineVarsOutput = '';

const createTheme = `{
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

const createThemeWithDifferentOrder = `{
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
    defineVarsOutput = transform(`
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
    `);
  });
  test('output of stylex.defineVars()', () => {
    expect(defineVarsOutput).toMatchInlineSnapshot(`
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
  describe('[transform] stylex.createTheme()', () => {
    test('variables order does not change the className hash', () => {
      const output1 = transform(
        `
         ${defineVarsOutput}
         const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
       `,
        { dev: true, ...defaultOpts },
      );
      const output2 = transform(
        `
         ${defineVarsOutput}
         const buttonThemePositive = stylex.createTheme(buttonTheme, ${createThemeWithDifferentOrder});
       `,
        { dev: true, ...defaultOpts },
      );
      expect(output1).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xfmksyk{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
      expect(output1).toEqual(output2);
    });

    test('transforms variables object', () => {
      expect(
        transform(`
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
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
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
         `,
          { dev: true, ...defaultOpts },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xfmksyk{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });

    test('transforms variables object in non-haste env', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
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
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
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
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xfmksyk{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
           const buttonThemeNew = stylex.createTheme(buttonTheme, {
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
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
           const buttonThemeMonochromatic = stylex.createTheme(
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xfmksyk{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };
        _inject(".xpsjjyf{--xgck17p:white;--xpegid5:black;--xrqfjmn:0px;}", 0.8);
        const buttonThemeMonochromatic = {
          $$css: true,
          x568ih9: "xpsjjyf",
          "TestTheme.stylex.js__buttonThemeMonochromatic": "TestTheme.stylex.js__buttonThemeMonochromatic"
        };"
      `);
    });

    test('transforms variables objects with references to local variables', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const RADIUS = 10;
           const buttonThemePositive = stylex.createTheme(buttonTheme, {
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 10;
        _inject(".xrpt93l{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:10;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xrpt93l{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xrpt93l{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xrpt93l",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });

    test('allows references to local variables with static values', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const COLOR = 'coral';
           const buttonThemePositive = stylex.createTheme(buttonTheme, {
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const COLOR = 'coral';
        _inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xfmksyk{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });

    test('allows template literal references', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const name = 'light';
           const buttonThemePositive = stylex.createTheme(buttonTheme, {
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const name = 'light';
        _inject(".x1u43pop{--xgck17p:lightgreen;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.x1u43pop{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.x1u43pop{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1u43pop",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });

    test('allows pure complex expressions', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const RADIUS = 2;
           const buttonThemePositive = stylex.createTheme(buttonTheme, {
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 2;
        _inject(".x1ubmxd4{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:4;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.x1ubmxd4{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.x1ubmxd4{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1ubmxd4",
          "TestTheme.stylex.js__buttonThemePositive": "TestTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });

    test('transforms variables object in commonJS with nested filePath', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const buttonThemePositive = stylex.createTheme(buttonTheme, ${createTheme});
         `,
          {
            dev: true,
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir,
            },
            filename: '/stylex/packages/utils/NestedTheme.stylex.js',
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject(".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.8);
        _inject("@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.9);
        _inject("@media print{.xfmksyk{--xgck17p:transparent;}}", 0.9);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "xfmksyk",
          "utils/NestedTheme.stylex.js__buttonThemePositive": "utils/NestedTheme.stylex.js__buttonThemePositive"
        };"
      `);
    });
  });
});
