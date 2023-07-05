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
let createVarsOutput = '';

describe('@stylexjs/babel-plugin', () => {
  beforeEach(() => {
    createVarsOutput = transform(`
      import stylex from 'stylex';
      export const buttonTheme = stylex.unstable_createVars({
        bgColor: 'blue',
        bgColorDisabled: 'grey',
        cornerRadius: 10,
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
        __themeName__: "x568ih9"
      };"
    `);
  });
  describe('[transform] stylex.unstable_overrideVars()', () => {
    test('variables order does not change the className hash', () => {
      const output1 = transform(
        `
         ${createVarsOutput}
         const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
          bgColor: 'green',
          bgColorDisabled: 'lightseagreen',
          cornerRadius: '6px',
        });
       `,
        { dev: true, ...defaultOpts }
      );
      const output2 = transform(
        `
         ${createVarsOutput}
         const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
           bgColorDisabled: 'lightseagreen',
           cornerRadius: '6px',
           bgColor: 'green',
        });
       `,
        { dev: true, ...defaultOpts }
      );
      expect(output1).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".x1giqolr{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:6px;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
        };"
      `);
      expect(output1).toEqual(output2);
    });

    test('transforms variables object', () => {
      expect(
        transform(`
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
             bgColor: 'green',
             bgColorDisabled: 'lightseagreen',
             cornerRadius: '6px',
           });
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
        };"
      `);
    });

    test('transforms variables object and add stylex.inject in dev mode', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: '6px',
          });
         `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".x1giqolr{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:6px;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
        };"
      `);
    });

    test('transforms variables object in non-haste env', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: '6px',
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
        };
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
        };"
      `);
    });

    test('transforms variables object in non-haste dev env', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: '6px',
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
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".x1giqolr{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:6px;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
        };"
      `);
    });

    test('transforms multiple variables objects in a single file', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: '6px',
          });
           const buttonThemeNew = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'skyblue',
            cornerRadius: '8px',
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
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
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
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
             bgColor: 'green',
             bgColorDisabled: 'lightseagreen',
             cornerRadius: '6px',
           });
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
          }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".x1giqolr{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:6px;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
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
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: RADIUS,
          });
         `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 10;
        stylex.inject(".x1f1cezm{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:10;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1f1cezm"
        };"
      `);
    });

    test('allows refrences to local variables with static values', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const RADIUS = 10;
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: RADIUS,
          });
         `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 10;
        stylex.inject(".x1f1cezm{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:10;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1f1cezm"
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
            bgColor: \`\${name}green\`,
            bgColorDisabled: 'lightseagreen',
            cornerRadius: '6px',
          });
         `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        const name = 'light';
        stylex.inject(".x1xnxhux{--xgck17p:lightgreen;--xpegid5:lightseagreen;--xrqfjmn:6px;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1xnxhux"
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
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: RADIUS * 2,
          });
         `,
          { dev: true, ...defaultOpts }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        const RADIUS = 2;
        stylex.inject(".x1f0cjm7{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:4;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1f0cjm7"
        };"
      `);
    });

    test('transforms variables object in commonJS with nested filePath', () => {
      expect(
        transform(
          `
           ${createVarsOutput}
           const buttonThemePositive = stylex.unstable_overrideVars(buttonTheme, {
            bgColor: 'green',
            bgColorDisabled: 'lightseagreen',
            cornerRadius: '6px',
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
        export const buttonTheme = {
          bgColor: "var(--xgck17p)",
          bgColorDisabled: "var(--xpegid5)",
          cornerRadius: "var(--xrqfjmn)",
          __themeName__: "x568ih9"
        };
        stylex.inject(".x1giqolr{--xgck17p:green;--xpegid5:lightseagreen;--xrqfjmn:6px;}", 0.99);
        const buttonThemePositive = {
          $$css: true,
          x568ih9: "x1giqolr"
        };"
      `);
    });
  });
});
