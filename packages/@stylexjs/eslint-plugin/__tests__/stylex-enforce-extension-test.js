/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../src/stylex-enforce-extension');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

const invalidFilenameWithRestrictedExports = (suggestedExtension) =>
  `Files that export variables from \`stylex.defineVars()\` or \`stylex.defineConsts()\` must end with a \`${suggestedExtension}\` extension.`;
const invalidFilenameWithoutRestrictedExports = (suggestedExtension) =>
  `Only variables from \`stylex.defineVars()\` or \`stylex.defineConsts()\` can be exported from a file with a \`${suggestedExtension}\` extension.`;
const invalidExportFromThemeFiles =
  'Files that export variables from `stylex.defineVars()` or `stylex.defineConsts()` must not export anything else.';

ruleTester.run('stylex-enforce-extension', rule.default, {
  valid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.jsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.tsx',
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.jsx',
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.tsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom.cjs' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.custom.tsx',
      options: [{ themeFileExtension: '.custom' }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.jsx',
      options: [{ themeFileExtension: '.custom' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const consts = stylex.defineConsts({ color: 'red' });
      `,
      filename: 'myComponent.stylex.jsx',
    },
    {
      options: [{ validImports: ['custom-stylex'] }],
      code: `
        import * as stylex from 'custom-stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.jsx',
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: `
        import { css } from 'a';
        export const vars = css.defineVars({});
        export const consts = css.defineConsts({});
      `,
      filename: 'testComponent.stylex.jsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.js',
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.js',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.ts',
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.ts',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.cjs',
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.cjs',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.stylex.mjs',
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.mjs',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      options: [{ legacyAllowMixedExports: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      options: [{ legacyAllowMixedExports: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.tsx',
      options: [{ legacyAllowMixedExports: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.tsx',
      options: [{ legacyAllowMixedExports: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.ts',
      options: [{ legacyAllowMixedExports: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.js',
      options: [{ legacyAllowMixedExports: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.custom.ts',
      options: [
        { legacyAllowMixedExports: true, themeFileExtension: '.custom' },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.custom.js',
      options: [
        { legacyAllowMixedExports: true, themeFileExtension: '.custom' },
      ],
    },
  ],

  invalid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.jsx',
      errors: [
        { message: invalidFilenameWithRestrictedExports('.stylex.jsx') },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.jsx',
      errors: [
        { message: invalidFilenameWithRestrictedExports('.stylex.jsx') },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = someFunction();
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports('.stylex.jsx') },
        { message: invalidFilenameWithoutRestrictedExports('.stylex.jsx') },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'blue',
        });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.tsx',
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red',
        });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'blue',
        });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.js',
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({
          color: 'red',
        });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.cjs',
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.tsx',
      errors: [
        { message: invalidFilenameWithRestrictedExports('.stylex.tsx') },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports('.stylex.jsx') },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.js',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports('.stylex.js') },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.ts',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports('.stylex.ts') },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.cjs',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports('.stylex.cjs') },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.mjs',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports('.stylex.mjs') },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.jsx',
      options: [{ themeFileExtension: '.custom' }],
      errors: [
        {
          message: invalidFilenameWithRestrictedExports('.custom.jsx'),
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
      errors: [
        {
          message: invalidFilenameWithRestrictedExports('.custom.jsx'),
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom' }],
      errors: [
        {
          message: invalidFilenameWithoutRestrictedExports('.custom.jsx'),
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.tsx',
      options: [{ themeFileExtension: '.custom' }],
      errors: [
        {
          message: invalidFilenameWithRestrictedExports('.custom.tsx'),
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'test.custom.ts',
      options: [{ themeFileExtension: '.custom' }],
      errors: [
        {
          message: invalidFilenameWithoutRestrictedExports('.custom.ts'),
        },
      ],
    },
    {
      options: [{ validImports: ['custom-stylex'] }],
      code: `
        import * as stylex from 'custom-stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.jsx',
      errors: [
        {
          message: invalidFilenameWithRestrictedExports('.stylex.jsx'),
        },
      ],
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: `
        import { css } from 'a';
        export const vars = css.defineVars({});
      `,
      filename: 'testComponent.jsx',
      errors: [
        {
          message: invalidFilenameWithRestrictedExports('.stylex.jsx'),
        },
      ],
    },
    {
      options: [{ validImports: ['custom-stylex'] }],
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message: invalidFilenameWithoutRestrictedExports('.stylex.jsx'),
        },
      ],
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message: invalidFilenameWithoutRestrictedExports('.stylex.jsx'),
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      options: [{ legacyAllowMixedExports: false }],
      errors: [{ message: invalidExportFromThemeFiles }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      options: [{ legacyAllowMixedExports: false }],
      errors: [{ message: invalidExportFromThemeFiles }],
    },
  ],
});
