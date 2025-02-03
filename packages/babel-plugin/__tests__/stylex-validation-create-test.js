/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

jest.autoMockOff();

import { transformSync } from '@babel/core';
import { messages } from '@stylexjs/shared';
import stylexPlugin from '../src/index';

// Valid string terminator sequences are BEL, ESC\, and 0x9c
const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)';
const pattern = [
  `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${ST})`,
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
].join('|');

const regex = new RegExp(pattern, 'g');

function stripAnsi(string: string): string {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }

  // Even though the regex is global, we don't need to reset the `.lastIndex`
  // because unlike `.exec()` and `.test()`, `.replace()` does it automatically
  // and doing it manually has a performance penalty.
  return string.replace(regex, '');
}

function cleanError(fn: () => mixed) {
  return () => {
    try {
      fn();
    } catch (error) {
      error.message = stripAnsi(error.message);
      throw error;
    }
  };
}

const cleanExpect = (fn: () => mixed) => expect(cleanError(fn));

function transform(source: string, opts: { [key: string]: any } = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, opts]],
  });
}

describe('@stylexjs/babel-plugin', () => {
  /**
   * stylex.create
   */

  describe('[validation] stylex.create()', () => {
    test('must be bound to a variable', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          stylex.create({});
        `);
      }).toThrow(messages.UNBOUND_STYLEX_CALL_VALUE);
    });

    test('must be called at top level', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          if (bar) {
            const styles = stylex.create({});
          } 
       `);
      }).toThrow(messages.ONLY_TOP_LEVEL);
    });

    test('its only argument must be a single object', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create(genStyles());
        `);
      }).toThrow(messages.NON_OBJECT_FOR_STYLEX_CALL);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create();
        `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({}, {});
        `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({});
        `);
      }).not.toThrow();
    });

    test('namespace keys must be a static value', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            [root]: {
              backgroundColor: 'red',
            }
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });

    test('namespace values must be an object', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            namespace: false,
          });
        `);
      }).toThrow(messages.ILLEGAL_NAMESPACE_VALUE);
      expect(() => {
        transform(`
          const styles = stylex.create({
            namespace: {},
          });
        `);
      }).not.toThrow();
    });

    test('dynamic style function only accepts named parameters', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            dynamic: (props = {}) => ({
              color: props.color,
            }),
          });
        `);
      }).toThrow(messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            dynamic: (color = 'red') => ({
              color,
            }),
          });
        `);
      }).toThrow(messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            dynamic: ({ color }) => ({
              color,
            }),
          });
        `);
      }).toThrow(messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            dynamic: (...rest) => ({
              color: rest[0],
            }),
          });
        `);
      }).toThrow(messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            dynamic: (backgroundColor) => ({
              backgroundColor,
            }),
          });
        `);
      }).not.toThrow();
    });

    /* Properties */

    test('properties must be a static value', () => {
      cleanExpect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            root: {
              [backgroundColor]: 'red',
            }
          });
        `);
      }).toThrowErrorMatchingInlineSnapshot(`
        "unknown file: Referenced constant is not defined.
          3 |           const styles = stylex.create({
          4 |             root: {
        > 5 |               [backgroundColor]: 'red',
            |                ^^^^^^^^^^^^^^^
          6 |             }
          7 |           });
          8 |         "
      `);
    });

    /* Values */

    test('values must be static (arrays of) number or string in stylex.create()', () => {
      // number
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            root: {
              padding: 5,
            }
          });
        `);
      }).not.toThrow();
      // string
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            root: {
              backgroundColor: 'red',
            }
          });
        `);
      }).not.toThrow();
      // array of numbers
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              transitionDuration: [500],
            },
          });
        `);
      }).not.toThrow();
      // array of strings
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              transitionDuration: ['0.5s'],
            },
          });
        `);
      }).not.toThrow();
      // not string or number
      cleanExpect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              transitionDuration: [[], {}],
            },
          });
        `);
      }).toThrowErrorMatchingInlineSnapshot(
        '"unknown file: A style array value can only contain strings or numbers."',
      );
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: true,
            },
          });
        `);
      }).toThrow(messages.ILLEGAL_PROP_VALUE);
      // not static
      cleanExpect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            root: {
              backgroundColor: backgroundColor,
            }
          });
        `);
      }).toThrowErrorMatchingInlineSnapshot(`
        "unknown file: Referenced constant is not defined.
          3 |           const styles = stylex.create({
          4 |             root: {
        > 5 |               backgroundColor: backgroundColor,
            |                                ^^^^^^^^^^^^^^^
          6 |             }
          7 |           });
          8 |         "
      `);
      cleanExpect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            root: {
              backgroundColor: generateBg(),
            }
          });
        `);
      }).toThrowErrorMatchingInlineSnapshot(`
        "unknown file: Referenced constant is not defined.
          3 |           const styles = stylex.create({
          4 |             root: {
        > 5 |               backgroundColor: generateBg(),
            |                                ^^^^^^^^^^
          6 |             }
          7 |           });
          8 |         "
      `);
      cleanExpect(() => {
        transform(`
          import stylex from 'stylex';
          import {generateBg} from './other-file';
          const styles = stylex.create({
            root: {
              backgroundColor: generateBg(),
            }
          });
        `);
      }).toThrowErrorMatchingInlineSnapshot(`
        "unknown file: Could not resolve the path to the imported file.
        Please ensure that the theme file has a .stylex.js or .stylex.ts file extension and follows the
        rules for defining variariables: 

        https://stylexjs.com/docs/learn/theming/defining-variables/#rules-when-defining-variables

          1 |
          2 |           import stylex from 'stylex';
        > 3 |           import {generateBg} from './other-file';
            |                   ^^^^^^^^^^
          4 |           const styles = stylex.create({
          5 |             root: {
          6 |               backgroundColor: generateBg(),"
      `);

      cleanExpect(() => {
        transform(`
          import stylex from 'stylex';
          import generateBg from './other-file';
          const styles = stylex.create({
            root: {
              backgroundColor: generateBg(),
            }
          });
        `);
      }).toThrowErrorMatchingInlineSnapshot(`
        "unknown file: There was an error when attempting to evaluate the imported file.
        Please ensure that the imported file is self-contained and does not rely on dynamic behavior.

          1 |
          2 |           import stylex from 'stylex';
        > 3 |           import generateBg from './other-file';
            |                  ^^^^^^^^^^
          4 |           const styles = stylex.create({
          5 |             root: {
          6 |               backgroundColor: generateBg(),"
      `);
    });

    test('[validation] can evaluate single-expr function calls', () => {
      expect(() =>
        transform(`
          import stylex from 'stylex';
          const generateBg = () => 'red';
          export const styles = stylex.create({
            root: {
              backgroundColor: generateBg(),
            }
          });
        `),
      ).not.toThrow();
    });

    test('[validation] can evaluate single-expr function calls in objects', () => {
      let result;
      expect(() => {
        result = transform(`
          import stylex from 'stylex';
          const fns = {
            generateBg: () => 'red',
          };
          export const styles = stylex.create({
            root: {
              backgroundColor: fns.generateBg(),
            }
          });
        `);
      }).not.toThrow();

      expect(result).not.toBeFalsy();

      expect(result?.code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const fns = {
          generateBg: () => 'red'
        };
        export const styles = {
          root: {
            kWkggS: "xrkmrrc",
            $$css: true
          }
        };"
      `);

      // $FlowFixMe
      expect(result?.metadata?.stylex).toMatchInlineSnapshot(`
        [
          [
            "xrkmrrc",
            {
              "ltr": ".xrkmrrc{background-color:red}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    test('values can reference local bindings in stylex.create()', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const bg = '#eee';
          const styles = stylex.create({
            root: {
              backgroundColor: bg,
            }
          });
        `);
      }).not.toThrow();
    });

    test('values can be pure complex expressions in stylex.create()', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const borderRadius = 2;
          const styles = stylex.create({
            root: {
              borderRadius: borderRadius * 2,
            }
          });
        `);
      }).not.toThrow();
    });

    test('values can be template literal expressions in stylex.create()', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const borderSize = 2;
          const styles = stylex.create({
            root: {
              borderRadius: \`\${borderSize * 2}px\`,
            }
          });
        `);
      }).not.toThrow();
    });

    /* Complex selectors */

    test('pseudo-classes must start with ":" character', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              ':hover': {},
            },
          });
        `);
      }).not.toThrow();

      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              'color': {
                default: 'black',
                ':hover': 'blue'
              },
            },
          });
        `);
      }).not.toThrow();

      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              'color': {
                default: 'black',
                '&:hover': 'blue'
              },
            },
          });
        `);
      }).toThrow(messages.INVALID_PSEUDO_OR_AT_RULE);
    });

    // Pseudo-classes can now be nested!
    test('pseudo-classes cannot be nested', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              ':hover': {
                ':active': {},
              },
            },
          });
        `);
      }).not.toThrow(messages.ILLEGAL_NESTED_PSEUDO);
    });
  });
});
