/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: '/stylex/packages/',
            type: 'commonJS',
          },
          ...opts,
        },
      ],
    ],
  });

  return { code, metadata };
}

/**
 * Fixture factory
 *
 * This is used to create a consistent fixture across all the tests for
 * different ways of importing StyleX. The fixture uses all of the
 * StyleX exports to make sure they are transformed as expected.
 */

const defaultImportText = '* as stylex';
const defaultImportSource = '@stylexjs/stylex';
const defaultImportMap = {
  create: 'stylex.create',
  createTheme: 'stylex.createTheme',
  defineConsts: 'stylex.defineConsts',
  defineVars: 'stylex.defineVars',
  firstThatWorks: 'stylex.firstThatWorks',
  keyframes: 'stylex.keyframes',
  positionTry: 'stylex.positionTry',
  props: 'stylex.props',
};

function createStylesFixture({
  // Used to set the import statement
  importText: _importText,
  // Used to set the importSource for the transform
  importSource: _importSource,
  // The importMap is used to check that renamed exports works
  importMap: _importMap,
} = {}) {
  const importText = _importText || defaultImportText;
  const importSource = _importSource || defaultImportSource;
  const importMap = _importMap || defaultImportMap;

  const {
    create,
    createTheme,
    defineConsts,
    defineVars,
    firstThatWorks,
    keyframes,
    positionTry,
    props,
  } = importMap;

  const from = importSource?.from || importSource;

  // Generate the defineConsts and defineVars output first.
  // This is inlined into the fixture so that createTheme works.
  const defineConstsAndVarsOutput = transform(
    `
    import ${importText} from '${from}';
    export const constants = ${defineConsts}({
      mediaQuery: '@media (min-width: 768px)',
    });
    export const vars = ${defineVars}({
      bar: 'left'
    });
  `,
    {
      filename: '/stylex/packages/vars.stylex.js',
      importSources: [importSource],
    },
  ).code;

  return `
    ${defineConstsAndVarsOutput}
    const fallback1 = ${positionTry}({
      anchorName: '--myAnchor',
      positionArea: 'top left',
    });
    const fallback2 = ${positionTry}({
      anchorName: '--otherAnchor',
      top: 'anchor(bottom)',
      insetInlineStart: 'anchor(start)',
    });
    const styles = ${create}({
      root: {
        animationName: ${keyframes}({
          from: {
            backgroundColor: 'yellow'
          },
          to: {
            backgroundColor: 'orange'
          },
        }),
        positionTryFallbacks: \`\${fallback1}, \${fallback2}\`,
        color: {
          default: 'red',
          [constants.mediaQuery]: 'blue'
        },
        position: ${firstThatWorks}('sticky', 'fixed')
      }
    });

    const theme = ${createTheme}(vars, {
      bar: 'green'
    });

    ${props}(styles.root, theme);
  `;
}

/**
 * Tests
 */

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex imports', () => {
    let expectedImportTestMetadata = null;
    beforeEach(() => {
      // import tests (using the fixture) should produce the same metadata
      expectedImportTestMetadata = transform(createStylesFixture()).metadata;
    });

    test('import: none', () => {
      const { code, metadata } = transform(`
        export const styles = stylex.create({
          root: {
            color: 'red'
          }
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "export const styles = stylex.create({
          root: {
            color: 'red'
          }
        });"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [],
        }
      `);
    });

    test('import: non-stylex', () => {
      const { code, metadata } = transform(`
        import {foo, bar} from 'other';
      `);

      expect(code).toMatchInlineSnapshot(
        '"import { foo, bar } from \'other\';"',
      );

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [],
        }
      `);
    });

    test('require: non-stylex', () => {
      const { code, metadata } = transform(`
        const {foo, bar} = require('other');
      `);

      expect(code).toMatchInlineSnapshot(`
        "const {
          foo,
          bar
        } = require('other');"
      `);

      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [],
        }
      `);
    });

    test('import: wildcard (the default)', () => {
      const fixture = createStylesFixture();

      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        stylex.props(styles.root, theme);"
      `);

      expect(expectedImportTestMetadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "--x5jppmd",
              {
                "ltr": "@position-try --x5jppmd {anchor-name:anchor-name;anchor-name:--myAnchor;position-area:position-area;position-area:top left;}",
                "rtl": "@position-try --x5jppmd {anchor-name:--myAnchor;position-area:top left;}",
              },
              1,
            ],
            [
              "--x17pzx6",
              {
                "ltr": "@position-try --x17pzx6 {anchor-name:anchor-name;anchor-name:--otherAnchor;inset-inline-start:inset-inline-start;inset-inline-start:anchor(start);top:top;top:anchor(bottom);}",
                "rtl": "@position-try --x17pzx6 {anchor-name:--otherAnchor;inset-inline-start:anchor(start);top:anchor(bottom);}",
              },
              1,
            ],
            [
              "xjx6k13-B",
              {
                "ltr": "@keyframes xjx6k13-B{from{background-color:yellow;}to{background-color:orange;}}",
                "rtl": null,
              },
              1,
            ],
            [
              "x1qar0u3",
              {
                "ltr": ".x1qar0u3{animation-name:xjx6k13-B}",
                "rtl": null,
              },
              3000,
            ],
            [
              "x7cint9",
              {
                "ltr": ".x7cint9{position-try-fallbacks:--x5jppmd,--x17pzx6}",
                "rtl": null,
              },
              3000,
            ],
            [
              "x1e2nbdu",
              {
                "ltr": ".x1e2nbdu{color:red}",
                "rtl": null,
              },
              3000,
            ],
            [
              "x14693no",
              {
                "ltr": "@media (min-width: 768px){.x14693no.x14693no{color:blue}}",
                "rtl": null,
              },
              3200,
            ],
            [
              "x15oojuh",
              {
                "ltr": ".x15oojuh{position:fixed;position:sticky}",
                "rtl": null,
              },
              3000,
            ],
            [
              "xfnndu4",
              {
                "ltr": ".xfnndu4, .xfnndu4:root{--x1hi1hmf:green;}",
                "rtl": null,
              },
              0.5,
            ],
          ],
        }
      `);
      expect(metadata).toEqual(expectedImportTestMetadata);
    });

    test('import: wildcard (non-stylex name)', () => {
      const fixture = createStylesFixture({
        importText: '* as foo',
        importMap: {
          create: 'foo.create',
          createTheme: 'foo.createTheme',
          defineConsts: 'foo.defineConsts',
          defineVars: 'foo.defineVars',
          firstThatWorks: 'foo.firstThatWorks',
          keyframes: 'foo.keyframes',
          positionTry: 'foo.positionTry',
          props: 'foo.props',
        },
      });

      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import * as foo from '@stylexjs/stylex';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        foo.props(styles.root, theme);"
      `);

      expect(metadata).toEqual(expectedImportTestMetadata);
    });

    test('import: named', () => {
      const fixture = createStylesFixture({
        importText:
          '{create, createTheme, defineConsts, defineVars, firstThatWorks, keyframes, positionTry, props}',
        importMap: {
          create: 'create',
          createTheme: 'createTheme',
          defineConsts: 'defineConsts',
          defineVars: 'defineVars',
          firstThatWorks: 'firstThatWorks',
          keyframes: 'keyframes',
          positionTry: 'positionTry',
          props: 'props',
        },
      });

      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import { create, createTheme, defineConsts, defineVars, firstThatWorks, keyframes, positionTry, props } from '@stylexjs/stylex';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        props(styles.root, theme);"
      `);

      expect(metadata).toEqual(expectedImportTestMetadata);
    });

    test('import: named alias', () => {
      const fixture = createStylesFixture({
        importText: `{
          create as _create,
          createTheme as _createTheme,
          defineConsts as _defineConsts,
          defineVars as _defineVars,
          firstThatWorks as _firstThatWorks,
          keyframes as _keyframes,
          positionTry as _positionTry,
          props as _props
        }`,
        importMap: {
          create: '_create',
          createTheme: '_createTheme',
          defineConsts: '_defineConsts',
          defineVars: '_defineVars',
          firstThatWorks: '_firstThatWorks',
          keyframes: '_keyframes',
          positionTry: '_positionTry',
          props: '_props',
        },
      });

      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import { create as _create, createTheme as _createTheme, defineConsts as _defineConsts, defineVars as _defineVars, firstThatWorks as _firstThatWorks, keyframes as _keyframes, positionTry as _positionTry, props as _props } from '@stylexjs/stylex';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        _props(styles.root, theme);"
      `);

      expect(metadata).toEqual(expectedImportTestMetadata);
    });

    test('importSources (string)', () => {
      const importSource = 'foo-bar';
      const fixture = createStylesFixture({
        importText: '* as stylex',
        importSource,
      });

      const options = { importSources: [importSource] };
      const { code, metadata } = transform(fixture, options);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from 'foo-bar';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        stylex.props(styles.root, theme);"
      `);

      expect(metadata).toEqual(expectedImportTestMetadata);
    });

    test('importSources (object)', () => {
      const importSource = { as: 'css', from: 'react-strict-dom' };
      const fixture = createStylesFixture({
        importText: '{css, html}',
        importSource,
        importMap: {
          create: 'css.create',
          createTheme: 'css.createTheme',
          defineConsts: 'css.defineConsts',
          defineVars: 'css.defineVars',
          firstThatWorks: 'css.firstThatWorks',
          keyframes: 'css.keyframes',
          positionTry: 'css.positionTry',
          props: 'css.props',
        },
      });

      // as: aliases the exports (e.g., "* as stylex" => "css")
      // from: aliases the package name (e.g., "@stylexjs/stylex" => "react-strict-dom")
      const options = { importSources: [importSource] };
      const { code, metadata } = transform(fixture, options);

      expect(code).toMatchInlineSnapshot(`
        "import { css, html } from 'react-strict-dom';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        css.props(styles.root, theme);"
      `);

      expect(metadata).toEqual(expectedImportTestMetadata);
    });

    // This is only used at Meta, and not supported in OSS by the runtime.
    // This tests both the built-in "importSource" of "stylex", and special handling of default export.
    test('[META-ONLY] import: default', () => {
      const fixture = createStylesFixture({
        importText: 'stylex',
        importSource: 'stylex',
      });

      const { code, metadata } = transform(fixture);

      expect(code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const constants = {
          mediaQuery: "@media (min-width: 768px)"
        };
        export const vars = {
          bar: "var(--x1hi1hmf)",
          __themeName__: "xop34xu"
        };
        const fallback1 = "--x5jppmd";
        const fallback2 = "--x17pzx6";
        const styles = {
          root: {
            kKVMdj: "x1qar0u3",
            k9M3vk: "x7cint9",
            kMwMTN: "x1e2nbdu x14693no",
            kVAEAm: "x15oojuh",
            $$css: true
          }
        };
        const theme = {
          $$css: true,
          xop34xu: "xfnndu4 xop34xu"
        };
        stylex.props(styles.root, theme);"
      `);

      expect(metadata).toEqual(expectedImportTestMetadata);
    });
  });

  describe('[transform] stylex exports', () => {
    let expectedExportTestMetadata = null;
    const fixture = `stylex.create({
      root: {
        color: 'red',
      }
    })`;

    beforeEach(() => {
      // Export tests (using the fixture) should produce the same metadata
      expectedExportTestMetadata = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        const styles = ${fixture};
      `,
      ).metadata;
    });

    test('export: named property', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const styles = ${fixture};
        export {styles}
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const styles = {
          root: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          }
        };
        export { styles };"
      `);

      expect(metadata).toEqual(expectedExportTestMetadata);
    });

    test('export: named declaration', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = ${fixture};
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const styles = {
          root: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          }
        };"
      `);

      expect(metadata).toEqual(expectedExportTestMetadata);
    });

    test('export: default', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export default (${fixture});
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export default {
          root: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          }
        };"
      `);

      expect(metadata).toEqual(expectedExportTestMetadata);
    });

    test('module.export', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        const styles = ${fixture};
        module.export = styles;
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const styles = {
          root: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          }
        };
        module.export = styles;"
      `);

      expect(metadata).toEqual(expectedExportTestMetadata);
    });
  });
});
