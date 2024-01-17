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
    plugins: [jsx, [stylexPlugin, { ...opts, runtimeInjection: true }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.props() call', () => {
    test('empty stylex.props call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          stylex.props();
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        ({});"
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
          stylex.props(styles.red);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        ({
          className: "x1e2nbdu"
        });"
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
          stylex.props([styles[0], styles[1]]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        ({
          className: "x1e2nbdu x1t391ir"
        });"
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
          stylex.props([styles[0], styles[1]]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        ({
          className: "x1e2nbdu x1t391ir"
        });"
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
          stylex.props(styles['default']);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        ({
          className: "x1e2nbdu"
        });"
      `);
    });

    test('stylex call with multiple namespaces', () => {
      expect(
        transform(`
          import {create, props} from 'stylex';
          const styles = create({
            default: {
              color: 'red',
            },
          });
          const otherStyles = create({
            default: {
              backgroundColor: 'blue',
            }
          });
          props([styles.default, otherStyles.default]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import { create, props } from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        ({
          className: "x1e2nbdu x1t391ir"
        });"
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
            return stylex.props(styles.foo);
          }
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        const a = function () {
          return {
            className: "x1e2nbdu"
          };
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
          stylex.props([styles.foo, styles.bar]);
          const foo = styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
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
        ({
          className: "x1e2nbdu x1t391ir"
        });
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
            return stylex.props(styles.foo);
          }
          export function MyExport() {
            return stylex.props(styles.foo);
          }
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        export default function MyExportDefault() {
          return {
            className: "x1e2nbdu"
          };
        }
        export function MyExport() {
          return {
            className: "x1e2nbdu"
          };
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
          stylex.props(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x14odnwx{padding:5px}", 1000);
        ({
          className: "x14odnwx"
        });"
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
          stylex.props([styles.foo]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x14odnwx{padding:5px}", 1000);
        export const styles = {
          foo: {
            padding: "x14odnwx",
            paddingInline: null,
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingBlock: null,
            paddingTop: null,
            paddingBottom: null,
            $$css: true
          }
        };
        ({
          className: "x14odnwx"
        });"
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
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        ({
          className: "x1e2nbdu x17z2mba"
        });"
      `);
    });

    test('stylex call using styles with pseudo selectors within property', () => {
      expect(
        transform(`
          import * as stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: {
                default: 'red',
                ':hover': 'blue',
              }
            }
          });
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import * as stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        ({
          className: "x1e2nbdu x17z2mba"
        });"
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
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        ({
          className: "xrkmrrc xc445zv x1ssfqz5"
        });"
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
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        ({
          className: "xrkmrrc xc445zv x1ssfqz5"
        });"
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
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        ({
          className: "xrkmrrc x6m3b6q x6um648"
        });"
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
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        ({
          className: "xrkmrrc x6m3b6q x6um648"
        });"
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
            stylex.props([styles.default, isActive && styles.active]);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          ({
            0: {
              className: "xrkmrrc"
            },
            1: {
              className: "xrkmrrc xju2f9n"
            }
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
            stylex.props([styles.default, isActive && styles.active]);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
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
          stylex.props([styles.default, isActive && styles.active]);"
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
            stylex.props([styles.red, styles.blue]);
            stylex.props([styles.blue, styles.red]);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          ({
            className: "xju2f9n"
          });
          ({
            className: "x1e2nbdu"
          });"
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
            stylex.props([styles.red, styles.revert]);
            stylex.props([styles.revert, styles.red]);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          ({});
          ({
            className: "x1e2nbdu"
          });"
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
            stylex.props([styles.foo, styles.bar]);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x14odnwx{padding:5px}", 1000);
          _inject2(".x2vl965{padding-inline-end:10px}", 3000);
          _inject2(".x1i3ajwb{padding:2px}", 1000);
          _inject2(".xe2zdcy{padding-inline-start:10px}", 3000);
          ({
            className: "x2vl965 x1i3ajwb xe2zdcy"
          });"
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
            stylex.props([styles.foo, styles.bar]);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x14odnwx{padding:5px}", 1000);
          _inject2(".x2vl965{padding-inline-end:10px}", 3000);
          _inject2(".x1i3ajwb{padding:2px}", 1000);
          ({
            className: "x2vl965 x1i3ajwb"
          });"
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
            stylex.props([styles.red, isActive && styles.blue]);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          ({
            0: {
              className: "x1e2nbdu"
            },
            1: {
              className: "xju2f9n"
            }
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
            stylex.props([styles.red, isActive && styles.blue]);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
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
          stylex.props([styles.red, isActive && styles.blue]);"
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
            stylex.props([styles.red, isActive && styles.blue]);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          ({
            0: {
              className: "x1e2nbdu"
            },
            1: {}
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
            stylex.props([styles.red, isActive && styles.blue]);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
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
          stylex.props([styles.red, isActive && styles.blue]);"
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
              stylex.props(styles.default);
            `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          ({
            className: "FooBar__styles.default x1e2nbdu"
          });"
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
              stylex.props([styles.default, isActive && otherStyles.default]);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
          ({
            0: {
              className: "FooBar__styles.default x1e2nbdu"
            },
            1: {
              className: "FooBar__styles.default x1e2nbdu FooBar__otherStyles.default x1t391ir"
            }
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
              stylex.props([styles.default, isActive && otherStyles.default]);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              "FooBar__styles.default": "FooBar__styles.default",
              color: "x1e2nbdu",
              $$css: true
            }
          };
          _inject2(".x1t391ir{background-color:blue}", 3000);
          const otherStyles = {
            default: {
              "FooBar__otherStyles.default": "FooBar__otherStyles.default",
              backgroundColor: "x1t391ir",
              $$css: true
            }
          };
          stylex.props([styles.default, isActive && otherStyles.default]);"
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
              stylex.props([styles.default, isActive && styles.active]);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          ({
            0: {
              className: "FooBar__styles.default x1e2nbdu"
            },
            1: {
              className: "FooBar__styles.default FooBar__styles.active xju2f9n"
            }
          })[!!isActive << 0];"
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
            stylex.props(styles[variant]);
          `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
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
        stylex.props(styles[variant]);"
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
          stylex.props([styles.default, props]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        const styles = {
          default: {
            color: "x1e2nbdu",
            $$css: true
          }
        };
        stylex.props([styles.default, props]);"
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
          stylex.props(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        export const styles = {
          default: {
            ":hover_color": "x17z2mba",
            "@media (min-width: 1000px)_backgroundColor": "xc445zv",
            $$css: true
          }
        };
        ({
          className: "x17z2mba xc445zv"
        });"
      `);
    });

    describe('even when stylex calls come first', () => {
      test('stylex call with computed key access', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex.props(styles[variant]);
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          stylex.props(styles[variant]);
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
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
                  <div {...stylex.props(styles.foo)} />
                  <div {...stylex.props(styles.bar)} />
                  <CustomComponent xstyle={styles.foo} />
                  <div {...stylex.props([styles.foo, styles.bar])} />
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          function MyComponent() {
            return <>
                            <div {...{
                className: "x1e2nbdu"
              }} />
                            <div {...{
                className: "x1t391ir"
              }} />
                            <CustomComponent xstyle={styles.foo} />
                            <div {...{
                className: "x1e2nbdu x1t391ir"
              }} />
                          </>;
          }
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            foo: {
              color: "x1e2nbdu",
              $$css: true
            }
          };"
        `);
      });
      test('stylex call with composition of external styles', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex.props([styles.default, props]);
            const styles = stylex.create({
              default: {
                color: 'red',
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          stylex.props([styles.default, props]);
          _inject2(".x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              color: "x1e2nbdu",
              $$css: true
            }
          };"
        `);
      });

      test('stylex call using exported styles with pseudo selectors, and queries', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex.props(styles.default);
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          import stylex from 'stylex';
          var _inject2 = _inject;
          ({
            className: "x17z2mba xc445zv"
          });
          _inject2(".x17z2mba:hover{color:blue}", 3130);
          _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
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
          stylex.props(styles.red);
        `,
          { importSources: ['custom-stylex-path'] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'custom-stylex-path';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        ({
          className: "x1e2nbdu"
        });"
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
          stylex.props([
            styles.root,
            sidebar == null ? styles.noSidebar : styles.withSidebar,
          ]);
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from '@stylexjs/stylex';
        var _inject2 = _inject;
        _inject2(".x9f619{box-sizing:border-box}", 3000);
        _inject2(".x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".x1fdo2jl{grid-area:content}", 1000);
        _inject2(".xrvj5dj{display:grid}", 3000);
        _inject2(".x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.xmr4b4k.xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.xesbpuc.xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.x15nfgh4.x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
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
          0: {
            className: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4"
          },
          1: {
            className: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x"
          }
        })[!!(sidebar == null) << 0];"
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
          const complex = stylex.props([
            styles.root,
            sidebar == null && !isSidebar ? styles.noSidebar : styles.withSidebar,
            isSidebar && styles.sidebar,
            isContent && styles.content,
          ]);
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from '@stylexjs/stylex';
        var _inject2 = _inject;
        _inject2(".x9f619{box-sizing:border-box}", 3000);
        _inject2(".x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".x1fdo2jl{grid-area:content}", 1000);
        _inject2(".xrvj5dj{display:grid}", 3000);
        _inject2(".x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.xmr4b4k.xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.xesbpuc.xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.x15nfgh4.x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        const complex = {
          0: {
            className: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4"
          },
          4: {
            className: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x"
          },
          2: {
            className: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 UnknownFile__styles.sidebar x9f619 x1yc5d2u"
          },
          6: {
            className: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x UnknownFile__styles.sidebar x9f619 x1yc5d2u"
          },
          1: {
            className: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 UnknownFile__styles.content x1fdo2jl"
          },
          5: {
            className: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x UnknownFile__styles.content x1fdo2jl"
          },
          3: {
            className: "UnknownFile__styles.root xrvj5dj UnknownFile__styles.withSidebar x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 UnknownFile__styles.sidebar x9f619 UnknownFile__styles.content x1fdo2jl"
          },
          7: {
            className: "UnknownFile__styles.root xrvj5dj x7k18q3 x5gp9wm UnknownFile__styles.noSidebar x1mkdm3x UnknownFile__styles.sidebar x9f619 UnknownFile__styles.content x1fdo2jl"
          }
        }[!!(sidebar == null && !isSidebar) << 2 | !!isSidebar << 1 | !!isContent << 0];"
      `);
    });
  });
});
