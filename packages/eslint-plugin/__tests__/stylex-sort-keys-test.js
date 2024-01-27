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
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          borderColor: {
            default: 'green',
            ':hover': 'red',
            '@media (min-width: 1540px)': 1366,
          },
          borderRadius: 10,
          display: 'flex',
        },
        dynamic: (color) => ({
          backgroundColor: color,
        })
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          width: {
            default: '100%',
            '@supports (width: 100dvw)': {
              default: '100dvw',
              '@media (max-width: 1000px)': '100px',
            },
            ':hover': {
              color: 'red',
            }
          },
        },
      });`,
    },
    {
      code: `
      import { create as cr } from '@stylexjs/stylex';
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
    },
    {
      options: [{ allowLineSeparatedGroups: true }],
      code: `
      import { create as cr } from '@stylexjs/stylex';
      const styles = cr({
        button: {
          alignItems: 'center',
          display: 'flex',

          alignSelf: 'center',
          borderColor: 'black',
        }
      });
    `,
    },
    {
      options: [{ minKeys: 5 }],
      code: `
      import { create as cr } from '@stylexjs/stylex';
      const styles = cr({
        button: {
          flex: 1,
          display: 'flex',
          borderColor: 'black',
          alignItems: 'center',
        }
      });
    `,
    },
    {
      options: [{ validImports: ['a'] }],
      code: `
      import { create as cr } from 'a';
      const styles = cr({
        button: {
          borderColor: 'black',
          display: 'flex',
        }
      });
    `,
    },
    {
      code: `
        import { keyframes } from 'stylex';
        const someAnimation = keyframes({
          '0%': {
            borderColor: 'red',
            display: 'none',
          },
          '100%': {
            borderColor: 'green',
            display: 'flex',
          },
        });
      `,
    },
    {
      code: `
        import stylex from 'stylex';
        const someAnimation = stylex.keyframes({
          '0%': {
            borderColor: 'red',
            display: 'none',
          },
          '100%': {
            borderColor: 'green',
            display: 'flex',
          },
        });
      `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        nav: {
          maxWidth: {
            default: "1080px",
            "@media (min-width: 2000px)": "calc((1080 / 24) * 1rem)"
          },
          paddingVertical: 0,
        },
      });`,
    },
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
    {
      code: `
        import { create } from 'stylex';
        const styles = create({
          button: {
            alignItems: 'center',
            display: 'flex',
            borderColor: 'red',
          }
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "borderColor" should be above "display"',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const someAnimation = stylex.keyframes({
          '0%': {
            borderColor: 'red',
            display: 'none',
          },
          '100%': {
            display: 'flex',
            borderColor: 'green',
          },
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "borderColor" should be above "display"',
        },
      ],
    },
    {
      code: `
        import { keyframes as kf } from 'stylex';
        const someAnimation = kf({
          '0%': {
            borderColor: 'red',
            display: 'none',
          },
          '100%': {
            display: 'flex',
            borderColor: 'green',
          },
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "borderColor" should be above "display"',
        },
      ],
    },
    {
      code: `
      import { create } from 'stylex';
      const styles = create({
        main: {
          display: 'flex',
          borderColor: {
            default: 'green',
            '@media (min-width: 1540px)': 1366,
            ':hover': 'red',
          },
          borderRadius: 10,
        },
      });`,
      errors: [
        {
          message:
            'StyleX property key "borderColor" should be above "display"',
        },
        {
          message:
            'StyleX property key ":hover" should be above "@media (min-width: 1540px)"',
        },
      ],
    },
  ],
});
