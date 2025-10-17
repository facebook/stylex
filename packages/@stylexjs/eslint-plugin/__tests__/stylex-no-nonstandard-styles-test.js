/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-no-nonstandard-styles');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-no-nonstandard-styles', rule.default, {
  valid: [
    `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        validStyle: {
          marginInlineStart: "10px",
          marginInlineEnd: "5px",
          marginInline: "15px",
          marginBlock: "20px",
          paddingInlineStart: "8px",
          paddingInlineEnd: "12px",
          paddingInline: "10px",
          paddingBlock: "16px",
        },
      });
    `,
    `
      import {create} from '@stylexjs/stylex';
      const styles = create({
        validStyle: {
          marginInlineStart: "10px",
          marginInlineEnd: "5px",
          marginInline: "15px",
          marginBlock: "20px",
          paddingInlineStart: "8px",
          paddingInlineEnd: "12px",
          paddingInline: "10px",
          paddingBlock: "16px",
        },
      });
    `,
    `
      const {create} = require('@stylexjs/stylex');
      const styles = create({
        validStyle: {
          marginInlineStart: "10px",
          marginInlineEnd: "5px",
          marginInline: "15px",
          marginBlock: "20px",
          paddingInlineStart: "8px",
          paddingInlineEnd: "12px",
          paddingInline: "10px",
          paddingBlock: "16px",
        },
      });
    `,
    `
      const stylex = require('@stylexjs/stylex');
      
      const styles = stylex.create({
        validStyle: {
          marginInlineStart: "10px",
          marginInlineEnd: "5px",
          marginInline: "15px",
          marginBlock: "20px",
          paddingInlineStart: "8px",
          paddingInlineEnd: "12px",
          paddingInline: "10px",
          paddingBlock: "16px",
        },
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const start = 'start';
      const grayscale = 'grayscale';
      const styles = stylex.create({
        default: {
          paddingInlineStart: start,
          paddingBlockStart: start,
          marginInlinekStart: start,
          marginBlockStart: start,
        }
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const bounce = stylex.keyframes({
        '0%': {
          transform: 'translateY(0)',
        },
        '50%': {
          transform: 'translateY(-10px)',
        },
        '100%': {
          transform: 'translateY(0)',
        },
      });
      const styles = stylex.create({
        default: {
          animationName: bounce,
          animationDuration: '1s',
          animationIterationCount: 'infinite',
        }
      });
    `,
    // test for positive numbers
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {marginInlineStart: 5}});",
    // test for literals as namespaces
    'import * as stylex from \'@stylexjs/stylex\'; stylex.create({"default-1": {marginInlineStart: 5}});',
    'import * as stylex from \'@stylexjs/stylex\'; stylex.create({["default-1"]: {marginInlineStart: 5}});',
    // test for numbers as namespaces
    "import * as stylex from '@stylexjs/stylex'; stylex.create({0: {marginInlineStart: 5}});",
    // test for computed numbers as namespaces
    "import * as stylex from '@stylexjs/stylex'; stylex.create({[0]: {marginInlineStart: 5}});",
    // test for negative values.
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {marginInlineStart: -5}});",
    // test for unitless length value 0
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {margin: 0}});",
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {padding: '0'}});",
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlign: 'start'}});",
    // test for Math
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         marginInlineStart: Math.abs(-1),
         marginInlineEnd: \`\${Math.floor(5 / 2)}px\`,
         paddingInlineStart: Math.ceil(5 / 2),
         paddingInlineEnd: Math.round(5 / 2),
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     const x = 5;
     stylex.create({
       default: {
         marginInlineStart: Math.abs(x),
         marginInlineEnd: \`\${Math.floor(x)}px\`,
         paddingInlineStart: Math.ceil(-x),
         paddingInlineEnd: Math.round(x / 2),
       },
     })`,
    `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            marginInlineStart: '10px',
            marginInlineEnd: '10px',
            marginBlockStart: '5px',
            marginBlockEnd: '5px',
            marginInline: '15px',
            marginBlock: '15px',
            paddingInlineStart: '10px',
            paddingInlineEnd: '10px',
            paddingBlockStart: '5px',
            paddingBlockEnd: '5px',
            paddingInline: '15px',
            paddingBlock: '5px',
          },
        });
      `,
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            marginInlineStart: '10px',
            '@media (max-width: 600px)': {
              marginInlineStart: '5px',
            }
          }
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            marginStart: '10px',
            marginEnd: '5px',
            marginHorizontal: '15px',
            marginVertical: '15px',
            paddingStart: '10px',
            paddingEnd: '5px',
            paddingHorizontal: '5px',
            paddingVertical: '15px',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "marginStart" is not a standard CSS property. Did you mean "marginInlineStart"?',
        },
        {
          message:
            'The key "marginEnd" is not a standard CSS property. Did you mean "marginInlineEnd"?',
        },
        {
          message:
            'The key "marginHorizontal" is not a standard CSS property. Did you mean "marginInline"?',
        },
        {
          message:
            'The key "marginVertical" is not a standard CSS property. Did you mean "marginBlock"?',
        },
        {
          message:
            'The key "paddingStart" is not a standard CSS property. Did you mean "paddingInlineStart"?',
        },
        {
          message:
            'The key "paddingEnd" is not a standard CSS property. Did you mean "paddingInlineEnd"?',
        },
        {
          message:
            'The key "paddingHorizontal" is not a standard CSS property. Did you mean "paddingInline"?',
        },
        {
          message:
            'The key "paddingVertical" is not a standard CSS property. Did you mean "paddingBlock"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            marginInlineStart: '10px',
            marginInlineEnd: '5px',
            marginInline: '15px',
            marginBlock: '15px',
            paddingInlineStart: '10px',
            paddingInlineEnd: '5px',
            paddingInline: '5px',
            paddingBlock: '15px',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderVerticalWidth: '2px',
            borderVerticalStyle: 'solid',
            borderVerticalColor: 'red',
            borderHorizontalWidth: '1px',
            borderHorizontalStyle: 'dashed',
            borderHorizontalColor: 'blue',
            borderStartWidth: '2px',
            borderStartStyle: 'solid',
            borderStartColor: 'green',
            borderEndWidth: '3px',
            borderEndStyle: 'dotted',
            borderEndColor: 'purple',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "borderVerticalWidth" is not a standard CSS property. Did you mean "borderBlockWidth"?',
        },
        {
          message:
            'The key "borderVerticalStyle" is not a standard CSS property. Did you mean "borderBlockStyle"?',
        },
        {
          message:
            'The key "borderVerticalColor" is not a standard CSS property. Did you mean "borderBlockColor"?',
        },
        {
          message:
            'The key "borderHorizontalWidth" is not a standard CSS property. Did you mean "borderInlineWidth"?',
        },
        {
          message:
            'The key "borderHorizontalStyle" is not a standard CSS property. Did you mean "borderInlineStyle"?',
        },
        {
          message:
            'The key "borderHorizontalColor" is not a standard CSS property. Did you mean "borderInlineColor"?',
        },
        {
          message:
            'The key "borderStartWidth" is not a standard CSS property. Did you mean "borderInlineStartWidth"?',
        },
        {
          message:
            'The key "borderStartStyle" is not a standard CSS property. Did you mean "borderInlineStartStyle"?',
        },
        {
          message:
            'The key "borderStartColor" is not a standard CSS property. Did you mean "borderInlineStartColor"?',
        },
        {
          message:
            'The key "borderEndWidth" is not a standard CSS property. Did you mean "borderInlineEndWidth"?',
        },
        {
          message:
            'The key "borderEndStyle" is not a standard CSS property. Did you mean "borderInlineEndStyle"?',
        },
        {
          message:
            'The key "borderEndColor" is not a standard CSS property. Did you mean "borderInlineEndColor"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderBlockWidth: '2px',
            borderBlockStyle: 'solid',
            borderBlockColor: 'red',
            borderInlineWidth: '1px',
            borderInlineStyle: 'dashed',
            borderInlineColor: 'blue',
            borderInlineStartWidth: '2px',
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: 'green',
            borderInlineEndWidth: '3px',
            borderInlineEndStyle: 'dotted',
            borderInlineEndColor: 'purple',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderTopStartRadius: '4px',
            borderTopEndRadius: '5px',
            borderBottomStartRadius: '6px',
            borderBottomEndRadius: '7px',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "borderTopStartRadius" is not a standard CSS property. Did you mean "borderStartStartRadius"?',
        },
        {
          message:
            'The key "borderTopEndRadius" is not a standard CSS property. Did you mean "borderStartEndRadius"?',
        },
        {
          message:
            'The key "borderBottomStartRadius" is not a standard CSS property. Did you mean "borderEndStartRadius"?',
        },
        {
          message:
            'The key "borderBottomEndRadius" is not a standard CSS property. Did you mean "borderEndEndRadius"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderStartStartRadius: '4px',
            borderStartEndRadius: '5px',
            borderEndStartRadius: '6px',
            borderEndEndRadius: '7px',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            end: '5px',
            start: '10px',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "end" is not a standard CSS property. Did you mean "insetInlineEnd"?',
        },
        {
          message:
            'The key "start" is not a standard CSS property. Did you mean "insetInlineStart"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            insetInlineEnd: '5px',
            insetInlineStart: '10px',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          foo: {
            float: 'start',
            clear: 'start',
          },
          bar: {
            float: 'end',
            clear: 'end',
          }
        });
      `,
      errors: [
        {
          message:
            'The value "start" is not a standard CSS value for "float". Did you mean "inline-start"?',
        },
        {
          message:
            'The value "start" is not a standard CSS value for "clear". Did you mean "inline-start"?',
        },
        {
          message:
            'The value "end" is not a standard CSS value for "float". Did you mean "inline-end"?',
        },
        {
          message:
            'The value "end" is not a standard CSS value for "clear". Did you mean "inline-end"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          foo: {
            float: 'inline-start',
            clear: 'inline-start',
          },
          bar: {
            float: 'inline-end',
            clear: 'inline-end',
          }
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyleDynamic: (index: number) => ({
            borderTopStartRadius: index,
            borderTopEndRadius: index,
            borderBottomStartRadius: index,
            borderBottomEndRadius: index,
          }),
        });
      `,
      errors: [
        {
          message:
            'The key "borderTopStartRadius" is not a standard CSS property. Did you mean "borderStartStartRadius"?',
        },
        {
          message:
            'The key "borderTopEndRadius" is not a standard CSS property. Did you mean "borderStartEndRadius"?',
        },
        {
          message:
            'The key "borderBottomStartRadius" is not a standard CSS property. Did you mean "borderEndStartRadius"?',
        },
        {
          message:
            'The key "borderBottomEndRadius" is not a standard CSS property. Did you mean "borderEndEndRadius"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyleDynamic: (index: number) => ({
            borderStartStartRadius: index,
            borderStartEndRadius: index,
            borderEndStartRadius: index,
            borderEndEndRadius: index,
          }),
        });
      `,
    },
  ],
});
