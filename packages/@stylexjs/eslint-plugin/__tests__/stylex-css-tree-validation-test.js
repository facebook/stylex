/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-valid-styles');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-valid-styles [cssValueValidation]', rule.default, {
  valid: [
    // Valid color values should pass css-tree validation
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            color: 'red',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Valid hex color
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            backgroundColor: '#ff0000',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Valid numeric value
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            opacity: 0.5,
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Valid length value
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            fontSize: '16px',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Valid CSS function value
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            color: 'rgb(255, 0, 0)',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Valid transform value
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            transform: 'translateX(10px)',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Dynamic values (function args) should be skipped
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: (color) => ({
            color: color,
          })
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // null value should be skipped (it's valid in StyleX for unsetting)
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            color: null,
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // inherit/initial/unset should pass
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            color: 'inherit',
            display: 'initial',
            margin: 'unset',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Numeric 0 for margin/padding
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            margin: 0,
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // CSS custom property values should be skipped
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            '--myColor': 'anything-goes-here',
          }
        });
      `,
      options: [{ cssValueValidation: true, allowRawCSSVars: true }],
    },
    // When cssValueValidation is off (default), invalid CSS values that pass
    // the existing validators should still be allowed
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            color: 'notacolor',
          }
        });
      `,
      options: [{ cssValueValidation: false }],
    },
    // Valid multi-value shorthand
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            transition: 'opacity 0.3s ease',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Valid calc() expression
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            width: 'calc(100% - 20px)',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
    // Vendor-prefixed properties with valid values
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            WebkitFontSmoothing: 'antialiased',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
    },
  ],
  invalid: [
    // Invalid color value that slips through existing validators (which accept any string for color)
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            color: 'notacolor',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
      errors: [
        {
          message: /Invalid CSS value for "color"/,
        },
      ],
    },
    // Invalid background-color value
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            backgroundColor: 'absolutely-not-valid',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
      errors: [
        {
          message: /Invalid CSS value for "backgroundColor"/,
        },
      ],
    },
    // Invalid transition value
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          root: {
            transition: '???invalid',
          }
        });
      `,
      options: [{ cssValueValidation: true }],
      errors: [
        {
          message: /Invalid CSS value for "transition"/,
        },
      ],
    },
  ],
});
