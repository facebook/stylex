/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-no-lookahead-selectors');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-no-lookahead-selectors', rule.default, {
  valid: [
    {
      // stylex.when usage for ancestor selectors
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          button: {
            color: {
              default: 'black',
              [stylex.when.ancestor(':hover')]: 'red',
            },
            backgroundColor: {
              default: 'white',
              [stylex.when.ancestor(':focus')]: 'blue',
            },
          },
        });
      `,
    },
    {
      // stylex.when with previous sibling selectors
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            display: {
              default: 'none',
              [stylex.when.siblingBefore(':active')]: 'block',
            },
            opacity: {
              default: 1,
              [stylex.when.siblingBefore(':disabled')]: 0.5,
            },
          },
        });
      `,
    },
    {
      // No stylex.when usage at all
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          main: {
            color: 'red',
            backgroundColor: 'blue',
          },
        });
      `,
    },
    {
      // Different import name
      code: `
        import * as s from '@stylexjs/stylex';
        const styles = s.create({
          button: {
            color: {
              default: 'black',
              [s.when.ancestor(':hover')]: 'red',
            },
          },
        });
      `,
    },
    {
      // Custom import configuration
      options: [{ validImports: ['custom-stylex'] }],
      code: `
        import * as stylex from 'custom-stylex';
        const styles = stylex.create({
          button: {
            color: {
              default: 'black',
              [stylex.when.ancestor(':hover')]: 'red',
            },
          },
        });
      `,
    },
    {
      // Named import
      code: `
        import { create, when } from '@stylexjs/stylex';
        const styles = create({
          button: {
            color: {
              default: 'black',
              [when.ancestor(':hover')]: 'red',
            },
          },
        });
      `,
    },
  ],
  invalid: [
    {
      // stylex.when.anySibling usage
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          button: {
            color: {
              default: 'black',
              [stylex.when.anySibling(':active')]: 'red',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.anySibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // stylex.when.descendant usage
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            backgroundColor: {
              default: 'white',
              [stylex.when.descendant(':focus')]: 'black',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.descendant has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // stylex.when.nextSibling usage
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {
            marginTop: {
              default: '0px',
              [stylex.when.nextSibling(':active')]: '10px',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.nextSibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Multiple lookahead selectors in one file
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          button: {
            color: {
              default: 'black',
              [stylex.when.anySibling(':active')]: 'red',
            },
            backgroundColor: {
              default: 'white',
              [stylex.when.descendant(':dark')]: 'black',
            },
            padding: {
              default: 'none',
              [stylex.when.nextSibling(':selected')]: '10px',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.anySibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
        {
          message:
            'stylex.when.descendant has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
        {
          message:
            'stylex.when.nextSibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Different import name with lookahead selector
      code: `
        import * as s from '@stylexjs/stylex';
        const styles = s.create({
          button: {
            color: {
              default: 'black',
              [s.when.anySibling(':active')]: 'red',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.anySibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Custom import configuration with lookahead selector
      options: [{ validImports: ['custom-stylex'] }],
      code: `
        import * as stylex from 'custom-stylex';
        const styles = stylex.create({
          button: {
            color: {
              default: 'black',
              [stylex.when.descendant(':hover')]: 'red',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.descendant has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Mixed valid and invalid usage
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          button: {
            color: {
              default: 'black',
              [stylex.when.ancestor(':hover')]: 'red', // valid
              [stylex.when.anySibling(':active')]: 'blue', // invalid
            },
            padding: {
              default: 0,
              [stylex.when.siblingBefore(':focus')]: 10, // valid
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.anySibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Lookahead selector in nested styles
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            ':hover': {
              color: {
                default: 'black',
                [stylex.when.nextSibling(':active')]: 'red',
              },
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.nextSibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Lookahead selector in dynamic styles
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          dynamic: (isActive) => ({
            color: {
              default: 'black',
              [stylex.when.descendant(':dark')]: 'white',
            },
            backgroundColor: isActive ? 'blue' : 'transparent',
          }),
        });
      `,
      errors: [
        {
          message:
            'stylex.when.descendant has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
    {
      // Named import with lookahead selector
      code: `
        import { create, when } from '@stylexjs/stylex';
        const styles = create({
          button: {
            color: {
              default: 'black',
              [when.anySibling(':hover')]: 'white',
            },
          },
        });
      `,
      errors: [
        {
          message:
            'stylex.when.anySibling has limited browser support. See https://caniuse.com/css-has for browser compatibility.',
        },
      ],
    },
  ],
});
