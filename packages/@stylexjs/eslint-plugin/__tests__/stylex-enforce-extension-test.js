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

const invalidFilenameWithoutDefineVars = (extension) =>
  `Only StyleX variables defined with \`defineVars()\` can be exported from a file with a \`.stylex${extension}\` extension.`;
const invalidExportWithDefineVars =
  'Files that export `defineVars()` must not export anything else.';

ruleTester.run('stylex-enforce-extension', rule.default, {
  valid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.jsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.tsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.js',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.ts',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.mjs',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.cjs',
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
      `,
      filename: 'testComponent.custom.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
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
        export default stylex.defineVars({ background: 'blue' });
      `,
      filename: 'myComponent.stylex.jsx',
    },
    {
      options: [{ validImports: ['custom-stylex'] }],
      code: `
        import * as stylex from 'custom-stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.stylex.jsx',
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: `
        import { css } from 'a';
        export const vars = css.defineVars({});
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
      errors: [
        {
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.jsx` extension.',
        },
      ],
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
        { message: invalidExportWithDefineVars },
        { message: invalidExportWithDefineVars },
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
        { message: invalidFilenameWithoutDefineVars('.jsx') },
        { message: invalidFilenameWithoutDefineVars('.jsx') },
        { message: invalidExportWithDefineVars },
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
      errors: [{ message: invalidExportWithDefineVars }],
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
      errors: [{ message: invalidExportWithDefineVars }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.tsx',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.tsx` extension.',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.js',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.js` extension.',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.ts',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.ts` extension.',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.mjs',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.mjs` extension.',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        export const vars = stylex.defineVars({});
      `,
      filename: 'testComponent.cjs',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.cjs` extension.',
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [{ message: invalidFilenameWithoutDefineVars('.jsx') }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.tsx',
      errors: [{ message: invalidFilenameWithoutDefineVars('.tsx') }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.js',
      errors: [{ message: invalidFilenameWithoutDefineVars('.js') }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.ts',
      errors: [{ message: invalidFilenameWithoutDefineVars('.ts') }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.mjs',
      errors: [{ message: invalidFilenameWithoutDefineVars('.mjs') }],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.cjs',
      errors: [{ message: invalidFilenameWithoutDefineVars('.cjs') }],
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
            'Files that export `stylex.defineVars()` variables must end with a `.custom.jsx` extension.',
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
            'Only StyleX variables defined with `defineVars()` can be exported from a file with a `.custom.jsx` extension.',
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
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.jsx` extension.',
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
          message:
            'Files that export `stylex.defineVars()` variables must end with a `.stylex.jsx` extension.',
        },
      ],
    },
    {
      options: [{ validImports: ['custom-stylex'] }],
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message:
            'Only StyleX variables defined with `defineVars()` can be exported from a file with a `.stylex.jsx` extension.',
        },
      ],
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message:
            'Only StyleX variables defined with `defineVars()` can be exported from a file with a `.stylex.jsx` extension.',
        },
      ],
    },
  ],
});
