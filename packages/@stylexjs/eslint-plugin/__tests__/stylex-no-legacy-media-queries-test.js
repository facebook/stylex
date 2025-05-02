/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-no-legacy-media-queries');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-no-legacy-media-queries', rule.default, {
  valid: [
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          '::placeholder': {
            color: '#999',
          },
          width: {
            default: '100%',
            '@media (min-width: 600px)': {
              default: '50%',
              '@media screen': '40%'
            },
          }
        },
        ':dummy': {
          color: '#999',
        }
      });
    `,
    },
  ],
  invalid: [
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          width: '100%',
          '@media (min-width: 600px)': {
            width: '50%',
          }
        }
      });
      `,
      errors: [
        {
          message:
            'This media query syntax is deprecated. Use the new syntax specified here: https://stylexjs.com/docs/learn/styling-ui/defining-styles/#media-queries-and-other--rules',
        },
      ],
    },
    {
      code: `
      import {create} from '@stylexjs/stylex';
      const styles = create({
        main: {
          width: '100%',
          ':hover': {
            width: '50%',
          }
        }
      });
      `,
      errors: [
        {
          message:
            'This pseudo class syntax is deprecated. Use the new syntax specified here: https://stylexjs.com/docs/learn/styling-ui/defining-styles/#pseudo-classes',
        },
      ],
    },
  ],
});
