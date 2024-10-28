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

describe('@stylexjs/babel-plugin stylex.createTheme', () => {
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject2(".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xtrlmmh x568ih9"
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
          x568ih9: "xtrlmmh x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject2(".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xtrlmmh x568ih9"
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
          x568ih9: "xtrlmmh x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject2(".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xtrlmmh x568ih9"
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
          x568ih9: "xtrlmmh x568ih9"
        };
        const buttonThemeNew = {
          $$css: true,
          x568ih9: "x1qnwd2l x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject2(".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xtrlmmh x568ih9"
        };
        _inject2(".x1awrdae, .x1awrdae:root{--xgck17p:white;--xpegid5:black;--xrqfjmn:0px;}", 0.5);
        const buttonThemeMonochromatic = {
          TestTheme__buttonThemeMonochromatic: "TestTheme__buttonThemeMonochromatic",
          $$css: true,
          x568ih9: "x1awrdae x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 10;
        _inject2(".xi7kglk, .xi7kglk:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:10;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xi7kglk, .xi7kglk:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xi7kglk, .xi7kglk:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xi7kglk x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const COLOR = 'coral';
        _inject2(".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xtrlmmh x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const name = 'light';
        _inject2(".x143z4bu, .x143z4bu:root{--xgck17p:lightgreen;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.x143z4bu, .x143z4bu:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.x143z4bu, .x143z4bu:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "x143z4bu x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 2;
        _inject2(".x64jqcx, .x64jqcx:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:4;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.x64jqcx, .x64jqcx:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.x64jqcx, .x64jqcx:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "x64jqcx x568ih9"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        _inject2(".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          NestedTheme__buttonThemePositive: "NestedTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "xtrlmmh x568ih9"
        };"
      `);
    });

    test('transforms typed object overrides', () => {
      expect(
        transform(
          `
           ${defineVarsOutput}
           const RADIUS = 2;
           const buttonThemePositive = stylex.createTheme(buttonTheme, {
            bgColor: stylex.types.color({
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            }),
            bgColorDisabled: stylex.types.color({
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            }),
            cornerRadius: stylex.types.length({ default: RADIUS * 2 }),
            fgColor: stylex.types.color('coral'),
          });
         `,
          { dev: true, ...defaultOpts },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          fgColor: "var(--x4y59db)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 2;
        _inject2(".x41sqjo, .x41sqjo:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:4px;--x4y59db:coral;}", 0.5);
        _inject2("@media (prefers-color-scheme: dark){.x41sqjo, .x41sqjo:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}", 0.6);
        _inject2("@media print{.x41sqjo, .x41sqjo:root{--xgck17p:transparent;}}", 0.6);
        const buttonThemePositive = {
          TestTheme__buttonThemePositive: "TestTheme__buttonThemePositive",
          $$css: true,
          x568ih9: "x41sqjo x568ih9"
        };"
      `);
    });
  });
});

describe('@stylexjs/babel-plugin stylex.createTheme with literals', () => {
  beforeEach(() => {
    defineVarsOutput = transform(`
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
  });
  test('output of stylex.defineVars()', () => {
    expect(defineVarsOutput).toMatchInlineSnapshot(`
      "import stylex from 'stylex';
      export const buttonTheme = {
        "--bgColor": "var(--bgColor)",
        "--bgColorDisabled": "var(--bgColorDisabled)",
        "--cornerRadius": "var(--cornerRadius)",
        "--fgColor": "var(--fgColor)",
        __themeName__: "x568ih9"
      };"
    `);
  });
  describe('[transform] stylex.createTheme()', () => {
    test('transforms variables object', () => {
      expect(
        transform(`
          ${defineVarsOutput}
          const buttonThemePositive = stylex.createTheme(buttonTheme, {
            '--bgColor': {
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            },
            '--bgColorDisabled': {
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            },
            '--cornerRadius': { default: '6px' },
            '--fgColor': 'coral',
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          "--bgColor": "var(--bgColor)",
          "--bgColorDisabled": "var(--bgColorDisabled)",
          "--cornerRadius": "var(--cornerRadius)",
          "--fgColor": "var(--fgColor)",
          __themeName__: "x568ih9"
        };
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x4znj40 x568ih9"
        };"
      `);
    });
  });
});
