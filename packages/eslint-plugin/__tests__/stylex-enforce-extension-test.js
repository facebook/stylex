/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../src/stylex-enforce-extension');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

const invalidFilenameWithDefineVars =
  'Files that export StyleX variables defined with `stylex.defineVars()` must end with the `.stylex.jsx` or `.stylex.tsx` extension.';
const invalidFilenameWithoutDefineVars =
  'Only StyleX variables defined with `stylex.defineVars()` can be exported from a file with the `.stylex.jsx` or `.stylex.tsx` extension.';
const invalidExportWithDefineVars =
  'Files that export `stylex.defineVars()` must not export anything else.';

ruleTester.run('stylex-enforce-extension', rule.default, {
  valid: [
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.stylex.jsx',
    },
    {
      code: 'export const vars = stylex.defineVars({});',
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
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
    },
    {
      code: 'export const vars = stylex.defineVars({});',
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
        export const vars = stylex.defineVars({ color: 'red' });
        export default stylex.defineVars({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
    },
  ],

  invalid: [
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.jsx',
      errors: [{ message: invalidFilenameWithDefineVars }],
    },
    {
      code: `
        export const vars = stylex.defineVars({ color: 'red' });
        export const somethingElse = someFunction();
        export default stylex.defineVars({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [
        { message: invalidExportWithDefineVars },
        { message: invalidExportWithDefineVars },
      ],
    },
    {
      code: `
        export const vars = someFunction();
        export const somethingElse = someFunction();
        export default stylex.defineVars({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [
        { message: invalidFilenameWithoutDefineVars },
        { message: invalidFilenameWithoutDefineVars },
        { message: invalidExportWithDefineVars },
      ],
    },
    {
      code: `
        export const vars = stylex.defineVars({
          color: 'blue',
        });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.tsx',
      errors: [{ message: invalidExportWithDefineVars }],
    },
    {
      code: `
        export const vars = stylex.defineVars({
          color: 'red',
        });
        export const somethingElse = someFunction();
      `,
      filename: 'myComponent.stylex.jsx',
      errors: [{ message: invalidExportWithDefineVars }],
    },
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.tsx',
      errors: [{ message: invalidFilenameWithDefineVars }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [{ message: invalidFilenameWithoutDefineVars }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.tsx',
      errors: [{ message: invalidFilenameWithoutDefineVars }],
    },
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
      errors: [
        {
          message:
            'Files that export StyleX variables defined with `stylex.defineVars()` must end with the `.custom.jsx` or `.custom.tsx` extension.',
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
            'Only StyleX variables defined with `stylex.defineVars()` can be exported from a file with the `.custom.jsx` or `.custom.tsx` extension.',
        },
      ],
    },
  ],
});
