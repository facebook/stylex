/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-validate-media-queries');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-validate-media-queries', rule.default, {
  valid: [
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        main: {
          color: 'red',
        },
      })
    `,
    },
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        main: {
          color: {
            '@media (min-width: 768px)': 'blue',
            '@media (min-width: 1024px)': 'green',
          },
        },
      })
    `,
    },
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        main: {
          color: {
            '@media (max-width: 768px)': 'red',
            default: 'blue',
          },
        },
      })
    `,
    },
  ],
  invalid: [
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        main: {
          color: {
            '@media not ((not (min-width: 400px))': 'blue',
          },
        },
      })
    `,
      errors: [
        {
          message: /Media query order may not be respected/,
        },
      ],
    },
  ],
});
