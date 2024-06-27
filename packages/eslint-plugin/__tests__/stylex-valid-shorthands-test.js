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
const rule = require('../src/stylex-valid-shorthands');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-valid-shorthands', rule.default, {
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
          marginInline: 10,
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          paddingInline: 10,
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          marginBlock: 10,
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          paddingBlock: 10,
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          padding: 'calc(0.5 * 100px)',
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          marginTop: '10em',
          marginInlineEnd: '5em',
          marginBottom: '15em',
          marginInlineStart: '25em',
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
            'Property shorthands using multiple values like margin: 10px 12px 13px 14px are not supported in StyleX. Separate into individual properties.',
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
            'Property shorthands using multiple values like margin: 10em 1em are not supported in StyleX. Separate into individual properties.',
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
            'Property shorthands using multiple values like margin: 10em 1em are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginInline: '10em 1em',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginInlineStart: '10em',
            marginInlineEnd: '1em',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like marginInline: 10em 1em are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginBlock: '10em 1em',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginBlockStart: '10em',
            marginBlockEnd: '1em',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like marginBlock: 10em 1em are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingBlock: '10em 1em',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingBlockStart: '10em',
            paddingBlockEnd: '1em',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like paddingBlock: 10em 1em are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingTop: '10em',
            paddingBottom: '1em',
            paddingStart: '10em',
            paddingEnd: '1em',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingTop: '10em',
            paddingBottom: '1em',
            paddingInlineStart: '10em',
            paddingInlineEnd: '1em',
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
            padding: '10em 1em',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            paddingTop: '10em',
            paddingInlineEnd: '1em',
            paddingBottom: '10em',
            paddingInlineStart: '1em',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like padding: 10em 1em are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
  ],
});
