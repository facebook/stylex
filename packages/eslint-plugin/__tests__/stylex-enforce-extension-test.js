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
  ],

  invalid: [
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.jsx',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars` must have a `.stylex.jsx` or `.stylex.tsx` extension.',
        },
      ],
    },
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.tsx',
      errors: [
        {
          message:
            'Files that export `stylex.defineVars` must have a `.stylex.jsx` or `.stylex.tsx` extension.',
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.jsx',
      errors: [
        {
          message:
            'Files that do not export `stylex.defineVars` must not have a `.stylex.jsx` or `.stylex.tsx` extension.',
        },
      ],
    },
    {
      code: 'export const somethingElse = {};',
      filename: 'testComponent.stylex.tsx',
      errors: [
        {
          message:
            'Files that do not export `stylex.defineVars` must not have a `.stylex.jsx` or `.stylex.tsx` extension.',
        },
      ],
    },
    {
      code: 'export const vars = stylex.defineVars({});',
      filename: 'testComponent.jsx',
      options: [{ themeFileExtension: '.custom.jsx' }],
      errors: [
        {
          message:
            'Files that export `stylex.defineVars` must have a `.custom.jsx` or `.custom.tsx` extension.',
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
            'Files that do not export `stylex.defineVars` must not have a `.custom.jsx` or `.custom.tsx` extension.',
        },
      ],
    },
  ],
});
