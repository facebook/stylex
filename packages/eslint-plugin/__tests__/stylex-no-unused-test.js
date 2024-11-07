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
            <div {...stylex.props(styles.main, styles.dynamic('red'), sizeStyles[8])}>
            </div>
          )
        }
      `,
    },
    {
      // stylex not default export
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
        export const sizeStyles = stylex.create({
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
            <div {...stylex.props(styles.main, styles.dynamic('red'))}>
            </div>
          )
        }
      `,
    },
    {
      // indirect usage of style
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
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
        const widthStyles = stylex.create({
            widthModeConstrained: {
              width: 'auto',
            },
            widthModeFlexible: {
              width: '100%',
            },
        })
        // style used as export
        function getWidthStyles() {
          return widthStyles;
        }
        export default function TestComponent({ width: number}) {
          // style used as variable
          const red = styles.dynamic('red');
          const display = width > 10 ? sizeStyles[12] :  sizeStyles[8]
          return(
            <div {...stylex.props(styles.main, red, display)}>
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
      // styles named default inline export
      code: `
      import stylex from 'stylex';
      export default styles = stylex.create({
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
    {
      // styles anonymous default inline export
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
            <div {...stylex.props(styles.dynamic('red'))}>
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
            <div {...stylex.props(styles.dynamic('red'))}>
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
    {
      // Import form: import * as stylex from '@stylexjs/stylex';
      code: `
        import * as customStylex from '@stylexjs/stylex';
        const styles = customStylex.create({
          main: {
            display: 'flex',
          },
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic('red'))}>
            </div>
          )
        }`,
      output: `
        import * as customStylex from '@stylexjs/stylex';
        const styles = customStylex.create({
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic('red'))}>
            </div>
          )
        }`,
      errors: [
        {
          message: 'Unused style detected: styles.main',
        },
      ],
    },
    {
      // Import form: import {create} from '@stylexjs/stylex';
      code: `
        import {create, attrs} from '@stylexjs/stylex';
        const styles = create({
          main: {
            display: 'flex',
          },
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic('red'))}>
            </div>
          )
        }`,
      output: `
        import {create, attrs} from '@stylexjs/stylex';
        const styles = create({
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic('red'))}>
            </div>
          )
        }`,
      errors: [
        {
          message: 'Unused style detected: styles.main',
        },
      ],
    },
    {
      // Import form: import {create as c} from '@stylexjs/stylex';
      code: `
        import {create as c} from '@stylexjs/stylex';
        const styles = c({
          main: {
            display: 'flex',
          },
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic('red'))}>
            </div>
          )
        }`,
      output: `
        import {create as c} from '@stylexjs/stylex';
        const styles = c({
          dynamic: (color) => ({
            backgroundColor: color,
          })
        });
        export default function TestComponent() {
          return(
            <div {...stylex.props(styles.dynamic('red'))}>
            </div>
          )
        }`,
      errors: [
        {
          message: 'Unused style detected: styles.main',
        },
      ],
    },
  ],
});
