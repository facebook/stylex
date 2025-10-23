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

const invalidFilenameWithRestrictedExports =
  'Files that export StyleX variables/constants must end with the `.stylex.jsx` or `.stylex.tsx` extension.';
const invalidFilenameWithoutRestrictedExports =
  'Only StyleX variables/constants can be exported from a file with the `.stylex.jsx` or `.stylex.tsx` extension.';
const invalidExportFromThemeFiles =
  'Files that export StyleX variables/constants must not export anything else.';

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
      options: [{ themeFileExtension: '.custom.jsx' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.custom.tsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const consts = stylex.defineConsts({ color: 'red' });
        export default stylex.defineVars({ background: 'blue' });
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
  ],

  invalid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.jsx',
      errors: [{ message: invalidFilenameWithRestrictedExports }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({});
      `,
      filename: 'testComponent.jsx',
      errors: [{ message: invalidFilenameWithRestrictedExports }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
        export default stylex.defineVars({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [
        { message: invalidExportFromThemeFiles },
        { message: invalidExportFromThemeFiles },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const consts = stylex.defineConsts({ color: 'red' });
        export const somethingElse = someFunction();
        export default stylex.defineConsts({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [
        { message: invalidExportFromThemeFiles },
        { message: invalidExportFromThemeFiles },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = someFunction();
        export const somethingElse = someFunction();
        export default stylex.defineVars({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [
        { message: invalidFilenameWithoutRestrictedExports },
        { message: invalidFilenameWithoutRestrictedExports },
        { message: invalidExportFromThemeFiles },
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
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.tsx',
      errors: [{ message: invalidFilenameWithRestrictedExports }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [{ message: invalidFilenameWithoutRestrictedExports }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.tsx',
      errors: [{ message: invalidFilenameWithoutRestrictedExports }],
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
          message:
            'Files that export StyleX variables/constants must end with the `.custom.jsx` or `.custom.tsx` extension.',
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
      errors: [
        {
          message:
            'Only StyleX variables/constants can be exported from a file with the `.custom.jsx` or `.custom.tsx` extension.',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.tsx',
      options: [{ themeFileExtension: '.custom.ts' }],
      errors: [
        {
          message:
            'Files that export StyleX variables/constants must end with the `.custom.ts` extension.',
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'test.custom.ts',
      options: [{ themeFileExtension: '.custom.js' }],
      errors: [
        {
          message:
            'Only StyleX variables/constants can be exported from a file with the `.custom.js` or `.custom.ts` extension.',
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
          message: invalidFilenameWithRestrictedExports,
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
          message: invalidFilenameWithRestrictedExports,
        },
      ],
    },
    {
      options: [{ validImports: ['custom-stylex'] }],
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message: invalidFilenameWithoutRestrictedExports,
        },
      ],
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message: invalidFilenameWithoutRestrictedExports,
        },
      ],
    },
  ],
});
