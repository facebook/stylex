/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        main: {
          display: 'flex',
          borderColor: {
            default: 'green',
            ':hover': 'red',
            '@media (min-width: 1540px)': 1366,
          },
          borderRadius: 10,
        },
        dynamic: (color) => ({
          backgroundColor: color,
        })
      })
    `,
    },
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
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
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'center',
          ...obj,
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
          display: 'flex',
          alignItems: 'center',

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
          display: 'flex',
          borderColor: 'black',
        }
      });
    `,
    },
    {
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: `
      import { css } from 'a';
      const styles = css.create({
        button: {
          display: 'flex',
          borderColor: 'black',
        }
      });
      `,
    },
    {
      code: `
        import { keyframes } from 'stylex';
        const someAnimation = keyframes({
          '0%': {
            display: 'none',
            borderColor: 'red',
          },
          '100%': {
            display: 'flex',
            borderColor: 'green',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const someAnimation = stylex.keyframes({
          '0%': {
            display: 'none',
            borderColor: 'red',
          },
          '100%': {
            display: 'flex',
            borderColor: 'green',
          },
        });
      `,
    },
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        nav: {
          maxWidth: {
            default: "1080px",
            "@media (min-width: 2000px)": "calc((1080 / 24) * 1rem)"
          },
          paddingBlock: 0,
        },
      });`,
    },
  ],
  invalid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          main: {
            padding: 10,
            animationDuration: '100ms',
            fontSize: 12,
          }
        });
      `,
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          main: {
            padding: 10,
            fontSize: 12,
            animationDuration: '100ms',
          }
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "fontSize" should be above "animationDuration"',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
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
        import * as stylex from '@stylexjs/stylex';
        const obj = { fontSize: '12px' };
        const styles = stylex.create({
          button: {
            display: 'flex',
            alignItems: 'center',
            ...obj,
            alignSelf: 'center',
            borderColor: 'red', // ok
          }
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "display" should be above "alignItems"',
        },
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
            display: 'flex',
            alignItems: 'center',
            borderColor: 'red',
          }
        });
      `,
      errors: [
        {
          message:
            'StyleX property key "display" should be above "alignItems"',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
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
        import * as stylex from '@stylexjs/stylex';
        const someAnimation = stylex.keyframes({
          '0%': {
            display: 'none',
            borderColor: 'red',
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
            'StyleX property key "display" should be above "borderColor"',
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
            display: 'none',
            borderColor: 'red',
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
            'StyleX property key "display" should be above "borderColor"',
        },
      ],
    },
    {
      code: `
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
      output: `
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
            'StyleX property key ":hover" should be above "@media (min-width: 1540px)"',
        },
        {
          message:
            'StyleX property key "display" should be above "borderColor"',
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
      output: `
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
      errors: [
        {
          message:
            'StyleX property key "display" should be above "backgroundColor"',
        },
      ],
    },
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: { backgroundColor: 'red', alignItems: 'center', }
      })
      `,
      output: `
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          backgroundColor: 'red',             //       foo
          alignItems: 'center'       // baz
        }
      })
      `,
      output: `
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
      import * as stylex from '@stylexjs/stylex';
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
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          // foo

          backgroundColor: 'red',
          alignItems: 'center'
        }
      })
      `,
      output: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          // foo

          alignItems: 'center',
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
      options: [{ allowLineSeparatedGroups: true }],
      code: `
      import { create as cr } from '@stylexjs/stylex';
      const styles = cr({
        button: {
          display: 'flex',
          alignItems: 'center',
          // foo

          // bar
          borderColor: 'black',
          alignSelf: 'center',
        }
      });
      `,
      output: `
      import { create as cr } from '@stylexjs/stylex';
      const styles = cr({
        button: {
          display: 'flex',
          alignItems: 'center',
          // foo

          alignSelf: 'center',
          // bar
          borderColor: 'black',
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
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      code: `
        import { css } from 'a';
        const styles = css.create({
          main: {
            animationDuration: '100ms',
            padding: 10,
            fontSize: 12,
          }
        });
      `,
      output: `
        import { css } from 'a';
        const styles = css.create({
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
            'StyleX property key "padding" should be above "animationDuration"',
        },
      ],
    },
  ],
});
