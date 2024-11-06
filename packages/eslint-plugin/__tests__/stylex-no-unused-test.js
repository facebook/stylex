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
const rule = require('../src/stylex-no-unused');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-no-unused', rule.default, {
  valid: [
    {
      // all style used; identifier and literal
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
        });
        const sizeStyles = stylex.create({
          [8]: {
            height: 8,
            width: 8,
          },
          [10]: {
            height: 10,
            width: 10,
          },
          [12]: {
            height: 12,
            width: 12,
          },
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.main, styles.dynamic, sizeStyles[8])}>
            </div>
          )
        }
      `,
    },
    {
      // styles default export
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
      });
      export default styles;
    `,
    },
    {
      // styles anonymous default export
      code: `
      import stylex from 'stylex';
      export default stylex.create({
        maxDimensionsModal: {
          maxWidth: '90%',
          maxHeight: '90%',
        },
        halfWindowWidth: {
          width: '50vw',
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
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic)}>
            </div>
          )
        }
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic)}>
            </div>
          )
        }
      `,
      errors: [
        {
          message: 'Unused style detected: styles.main',
        },
      ],
    },
  ],
});
