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
      output: `
        import stylex from 'stylex';
        const styles = stylex.create({
          main: {
            animationDuration: '100ms',
            padding: 10,
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
            borderColor: 'red', // ok
            alignSelf: 'center',
          }
        });
      `,
      output: `
        import stylex from 'stylex';
        const obj = { fontSize: '12px' };
        const styles = stylex.create({
          button: {
            alignItems: 'center',
            display: 'flex',
            ...obj,
            alignSelf: 'center',
            borderColor: 'red', // ok
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
      output: `
        import { create } from 'stylex';
        const styles = create({
          button: {
            alignItems: 'center',
            borderColor: 'red',
            display: 'flex',
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
      output: `
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
      output: `
        import { keyframes as kf } from 'stylex';
        const someAnimation = kf({
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
      output: `
      import { create } from 'stylex';
      const styles = create({
        main: {
          borderColor: {
            default: 'green',
            '@media (min-width: 1540px)': 1366,
            ':hover': 'red',
          },
          display: 'flex',
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
    {
      code: `
      import { create } from 'stylex';
      const styles = create({
        main: {
          backgroundColor: {
            // a
            ':hover': 'blue', // a
            // b
            default: 'red', // b
          },
        },
      });`,
      output: `
      import { create } from 'stylex';
      const styles = create({
        main: {
          backgroundColor: {
            // b
            default: 'red', // b
            // a
            ':hover': 'blue', // a
          },
        },
      });`,
      errors: [
        {
          message: 'StyleX property key "default" should be above ":hover"',
        },
      ],
    },
    {
      code: `
      import { create } from 'stylex';
      const styles = create({
        foo: {
          display: 'flex',
          backgroundColor: {
            // foo
            default: 'red',
            // bar
            /* Block comment */
            ':hover': 'brown',
          },
        }
      });
      `,
      output: `
      import { create } from 'stylex';
      const styles = create({
        foo: {
          backgroundColor: {
            // foo
            default: 'red',
            // bar
            /* Block comment */
            ':hover': 'brown',
          },
          display: 'flex',
        }
      });
      `,
      errors: [
        {
          message:
            'StyleX property key "backgroundColor" should be above "display"',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          // zee
          backgroundColor: 'red', // foo
          // bar
          alignItems: 'center' // eee
        }
      })
      `,
      output: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          // bar
          alignItems: 'center', // eee
          // zee
          backgroundColor: 'red', // foo
        }
      })
      `,
      errors: [
        {
          message:
            'StyleX property key "alignItems" should be above "backgroundColor"',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: { backgroundColor: 'red', alignItems: 'center', }
      })
      `,
      output: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: { alignItems: 'center', backgroundColor: 'red', }
      })
      `,
      errors: [
        {
          message:
            'StyleX property key "alignItems" should be above "backgroundColor"',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: { // foo
          // foo
          backgroundColor: 'red', // bar
          // bar
          alignItems: 'center' // baz
          // qux
        }
      })
      `,
      output: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: { // foo
          // bar
          alignItems: 'center', // baz
          // foo
          backgroundColor: 'red', // bar
          // qux
        }
      })
      `,
      errors: [
        {
          message:
            'StyleX property key "alignItems" should be above "backgroundColor"',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          /*
          *
          * foo
          * bar
          * baz
          *
          */
          backgroundColor: 'red',
          alignItems: 'center'
        }
      })
      `,
      output: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          alignItems: 'center',
          /*
          *
          * foo
          * bar
          * baz
          *
          */
          backgroundColor: 'red',
        }
      })
      `,
      errors: [
        {
          message:
            'StyleX property key "alignItems" should be above "backgroundColor"',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {      
          backgroundColor: 'red',             //       foo
          alignItems: 'center'       // baz
        }
      })
      `,
      output: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {      
          alignItems: 'center',       // baz
          backgroundColor: 'red',             //       foo
        }
      })
      `,
      errors: [
        {
          message:
            'StyleX property key "alignItems" should be above "backgroundColor"',
        },
      ],
    },
    {
      code: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          /*
          * foo
          */ backgroundColor: 'red',
          alignItems: 'center'
        }
      })
      `,
      output: `
      import stylex from 'stylex';
      const styles = stylex.create({
        foo: {
          alignItems: 'center',
          /*
          * foo
          */ backgroundColor: 'red',
        }
      })
      `,
      errors: [
        {
          message:
            'StyleX property key "alignItems" should be above "backgroundColor"',
        },
      ],
    },
  ],
});
