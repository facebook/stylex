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
const rule = require('../src/stylex-margin-padding-shorthand');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-sort-keys', rule.default, {
  valid: [
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          marginInlineEnd: '14px',
          marginInlineStart: '14px',
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          margin: 10,
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          padding: 'calc(0.5 * 100px) !important',
        },
      })
    `,
    },
  ],
  invalid: [
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            margin: '10px 12px 13px 14px',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginTop: '10px',
            marginInlineEnd: '12px',
            marginBottom: '13px',
            marginInlineStart: '14px',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands like margin: 10px 12px 13px 14px are not supported in styleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            margin: '10em 1em',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginTop: '10em',
            marginInlineEnd: '1em',
            marginBottom: '10em',
            marginInlineStart: '1em',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands like margin: 10em 1em are not supported in styleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            margin: '10em 1em !important',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginTop: '10em !important',
            marginInlineEnd: '1em !important',
            marginBottom: '10em !important',
            marginInlineStart: '1em !important',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands like margin: 10em 1em !important are not supported in styleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginInline: '10em 1em !important',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginInlineStart: '10em 1em !important',
            marginInlineEnd: '10em 1em !important',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands like marginInline: 10em 1em !important are not supported in styleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingTop: '10em !important',
            paddingBottom: '1em !important',
            paddingStart: '10em !important',
            paddingEnd: '1em !important',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingTop: '10em !important',
            paddingBottom: '1em !important',
            paddingInlineStart: '10em !important',
            paddingInlineEnd: '1em !important',
          },
        });
      `,
      errors: [
        {
          message:
            'Use paddingInlineStart instead of legacy formats like paddingStart to adhere to logical property naming.',
        },
        {
          message:
            'Use paddingInlineEnd instead of legacy formats like paddingEnd to adhere to logical property naming.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            padding: '10em 1em !important',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingTop: '10em !important',
            paddingInlineEnd: '1em !important',
            paddingBottom: '10em !important',
            paddingInlineStart: '1em !important',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands like padding: 10em 1em !important are not supported in styleX. Separate into individual properties.',
        },
      ],
    },
  ],
});
