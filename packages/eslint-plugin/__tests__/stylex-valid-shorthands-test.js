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
          borderRadius: 5,
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
          marginInline: 0,
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          paddingInline: 0,
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
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'black',
          borderRadius: '4px'
        },
      })
    `,
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 'var(--border-width, 10)',
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
            marginRight: '12px',
            marginBottom: '13px',
            marginLeft: '14px',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "margin: 10px 12px 13px 14px" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        main: {
          borderRight: '4px solid var(--fds-gray-10)'
        },
      })
    `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "borderRight: 4px solid var(--fds-gray-10)" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginHorizontal: '10px',
            marginVertical: '5px',
            paddingHorizontal: '10px',
            paddingVertical: '5px',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            marginInline: '10px',
            marginBlock: '5px',
            paddingInline: '10px',
            paddingBlock: '5px',
          },
        });
      `,
      errors: [
        {
          message:
            'Use "marginInline" instead of legacy formats like "marginHorizontal" to adhere to logical property naming.',
        },
        {
          message:
            'Use "marginBlock" instead of legacy formats like "marginVertical" to adhere to logical property naming.',
        },
        {
          message:
            'Use "paddingInline" instead of legacy formats like "paddingHorizontal" to adhere to logical property naming.',
        },
        {
          message:
            'Use "paddingBlock" instead of legacy formats like "paddingVertical" to adhere to logical property naming.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            margin: '10px 10px 10px',
            marginInline: '15px 15px',
            padding: '20px 20px 20px 20px',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            margin: '10px',
            marginInline: '15px',
            padding: '20px',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "margin: 10px 10px 10px" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "marginInline: 15px 15px" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "padding: 20px 20px 20px 20px" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              borderColor: 'rgb(0, 0, 0), rgb(5, 5, 5)',
              borderWidth: 'var(--vertical-border-width, 10) var(--horizontal-border-width, 15)',
            },
          })
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              borderTopColor: 'rgb(0, 0, 0),',
              borderRightColor: 'rgb(5, 5, 5)',
              borderBottomColor: 'rgb(0, 0, 0),',
              borderLeftColor: 'rgb(5, 5, 5)',
              borderTopWidth: 'var(--vertical-border-width, 10)',
              borderRightWidth: 'var(--horizontal-border-width, 15)',
              borderBottomWidth: 'var(--vertical-border-width, 10)',
              borderLeftWidth: 'var(--horizontal-border-width, 15)',
            },
          })
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "borderColor: rgb(0, 0, 0), rgb(5, 5, 5)" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderWidth: var(--vertical-border-width, 10) var(--horizontal-border-width, 15)" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              borderWidth: 'calc(100% - 20px) calc(90% - 20px)',
              borderColor: 'var(--test-color, #ccc) linear-gradient(to right, #ff7e5f, #feb47b)',
              background: 'no-repeat center/cover, linear-gradient(to right, #ff7e5f, #feb47b)'
            },
          })
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "borderWidth: calc(100% - 20px) calc(90% - 20px)" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderColor: var(--test-color, #ccc) linear-gradient(to right, #ff7e5f, #feb47b)" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "background: no-repeat center/cover, linear-gradient(to right, #ff7e5f, #feb47b)" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              borderWidth: '1px 2px 3px 4px',
              borderStyle: 'solid dashed dotted double',
              borderColor: 'red green blue yellow',
              borderTop: '2px solid red',
              borderRight: '3px dashed green',
              borderBottom: '4px dotted blue',
              borderLeft: '5px double yellow',
              borderRadius: '10px 20px 30px 40px'
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              borderTopWidth: '1px',
              borderRightWidth: '2px',
              borderBottomWidth: '3px',
              borderLeftWidth: '4px',
              borderTopStyle: 'solid',
              borderRightStyle: 'dashed',
              borderBottomStyle: 'dotted',
              borderLeftStyle: 'double',
              borderTopColor: 'red',
              borderRightColor: 'green',
              borderBottomColor: 'blue',
              borderLeftColor: 'yellow',
              borderTopWidth: '2px',
              borderTopStyle: 'solid',
              borderTopColor: 'red',
              borderRightWidth: '3px',
              borderRightStyle: 'dashed',
              borderRightColor: 'green',
              borderBottomWidth: '4px',
              borderBottomStyle: 'dotted',
              borderBottomColor: 'blue',
              borderLeftWidth: '5px',
              borderLeftStyle: 'double',
              borderLeftColor: 'yellow',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '20px',
              borderBottomRightRadius: '30px',
              borderBottomLeftRadius: '40px'
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "borderWidth: 1px 2px 3px 4px" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderStyle: solid dashed dotted double" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderColor: red green blue yellow" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderTop: 2px solid red" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderRight: 3px dashed green" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderBottom: 4px dotted blue" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderLeft: 5px double yellow" are not supported in StyleX. Separate into individual properties.',
        },
        {
          message:
            'Property shorthands using multiple values like "borderRadius: 10px 20px 30px 40px" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            outline: '2px dashed red',
          },
        });
      `,
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            outlineWidth: '2px',
            outlineStyle: 'dashed',
            outlineColor: 'red',
          },
        });
      `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "outline: 2px dashed red" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              background: '#ff0 url("image.jpg") no-repeat fixed center / cover !important',
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              backgroundColor: '#ff0',
              backgroundImage: 'url("image.jpg")',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "background: #ff0 url("image.jpg") no-repeat fixed center / cover !important" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      options: [{ allowImportant: true }],
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              background: '#ff0 url("image.jpg") no-repeat fixed center / cover !important',
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              backgroundColor: '#ff0 !important',
              backgroundImage: 'url("image.jpg") !important',
              backgroundRepeat: 'no-repeat !important',
              backgroundAttachment: 'fixed !important',
              backgroundPosition: 'center !important',
              backgroundSize: 'cover !important',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "background: #ff0 url("image.jpg") no-repeat fixed center / cover !important" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              margin: '0px',
              font: 'italic small-caps bold 16px/1.5 "Helvetica Neue"',
              color: 'white',
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              margin: '0px',
              fontFamily: '"Helvetica Neue"',
              fontStyle: 'italic',
              fontVariant: 'small-caps',
              fontWeight: 'bold',
              fontSize: '16px',
              lineHeight: '1.5',
              color: 'white',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "font: italic small-caps bold 16px/1.5 "Helvetica Neue"" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      options: [{ allowImportant: true }],
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              margin: '10px 12px 13px 14px !important',
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              marginTop: '10px !important',
              marginRight: '12px !important',
              marginBottom: '13px !important',
              marginLeft: '14px !important',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "margin: 10px 12px 13px 14px !important" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              margin: '10px 12px 13px 14px !important',
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              marginTop: '10px',
              marginRight: '12px',
              marginBottom: '13px',
              marginLeft: '14px',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "margin: 10px 12px 13px 14px !important" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
    {
      options: [{ preferInline: true }],
      code: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              margin: '10em 1em 5em 2em',
            },
          });
        `,
      output: `
          import stylex from 'stylex';
          const styles = stylex.create({
            main: {
              marginTop: '10em',
              marginInlineEnd: '1em',
              marginBottom: '5em',
              marginInlineStart: '2em',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "margin: 10em 1em 5em 2em" are not supported in StyleX. Separate into individual properties.',
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
              marginBlock: '10em',
              marginInline: '1em',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "margin: 10em 1em" are not supported in StyleX. Separate into individual properties.',
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
            'Property shorthands using multiple values like "marginInline: 10em 1em" are not supported in StyleX. Separate into individual properties.',
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
            'Property shorthands using multiple values like "marginBlock: 10em 1em" are not supported in StyleX. Separate into individual properties.',
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
            'Property shorthands using multiple values like "paddingBlock: 10em 1em" are not supported in StyleX. Separate into individual properties.',
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
              marginStart: '20em',
              marginEnd: '20em',
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
              marginInlineStart: '20em',
              marginInlineEnd: '20em',
              paddingInlineStart: '10em',
              paddingInlineEnd: '1em',
            },
          });
        `,
      errors: [
        {
          message:
            'Use "marginInlineStart" instead of legacy formats like "marginStart" to adhere to logical property naming.',
        },
        {
          message:
            'Use "marginInlineEnd" instead of legacy formats like "marginEnd" to adhere to logical property naming.',
        },
        {
          message:
            'Use "paddingInlineStart" instead of legacy formats like "paddingStart" to adhere to logical property naming.',
        },
        {
          message:
            'Use "paddingInlineEnd" instead of legacy formats like "paddingEnd" to adhere to logical property naming.',
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
              paddingBlock: '10em',
              paddingInline: '1em',
            },
          });
        `,
      errors: [
        {
          message:
            'Property shorthands using multiple values like "padding: 10em 1em" are not supported in StyleX. Separate into individual properties.',
        },
      ],
    },
  ],
});
