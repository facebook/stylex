/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-sort-keys');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-sort-keys', rule.default, {
  valid: [
    `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          borderColor: {
            default: 'green',
            '@media (min-width: 1540px)': 1366,
            ':hover': 'red',
          },
          borderRadius: 10,
          display: 'flex',
        },
        dynamic: (color) => ({
          backgroundColor: color,
        })
      })
    `,
    `
      import {create as cr} from '@stylexjs/stylex';
      const obj = { fontSize: '12px' };
      const styles = cr({
        button: {
          alignItems: 'center',
          display: 'flex',
          ...obj,
          alignSelf: 'center',
          borderColor: 'black',
        }
      });
    `,
  ],
  invalid: [
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            padding: 10,
            animationDuration: '100ms',
            fontSize: 12,
          }
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "animationDuration" should be above "padding"',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const obj = { fontSize: '12px' }; 
        const styles = stylex.create({
          button: {
            alignItems: 'center',
            display: 'flex',
            ...obj,
            borderColor: 'red',
            alignSelf: 'center',
          }
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "alignSelf" should be above "borderColor"',
        },
      ],
    },
  ],
});
