/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');
const jsx = require('@babel/plugin-syntax-jsx');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [jsx, [stylexPlugin, { runtimeInjection: true, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex() call', () => {
    test('empty stylex call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          stylex();
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        "";"
      `);
    });

    test('basic stylex call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex(styles.red);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });

    test('stylex call with number', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            0: {
              color: 'red',
            },
            1: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles[0], styles[1]);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x1t391ir{background-color:blue}", 3000);
        "x1e2nbdu x1t391ir";"
      `);
    });

    test('stylex call with computed number', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            [0]: {
              color: 'red',
            },
            [1]: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles[0], styles[1]);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x1t391ir{background-color:blue}", 3000);
        "x1e2nbdu x1t391ir";"
      `);
    });

    test('stylex call with computed number', () => {
      expect(
        transform(`
          import {create} from '@stylexjs/stylex';
          const styles = create({
            [0]: {
              color: 'red',
            },
            [1]: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles[0], styles[1]);
        `),
      ).toMatchInlineSnapshot(`
        "import { create } from '@stylexjs/stylex';
        import __stylex__ from "@stylexjs/stylex";
        __stylex__.inject(".x1e2nbdu{color:red}", 3000);
        __stylex__.inject(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          "0": {
            color: "x1e2nbdu",
            $$css: true
          },
          "1": {
            backgroundColor: "x1t391ir",
            $$css: true
          }
        };
        stylex(styles[0], styles[1]);"
      `);
    });

    test('stylex call with computed string', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            'default': {
              color: 'red',
            }
          });
          stylex(styles['default']);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });

    test('stylex call with multiple namespaces', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: 'red',
            },
          });
          const otherStyles = stylex.create({
            default: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles.default, otherStyles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x1t391ir{background-color:blue}", 3000);
        "x1e2nbdu x1t391ir";"
      `);
    });

    test('stylex call within variable declarations', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: { color: 'red' }
          });
          const a = function() {
            return stylex(styles.foo);
          }
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        const a = function () {
          return "x1e2nbdu";
        };"
      `);
    });

    test('stylex call with styles variable assignment', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              color: 'red',
            },
            bar: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles.foo, styles.bar);
          const foo = styles;
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          foo: {
            color: "x1e2nbdu",
            $$css: true
          },
          bar: {
            backgroundColor: "x1t391ir",
            $$css: true
          }
        };
        "x1e2nbdu x1t391ir";
        const foo = styles;"
      `);
    });

    test('stylex call within export declarations', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: { color: 'red' }
          });
          export default function MyExportDefault() {
            return stylex(styles.foo);
          }
          export function MyExport() {
            return stylex(styles.foo);
          }
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        export default function MyExportDefault() {
          return "x1e2nbdu";
        }
        export function MyExport() {
          return "x1e2nbdu";
        }"
      `);
    });

    test('stylex call with short-form properties', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x14odnwx{padding:5px}", 1000);
        "x14odnwx";"
      `);
    });

    test('stylex call with exported short-form properties', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              padding: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x14odnwx{padding:5px}", 1000);
        export const styles = {
          foo: {
            padding: "x14odnwx",
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingTop: null,
            paddingBottom: null,
            $$css: true
          }
        };
        "x14odnwx";"
      `);
    });

    test('stylex call using styles with pseudo selectors', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: 'red',
              ':hover': {
                color: 'blue',
              }
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x17z2mba:hover{color:blue}", 3130);
        "x1e2nbdu x17z2mba";"
      `);
    });

    test('stylex call using styles with pseudo selectors within property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: {
                default: 'red',
                ':hover': 'blue',
              }
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x17z2mba:hover{color:blue}", 3130);
        "x1e2nbdu x17z2mba";"
      `);
    });

    test('stylex call using styles with Media Queries', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: 'red',
              '@media (min-width: 1000px)': {
                backgroundColor: 'blue',
              },
              '@media (min-width: 2000px)': {
                backgroundColor: 'purple',
              },
            },
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        "xrkmrrc xc445zv x1ssfqz5";"
      `);
    });

    test('stylex call using styles with Media Queries within property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: {
                default:'red',
                '@media (min-width: 1000px)': 'blue',
                '@media (min-width: 2000px)': 'purple',
              },
            },
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        "xrkmrrc xc445zv x1ssfqz5";"
      `);
    });

    test('stylex call using styles with Support Queries', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: 'red',
              '@supports (hover: hover)': {
                backgroundColor: 'blue',
              },
              '@supports not (hover: hover)': {
                backgroundColor: 'purple',
              },
            },
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        "xrkmrrc x6m3b6q x6um648";"
      `);
    });

    test('stylex call using styles with Support Queries within property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: {
                default:'red',
                '@supports (hover: hover)': 'blue',
                '@supports not (hover: hover)': 'purple',
              },
            },
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        "xrkmrrc x6m3b6q x6um648";"
      `);
    });

    describe('with conditional styles and collisions', () => {
      test('stylex call with conditions', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            stylex(styles.default, isActive && styles.active);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          ({
            0: "xrkmrrc",
            1: "xrkmrrc xju2f9n"
          })[!!isActive << 0];"
        `);
      });

      test('stylex call with conditions - skip conditional', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            stylex(styles.default, isActive && styles.active);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          const styles = {
            default: {
              backgroundColor: "xrkmrrc",
              $$css: true
            },
            active: {
              color: "xju2f9n",
              $$css: true
            }
          };
          stylex(styles.default, isActive && styles.active);"
        `);
      });

      test('stylex call with property collisions', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: 'blue',
              }
            });
            stylex(styles.red, styles.blue);
            stylex(styles.blue, styles.red);
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          "xju2f9n";
          "x1e2nbdu";"
        `);
      });

      test('stylex call with reverting by null', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              revert: {
                color: null,
              }
            });
            stylex(styles.red, styles.revert);
            stylex(styles.revert, styles.red);
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          "";
          "x1e2nbdu";"
        `);
      });

      test('stylex call with short-form property collisions', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                padding: 5,
                paddingEnd: 10,
              },
  
              bar: {
                padding: 2,
                paddingStart: 10,
              },
            });
            stylex(styles.foo, styles.bar);
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x14odnwx{padding:5px}", 1000);
          stylex.inject(".x2vl965{padding-inline-end:10px}", 3000);
          stylex.inject(".x1i3ajwb{padding:2px}", 1000);
          stylex.inject(".xe2zdcy{padding-inline-start:10px}", 3000);
          "x2vl965 x1i3ajwb xe2zdcy";"
        `);
      });

      test('stylex call with short-form property collisions with null', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                padding: 5,
                paddingEnd: 10,
              },
  
              bar: {
                padding: 2,
                paddingStart: null,
              },
            });
            stylex(styles.foo, styles.bar);
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x14odnwx{padding:5px}", 1000);
          stylex.inject(".x2vl965{padding-inline-end:10px}", 3000);
          stylex.inject(".x1i3ajwb{padding:2px}", 1000);
          "x2vl965 x1i3ajwb";"
        `);
      });

      test('stylex call with conditions and collisions', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: 'blue',
              }
            });
            stylex(styles.red, isActive && styles.blue);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          ({
            0: "x1e2nbdu",
            1: "xju2f9n"
          })[!!isActive << 0];"
        `);
      });

      test('stylex call with conditions and collisions - skip conditional', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: 'blue',
              }
            });
            stylex(styles.red, isActive && styles.blue);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          const styles = {
            red: {
              color: "x1e2nbdu",
              $$css: true
            },
            blue: {
              color: "xju2f9n",
              $$css: true
            }
          };
          stylex(styles.red, isActive && styles.blue);"
        `);
      });

      test('stylex call with conditions and null collisions', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: null,
              }
            });
            stylex(styles.red, isActive && styles.blue);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          ({
            0: "x1e2nbdu",
            1: ""
          })[!!isActive << 0];"
        `);
      });

      test('stylex call with conditions and null collisions - skip conditional', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: null,
              }
            });
            stylex(styles.red, isActive && styles.blue);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          const styles = {
            red: {
              color: "x1e2nbdu",
              $$css: true
            },
            blue: {
              color: null,
              $$css: true
            }
          };
          stylex(styles.red, isActive && styles.blue);"
        `);
      });
    });

    // COMPOSITION
    describe('with plugin options', () => {
      test('stylex call produces dev class names', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
        };
        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
              });
              stylex(styles.default);
            `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          "FooBar__styles.default x1e2nbdu";"
        `);
      });

      test('stylex call produces dev class name with conditions', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
          genConditionalClasses: true,
        };
        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
              });
              const otherStyles = stylex.create({
                default: {
                  backgroundColor: 'blue',
                }
              });
              stylex(styles.default, isActive && otherStyles.default);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".x1t391ir{background-color:blue}", 3000);
          ({
            0: "FooBar__styles.default x1e2nbdu",
            1: "FooBar__styles.default x1e2nbdu FooBar__otherStyles.default x1t391ir"
          })[!!isActive << 0];"
        `);
      });

      test('stylex call produces dev class name with conditions - skip conditional', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
        };
        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
              });
              const otherStyles = stylex.create({
                default: {
                  backgroundColor: 'blue',
                }
              });
              stylex(styles.default, isActive && otherStyles.default);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              "FooBar__styles.default": "FooBar__styles.default",
              color: "x1e2nbdu",
              $$css: true
            }
          };
          stylex.inject(".x1t391ir{background-color:blue}", 3000);
          const otherStyles = {
            default: {
              "FooBar__otherStyles.default": "FooBar__otherStyles.default",
              backgroundColor: "x1t391ir",
              $$css: true
            }
          };
          stylex(styles.default, isActive && otherStyles.default);"
        `);
      });

      test('stylex call produces dev class name with collisions', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
          genConditionalClasses: true,
        };

        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
                active: {
                  color: 'blue',
                }
              });
              stylex(styles.default, isActive && styles.active);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          ({
            0: "FooBar__styles.default x1e2nbdu",
            1: "FooBar__styles.default FooBar__styles.active xju2f9n"
          })[!!isActive << 0];"
        `);
      });

      test('stylex call produces dev class name with collisions - skip conditional', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
        };

        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
                active: {
                  color: 'blue',
                }
              });
              stylex(styles.default, isActive && styles.active);
            `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".xju2f9n{color:blue}", 3000);
          const styles = {
            default: {
              "FooBar__styles.default": "FooBar__styles.default",
              color: "x1e2nbdu",
              $$css: true
            },
            active: {
              "FooBar__styles.active": "FooBar__styles.active",
              color: "xju2f9n",
              $$css: true
            }
          };
          stylex(styles.default, isActive && styles.active);"
        `);
      });
    });
  });
  describe('Keep stylex.create when needed', () => {
    test('stylex call with computed key access', () => {
      expect(
        transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              [0]: {
                color: 'red',
              },
              [1]: {
                backgroundColor: 'blue',
              }
            });
            stylex(styles[variant]);
          `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        stylex.inject(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          "0": {
            color: "x1e2nbdu",
            $$css: true
          },
          "1": {
            backgroundColor: "x1t391ir",
            $$css: true
          }
        };
        stylex(styles[variant]);"
      `);
    });
    test('stylex call with composition of external styles', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: 'red',
            },
          });
          stylex(styles.default, props);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        const styles = {
          default: {
            color: "x1e2nbdu",
            $$css: true
          }
        };
        stylex(styles.default, props);"
      `);
    });

    test('stylex call using exported styles with pseudo selectors, and queries', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: {
              ':hover': {
                color: 'blue',
              },
              '@media (min-width: 1000px)': {
                backgroundColor: 'blue',
              },
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x17z2mba:hover{color:blue}", 3130);
        stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        export const styles = {
          default: {
            ":hover_color": "x17z2mba",
            "@media (min-width: 1000px)_backgroundColor": "xc445zv",
            $$css: true
          }
        };
        "x17z2mba xc445zv";"
      `);
    });

    test('stylex call using exported styles with pseudo selectors, and queries within props', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: {
              color: {
                ':hover': 'blue',
              },
              backgroundColor: {
                '@media (min-width: 1000px)': 'blue'  
              },
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x17z2mba:hover{color:blue}", 3130);
        stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        export const styles = {
          default: {
            color: "x17z2mba",
            backgroundColor: "xc445zv",
            $$css: true
          }
        };
        "x17z2mba xc445zv";"
      `);
    });

    describe('even when stylex calls come first', () => {
      test('stylex call with computed key access', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles[variant]);
            const styles = stylex.create({
              [0]: {
                color: 'red',
              },
              [1]: {
                backgroundColor: 'blue',
              }
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex(styles[variant]);
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            "0": {
              color: "x1e2nbdu",
              $$css: true
            },
            "1": {
              backgroundColor: "x1t391ir",
              $$css: true
            }
          };"
        `);
      });

      test('stylex call with mixed access', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            
            function MyComponent() {
              return (
                <>
                  <div className={stylex(styles.foo)} />
                  <div className={stylex(styles.bar)} />
                  <CustomComponent xstyle={styles.foo} />
                  <div className={stylex(styles.foo, styles.bar)} />
                </>
              );
            }

            const styles = stylex.create({
              foo: {
                color: 'red',
              },
              bar: {
                backgroundColor: 'blue',
              }
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          function MyComponent() {
            return <>
                            <div className={"x1e2nbdu"} />
                            <div className={"x1t391ir"} />
                            <CustomComponent xstyle={styles.foo} />
                            <div className={"x1e2nbdu x1t391ir"} />
                          </>;
          }
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          stylex.inject(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            foo: {
              color: "x1e2nbdu",
              $$css: true
            },
            bar: {
              backgroundColor: "x1t391ir",
              $$css: true
            }
          };"
        `);
      });
      test('stylex call with composition of external styles', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles.default, props);
            const styles = stylex.create({
              default: {
                color: 'red',
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex(styles.default, props);
          stylex.inject(".x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              color: "x1e2nbdu",
              $$css: true
            }
          };"
        `);
      });

      test('stylex call with composition border shorthands with external styles', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles.default, props);
            const styles = stylex.create({
              default: {
                borderTop: '5px solid blue',
                borderLeft: '5px solid blue',
                borderRight: '5px solid blue',
                borderBottom: '5px solid blue',
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex(styles.default, props);
          stylex.inject(".x16gpukw{border-top:5px solid blue}", 2000);
          stylex.inject(".x13nwy86{border-left:5px solid blue}", 2000);
          stylex.inject(".x2ekbea{border-right:5px solid blue}", 2000);
          stylex.inject(".x1o3008b{border-bottom:5px solid blue}", 2000);
          const styles = {
            default: {
              borderTop: "x16gpukw",
              borderTopWidth: null,
              borderTopStyle: null,
              borderTopColor: null,
              borderLeft: "x13nwy86",
              borderLeftWidth: null,
              borderInlineStartWidth: null,
              borderInlineEndWidth: null,
              borderLeftStyle: null,
              borderInlineStartStyle: null,
              borderInlineEndStyle: null,
              borderLeftColor: null,
              borderInlineStartColor: null,
              borderInlineEndColor: null,
              borderRight: "x2ekbea",
              borderRightWidth: null,
              borderRightStyle: null,
              borderRightColor: null,
              borderBottom: "x1o3008b",
              borderBottomWidth: null,
              borderBottomStyle: null,
              borderBottomColor: null,
              $$css: true
            }
          };"
        `);
      });

      test('stylex call using exported styles with pseudo selectors, and queries', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles.default);
            export const styles = stylex.create({
              default: {
                ':hover': {
                  color: 'blue',
                },
                '@media (min-width: 1000px)': {
                  backgroundColor: 'blue',
                },
              }
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          "x17z2mba xc445zv";
          stylex.inject(".x17z2mba:hover{color:blue}", 3130);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          export const styles = {
            default: {
              ":hover_color": "x17z2mba",
              "@media (min-width: 1000px)_backgroundColor": "xc445zv",
              $$css: true
            }
          };"
        `);
      });
    });
  });
  describe('Setting custom import paths', () => {
    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import stylex from 'custom-stylex-path';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex(styles.red);
        `,
          { importSources: ['custom-stylex-path'] },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from 'custom-stylex-path';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });
    test('Named import from custom source', () => {
      expect(
        transform(
          `
          import {css as stylex} from 'custom-stylex-path';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex(styles.red);
        `,
          { importSources: [{ from: 'custom-stylex-path', as: 'css' }] },
        ),
      ).toMatchInlineSnapshot(`
        "import { css as stylex } from 'custom-stylex-path';
        stylex.inject(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });
    test('Named import with other name from custom source', () => {
      expect(
        transform(
          `
          import {css} from 'custom-stylex-path';
          const styles = css.create({
            red: {
              color: 'red',
            }
          });
          css(styles.red);
        `,
          { importSources: [{ from: 'custom-stylex-path', as: 'css' }] },
        ),
      ).toMatchInlineSnapshot(`
        "import { css } from 'custom-stylex-path';
        css.inject(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });
  });
  describe('Specific edge-case bugs', () => {
    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          stylex(
            styles.root,
            sidebar == null ? styles.noSidebar : styles.withSidebar,
          );
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from '@stylexjs/stylex';
        stylex.inject(".x9f619{box-sizing:border-box}", 3000);
        stylex.inject(".x1yc5d2u{grid-area:sidebar}", 1000);
        stylex.inject(".x1fdo2jl{grid-area:content}", 1000);
        stylex.inject(".xrvj5dj{display:grid}", 3000);
        stylex.inject(".x7k18q3{grid-template-rows:100%}", 3000);
        stylex.inject(".x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        stylex.inject(".x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        stylex.inject(".x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        stylex.inject("@media (max-width: 640px){.xmr4b4k.xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        stylex.inject("@media (max-width: 640px){.xesbpuc.xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        stylex.inject("@media (max-width: 640px){.x15nfgh4.x15nfgh4{grid-template-columns:100%}}", 3200);
        stylex.inject(".x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        export const styles = {
          sidebar: {
            "UnknownFile__styles.sidebar": "UnknownFile__styles.sidebar",
            boxSizing: "x9f619",
            gridArea: "x1yc5d2u",
            gridRow: null,
            gridRowStart: null,
            gridRowEnd: null,
            gridColumn: null,
            gridColumnStart: null,
            gridColumnEnd: null,
            $$css: true
          },
          content: {
            "UnknownFile__styles.content": "UnknownFile__styles.content",
            gridArea: "x1fdo2jl",
            gridRow: null,
            gridRowStart: null,
            gridRowEnd: null,
            gridColumn: null,
            gridColumnStart: null,
            gridColumnEnd: null,
            $$css: true
          },
          root: {
            "UnknownFile__styles.root": "UnknownFile__styles.root",
            display: "xrvj5dj",
            gridTemplateRows: "x7k18q3",
            gridTemplateAreas: "x5gp9wm",
            $$css: true
          },
          withSidebar: {
            "UnknownFile__styles.withSidebar": "UnknownFile__styles.withSidebar",
            gridTemplateColumns: "x1rkzygb",
            gridTemplateRows: "x7k18q3",
            gridTemplateAreas: "x17lh93j",
            "@media (max-width: 640px)_gridTemplateRows": "xmr4b4k",
            "@media (max-width: 640px)_gridTemplateAreas": "xesbpuc",
            "@media (max-width: 640px)_gridTemplateColumns": "x15nfgh4",
            $$css: true
          },
          noSidebar: {
            "UnknownFile__styles.noSidebar": "UnknownFile__styles.noSidebar",
            gridTemplateColumns: "x1mkdm3x",
            $$css: true
          }
        };
        ({
          0: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4",
          1: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x"
        })[!!(sidebar == null) << 0];"
      `);
    });

    test('Basic stylex call - skip conditional', () => {
      expect(
        transform(
          `
          import stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          stylex(
            styles.root,
            sidebar == null ? styles.noSidebar : styles.withSidebar,
          );
        `,
          { dev: true },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from '@stylexjs/stylex';
        stylex.inject(".x9f619{box-sizing:border-box}", 3000);
        stylex.inject(".x1yc5d2u{grid-area:sidebar}", 1000);
        stylex.inject(".x1fdo2jl{grid-area:content}", 1000);
        stylex.inject(".xrvj5dj{display:grid}", 3000);
        stylex.inject(".x7k18q3{grid-template-rows:100%}", 3000);
        stylex.inject(".x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        stylex.inject(".x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        stylex.inject(".x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        stylex.inject("@media (max-width: 640px){.xmr4b4k.xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        stylex.inject("@media (max-width: 640px){.xesbpuc.xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        stylex.inject("@media (max-width: 640px){.x15nfgh4.x15nfgh4{grid-template-columns:100%}}", 3200);
        stylex.inject(".x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        export const styles = {
          sidebar: {
            "UnknownFile__styles.sidebar": "UnknownFile__styles.sidebar",
            boxSizing: "x9f619",
            gridArea: "x1yc5d2u",
            gridRow: null,
            gridRowStart: null,
            gridRowEnd: null,
            gridColumn: null,
            gridColumnStart: null,
            gridColumnEnd: null,
            $$css: true
          },
          content: {
            "UnknownFile__styles.content": "UnknownFile__styles.content",
            gridArea: "x1fdo2jl",
            gridRow: null,
            gridRowStart: null,
            gridRowEnd: null,
            gridColumn: null,
            gridColumnStart: null,
            gridColumnEnd: null,
            $$css: true
          },
          root: {
            "UnknownFile__styles.root": "UnknownFile__styles.root",
            display: "xrvj5dj",
            gridTemplateRows: "x7k18q3",
            gridTemplateAreas: "x5gp9wm",
            $$css: true
          },
          withSidebar: {
            "UnknownFile__styles.withSidebar": "UnknownFile__styles.withSidebar",
            gridTemplateColumns: "x1rkzygb",
            gridTemplateRows: "x7k18q3",
            gridTemplateAreas: "x17lh93j",
            "@media (max-width: 640px)_gridTemplateRows": "xmr4b4k",
            "@media (max-width: 640px)_gridTemplateAreas": "xesbpuc",
            "@media (max-width: 640px)_gridTemplateColumns": "x15nfgh4",
            $$css: true
          },
          noSidebar: {
            "UnknownFile__styles.noSidebar": "UnknownFile__styles.noSidebar",
            gridTemplateColumns: "x1mkdm3x",
            $$css: true
          }
        };
        stylex(styles.root, sidebar == null ? styles.noSidebar : styles.withSidebar);"
      `);
    });

    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          const complex = stylex(
            styles.root,
            sidebar == null && !isSidebar ? styles.noSidebar : styles.withSidebar,
            isSidebar && styles.sidebar,
            isContent && styles.content,
          );
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from '@stylexjs/stylex';
        stylex.inject(".x9f619{box-sizing:border-box}", 3000);
        stylex.inject(".x1yc5d2u{grid-area:sidebar}", 1000);
        stylex.inject(".x1fdo2jl{grid-area:content}", 1000);
        stylex.inject(".xrvj5dj{display:grid}", 3000);
        stylex.inject(".x7k18q3{grid-template-rows:100%}", 3000);
        stylex.inject(".x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        stylex.inject(".x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        stylex.inject(".x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        stylex.inject("@media (max-width: 640px){.xmr4b4k.xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        stylex.inject("@media (max-width: 640px){.xesbpuc.xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        stylex.inject("@media (max-width: 640px){.x15nfgh4.x15nfgh4{grid-template-columns:100%}}", 3200);
        stylex.inject(".x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        const complex = {
          0: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4",
          4: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x",
          2: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 UnknownFile__styles.sidebar x9f619 x1yc5d2u",
          6: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x UnknownFile__styles.sidebar x9f619 x1yc5d2u",
          1: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 UnknownFile__styles.content x1fdo2jl",
          5: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x UnknownFile__styles.content x1fdo2jl",
          3: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 UnknownFile__styles.sidebar x9f619 UnknownFile__styles.content x1fdo2jl",
          7: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x UnknownFile__styles.sidebar x9f619 UnknownFile__styles.content x1fdo2jl"
        }[!!(sidebar == null && !isSidebar) << 2 | !!isSidebar << 1 | !!isContent << 0];"
      `);
    });
  });
});
