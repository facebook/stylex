/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-syntax-jsx';
import stylexPlugin from '../src/index';
import path from 'path';

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      sourceType: 'module',
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      jsx,
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: __dirname,
            type: 'commonJS',
          },
          ...opts,
          runtimeInjection: true,
        },
      ],
    ],
  }).code;
}

const THIS_FILE = path.join(__dirname, 'transform-stylex-props-test.js');

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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        ({
          className: "x1e2nbdu"
        });"
      `);
    });

    test('stylex.env resolves in inline objects', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            red: {
              color: stylex.env.primaryColor,
            }
          });
          stylex.props(styles.red);
        `,
          { env: { primaryColor: '#ff0000' } },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xe4pkkx{color:#ff0000}", 3000);
        ({
          className: "xe4pkkx"
        });"
      `);
    });

    test('named env import resolves in inline objects', () => {
      expect(
        transform(
          `
          import { props, create, env } from 'stylex';
          const styles = create({
            red: {
              color: env.primaryColor,
            }
          });
          props(styles.red);
        `,
          { env: { primaryColor: '#00ffaa' } },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import { props, create, env } from 'stylex';
        _inject2(".x4iekqp{color:#00ffaa}", 3000);
        ({
          className: "x4iekqp"
        });"
      `);
    });

    describe('props calls with jsx', () => {
      const options = {
        debug: true,
        dev: true,
        filename: '/js/node_modules/npm-package/dist/components/Foo.react.js',
      };

      test('local static styles', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              }
            });
            function Foo() {
              return (
                <>
                  <div id="test" {...stylex.props(styles.red)}>Hello World</div>
                  <div className="test" {...stylex.props(styles.red)} id="test">Hello World</div>
                  <div id="test" {...stylex.props(styles.red)} className="test">Hello World</div>
                </>
              );
            }
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          function Foo() {
            return <>
                            <div id="test" className="color-x1e2nbdu" data-style-src="npm-package:components/Foo.react.js:4">Hello World</div>
                            <div className="test" className="color-x1e2nbdu" data-style-src="npm-package:components/Foo.react.js:4" id="test">Hello World</div>
                            <div id="test" className="color-x1e2nbdu" data-style-src="npm-package:components/Foo.react.js:4" className="test">Hello World</div>
                          </>;
          }"
        `);
      });

      test('local dynamic styles', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              opacity: (opacity) => ({
                opacity
              })
            });
            function Foo() {
              return (
                <div id="test" {...stylex.props(styles.red, styles.opacity(1))}>
                  Hello World
                </div>
              );
            }
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          _inject2(".opacity-xb4nw82{opacity:var(--x-opacity)}", 3000);
          _inject2("@property --x-opacity { syntax: \\"*\\"; inherits: false;}", 0);
          const styles = {
            red: {
              "color-kMwMTN": "color-x1e2nbdu",
              $$css: "npm-package:components/Foo.react.js:4"
            },
            opacity: opacity => [{
              "opacity-kSiTet": opacity != null ? "opacity-xb4nw82" : opacity,
              $$css: "npm-package:components/Foo.react.js:7"
            }, {
              "--x-opacity": opacity != null ? opacity : undefined
            }]
          };
          function Foo() {
            return <div id="test" {...stylex.props(styles.red, styles.opacity(1))}>
                            Hello World
                          </div>;
          }"
        `);
      });

      test('non-local styles', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              }
            });
            function Foo(props) {
              return (
                <div id="test" {...stylex.props(props.style, styles.red)}>
                  Hello World
                </div>
              );
            }
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          const styles = {
            red: {
              "color-kMwMTN": "color-x1e2nbdu",
              $$css: "npm-package:components/Foo.react.js:4"
            }
          };
          function Foo(props) {
            return <div id="test" {...stylex.props(props.style, styles.red)}>
                            Hello World
                          </div>;
          }"
        `);
      });
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import { create, props } from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          foo: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          },
          bar: {
            kWkggS: "x1t391ir",
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14odnwx{padding:5px}", 1000);
        export const styles = {
          foo: {
            kmVPX3: "x14odnwx",
            $$css: true
          }
        };
        ({
          className: "x14odnwx"
        });"
      `);
    });

    test('Last property wins, even if shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const borderRadius = 2;
          export const styles = stylex.create({
            default: {
              marginBottom: 15,
              marginInlineEnd: 10,
              marginInlineStart: 20,
              marginTop: 5,
            },
            override: {
              margin: 0,
              marginBottom: 100,
            }
          });
          const result = stylex.props(styles.default, styles.override);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const borderRadius = 2;
        _inject2(".x1fqp7bg{margin-bottom:15px}", 4000);
        _inject2(".x1sa5p1d{margin-inline-end:10px}", 3000);
        _inject2(".xqsn43r{margin-inline-start:20px}", 3000);
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".x1ghz6dp{margin:0}", 1000);
        _inject2(".xiv7p99{margin-bottom:100px}", 4000);
        export const styles = {
          default: {
            k1K539: "x1fqp7bg",
            k71WvV: "x1sa5p1d",
            keTefX: "xqsn43r",
            keoZOQ: "x1ok221b",
            $$css: true
          },
          override: {
            kogj98: "x1ghz6dp",
            k1K539: "xiv7p99",
            $$css: true
          }
        };
        const result = {
          className: "x1sa5p1d xqsn43r x1ok221b x1ghz6dp xiv7p99"
        };"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import * as stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@media (min-width: 1000px) and (max-width: 1999.99px){.xw6up8c.xw6up8c{background-color:blue}}", 3200);
        _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        ({
          className: "xrkmrrc xw6up8c x1ssfqz5"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        ({
          className: "xrkmrrc x6m3b6q x6um648"
        });"
      `);
    });

    describe('with contextual styles and collisions', () => {
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
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
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
            { enableInlinedConditionalMerge: false },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          const styles = {
            default: {
              kWkggS: "xrkmrrc",
              $$css: true
            },
            active: {
              kMwMTN: "xju2f9n",
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
          var _inject2 = _inject;
          import stylex from 'stylex';
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
          var _inject2 = _inject;
          import stylex from 'stylex';
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
          var _inject2 = _inject;
          import stylex from 'stylex';
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
          var _inject2 = _inject;
          import stylex from 'stylex';
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
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
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
            { enableInlinedConditionalMerge: false },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          const styles = {
            red: {
              kMwMTN: "x1e2nbdu",
              $$css: true
            },
            blue: {
              kMwMTN: "xju2f9n",
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
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
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
            { enableInlinedConditionalMerge: false },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          const styles = {
            red: {
              kMwMTN: "x1e2nbdu",
              $$css: true
            },
            blue: {
              kMwMTN: null,
              $$css: true
            }
          };
          stylex.props([styles.red, isActive && styles.blue]);"
        `);
      });
    });

    // COMPOSITION
    describe('with plugin options', () => {
      test('dev:true and enableInlinedConditionalMerge:false', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
          enableInlinedConditionalMerge: false,
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
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          ({
            className: "color-x1e2nbdu",
            "data-style-src": "js/FooBar.react.js:4"
          });"
        `);

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
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              "color-kMwMTN": "color-x1e2nbdu",
              $$css: "js/FooBar.react.js:4"
            }
          };
          _inject2(".backgroundColor-x1t391ir{background-color:blue}", 3000);
          const otherStyles = {
            default: {
              "backgroundColor-kWkggS": "backgroundColor-x1t391ir",
              $$css: "js/FooBar.react.js:9"
            }
          };
          stylex.props([styles.default, isActive && otherStyles.default]);"
        `);
      });

      test('dev:true', () => {
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
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          _inject2(".backgroundColor-x1t391ir{background-color:blue}", 3000);
          ({
            0: {
              className: "color-x1e2nbdu",
              "data-style-src": "js/FooBar.react.js:4"
            },
            1: {
              className: "color-x1e2nbdu backgroundColor-x1t391ir",
              "data-style-src": "js/FooBar.react.js:4; js/FooBar.react.js:9"
            }
          })[!!isActive << 0];"
        `);

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
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          _inject2(".color-xju2f9n{color:blue}", 3000);
          ({
            0: {
              className: "color-x1e2nbdu",
              "data-style-src": "js/FooBar.react.js:4"
            },
            1: {
              className: "color-xju2f9n",
              "data-style-src": "js/FooBar.react.js:4; js/FooBar.react.js:7"
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          "0": {
            kMwMTN: "x1e2nbdu",
            $$css: true
          },
          "1": {
            kWkggS: "x1t391ir",
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        const styles = {
          default: {
            kMwMTN: "x1e2nbdu",
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
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        export const styles = {
          default: {
            kDPRdz: "x17z2mba",
            ksQ81T: "xc445zv",
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
          var _inject2 = _inject;
          import stylex from 'stylex';
          stylex.props(styles[variant]);
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            "0": {
              kMwMTN: "x1e2nbdu",
              $$css: true
            },
            "1": {
              kWkggS: "x1t391ir",
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
          var _inject2 = _inject;
          import stylex from 'stylex';
          function MyComponent() {
            return <>
                            <div className="x1e2nbdu" />
                            <div className="x1t391ir" />
                            <CustomComponent xstyle={styles.foo} />
                            <div className="x1e2nbdu x1t391ir" />
                          </>;
          }
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            foo: {
              kMwMTN: "x1e2nbdu",
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
          var _inject2 = _inject;
          import stylex from 'stylex';
          stylex.props([styles.default, props]);
          _inject2(".x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              kMwMTN: "x1e2nbdu",
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
          var _inject2 = _inject;
          import stylex from 'stylex';
          ({
            className: "x17z2mba xc445zv"
          });
          _inject2(".x17z2mba:hover{color:blue}", 3130);
          _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          export const styles = {
            default: {
              kDPRdz: "x17z2mba",
              ksQ81T: "xc445zv",
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
        var _inject2 = _inject;
        import stylex from 'custom-stylex-path';
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
          import * as stylex from '@stylexjs/stylex';
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
          { dev: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        export const styles = {
          sidebar: {
            "boxSizing-kB7OPa": "boxSizing-x9f619",
            "gridArea-kJuA4N": "gridArea-x1yc5d2u",
            $$css: true
          },
          content: {
            "gridArea-kJuA4N": "gridArea-x1fdo2jl",
            $$css: true
          },
          root: {
            "display-k1xSpc": "display-xrvj5dj",
            "gridTemplateRows-k9llMU": "gridTemplateRows-x7k18q3",
            "gridTemplateAreas-kC13JO": "gridTemplateAreas-x5gp9wm",
            $$css: true
          },
          withSidebar: {
            "gridTemplateColumns-kumcoG": "gridTemplateColumns-x1rkzygb",
            "gridTemplateRows-k9llMU": "gridTemplateRows-x7k18q3",
            "gridTemplateAreas-kC13JO": "gridTemplateAreas-x17lh93j",
            "@media (max-width: 640px)_gridTemplateRows-k9pwkU": "gridTemplateRows-xmr4b4k",
            "@media (max-width: 640px)_gridTemplateAreas-kOnEH4": "gridTemplateAreas-xesbpuc",
            "@media (max-width: 640px)_gridTemplateColumns-k1JLwA": "gridTemplateColumns-x15nfgh4",
            $$css: true
          },
          noSidebar: {
            "gridTemplateColumns-kumcoG": "gridTemplateColumns-x1mkdm3x",
            $$css: true
          }
        };
        ({
          0: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4"
          },
          1: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x"
          }
        })[!!(sidebar == null) << 0];"
      `);
    });

    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
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
          {
            filename: '/html/js/FooBar.react.js',
            dev: true,
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        const complex = {
          0: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16"
          },
          4: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26"
          },
          2: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 boxSizing-x9f619 gridArea-x1yc5d2u",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:4"
          },
          6: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x boxSizing-x9f619 gridArea-x1yc5d2u",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:4"
          },
          1: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:8"
          },
          5: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:8"
          },
          3: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 boxSizing-x9f619 gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:4; js/FooBar.react.js:8"
          },
          7: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x boxSizing-x9f619 gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:4; js/FooBar.react.js:8"
          }
        }[!!(sidebar == null && !isSidebar) << 2 | !!isSidebar << 1 | !!isContent << 0];"
      `);
    });

    test('Stylex call with debug on', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
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
          {
            filename: '/html/js/FooBar.react.js',
            dev: true,
            debug: true,
            enableDebugClassNames: true,
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        const complex = {
          0: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16"
          },
          4: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26"
          },
          2: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 boxSizing-x9f619 gridArea-x1yc5d2u",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:4"
          },
          6: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x boxSizing-x9f619 gridArea-x1yc5d2u",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:4"
          },
          1: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:8"
          },
          5: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:8"
          },
          3: {
            className: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 boxSizing-x9f619 gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:4; js/FooBar.react.js:8"
          },
          7: {
            className: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x boxSizing-x9f619 gridArea-x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:4; js/FooBar.react.js:8"
          }
        }[!!(sidebar == null && !isSidebar) << 2 | !!isSidebar << 1 | !!isContent << 0];"
      `);
    });

    test('Stylex call with debug on and debug classnames off', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
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
          {
            filename: '/html/js/FooBar.react.js',
            dev: true,
            debug: true,
            enableDebugClassNames: false,
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
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
            className: "xrvj5dj x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16"
          },
          4: {
            className: "xrvj5dj x7k18q3 x5gp9wm x1mkdm3x",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26"
          },
          2: {
            className: "xrvj5dj x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 x9f619 x1yc5d2u",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:4"
          },
          6: {
            className: "xrvj5dj x7k18q3 x5gp9wm x1mkdm3x x9f619 x1yc5d2u",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:4"
          },
          1: {
            className: "xrvj5dj x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:8"
          },
          5: {
            className: "xrvj5dj x7k18q3 x5gp9wm x1mkdm3x x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:8"
          },
          3: {
            className: "xrvj5dj x1rkzygb x7k18q3 x17lh93j xmr4b4k xesbpuc x15nfgh4 x9f619 x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:16; js/FooBar.react.js:4; js/FooBar.react.js:8"
          },
          7: {
            className: "xrvj5dj x7k18q3 x5gp9wm x1mkdm3x x9f619 x1fdo2jl",
            "data-style-src": "js/FooBar.react.js:11; js/FooBar.react.js:26; js/FooBar.react.js:4; js/FooBar.react.js:8"
          }
        }[!!(sidebar == null && !isSidebar) << 2 | !!isSidebar << 1 | !!isContent << 0];"
      `);
    });

    test('hoisting correctly with duplicte names', () => {
      expect(
        transform(
          `
            import * as stylex from "@stylexjs/stylex";
            import * as React from "react";

            function Foo() {
              const styles = stylex.create({
                div: { color: "red" },
              });
              return <div {...stylex.props(styles.div)}>Hello, foo!</div>;
            }

            function Bar() {
              const styles = stylex.create({
                div: { color: "blue" },
              });
              return <div {...stylex.props(styles.div)}>Hello, bar!</div>;
            }

            export function App() {
              return (
                <>
                  <Foo />
                  <Bar />
                </>
              );
            }
          `,
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from "@stylexjs/stylex";
        import * as React from "react";
        _inject2(".x1e2nbdu{color:red}", 3000);
        const _styles = {
          div: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          }
        };
        function Foo() {
          const styles = _styles;
          return <div {...stylex.props(styles.div)}>Hello, foo!</div>;
        }
        _inject2(".xju2f9n{color:blue}", 3000);
        const _styles2 = {
          div: {
            kMwMTN: "xju2f9n",
            $$css: true
          }
        };
        function Bar() {
          const styles = _styles2;
          return <div {...stylex.props(styles.div)}>Hello, bar!</div>;
        }
        export function App() {
          return <>
                          <Foo />
                          <Bar />
                        </>;
        }"
      `);
    });
  });

  describe('dealing with imports', () => {
    test('all local styles', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            default: {
              color: 'black',
            },
            red: {
              color: 'red',
            },
            blueBg: {
              backgroundColor: 'blue',
            },

          });

          <div {...stylex.props(styles.default, styles.red, styles.blueBg)} />
        `,
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".x1mqxbix{color:black}", 3000);
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        <div className="x1e2nbdu x1t391ir" />;"
      `);
    });
    test('local array styles', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            default: {
              color: 'black',
            },
            red: {
              color: 'red',
            },
            blueBg: {
              backgroundColor: 'blue',
            },
          });

          const base = [styles.default, styles.red];

          <div {...stylex.props(base, styles.blueBg)} />
        `,
          {
            enableMinifiedKeys: false,
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".x1mqxbix{color:black}", 3000);
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          default: {
            color: "x1mqxbix",
            $$css: true
          },
          red: {
            color: "x1e2nbdu",
            $$css: true
          }
        };
        const base = [styles.default, styles.red];
        <div className="x1e2nbdu x1t391ir" />;"
      `);
    });
    test('regular style import', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          import {someStyle} from './otherFile';
          const styles = stylex.create({
            default: {
              color: 'black',
            },
          });
          <div {...stylex.props(styles.default, someStyle)} />
        `,
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        import { someStyle } from './otherFile';
        _inject2(".x1mqxbix{color:black}", 3000);
        const styles = {
          default: {
            kMwMTN: "x1mqxbix",
            $$css: true
          }
        };
        <div {...stylex.props(styles.default, someStyle)} />;"
      `);
    });
    test('default import from .stylex.js file', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          import {someStyle, vars} from './__fixtures__/constants.stylex.js';
          const styles = stylex.create({
            default: {
              color: 'black',
              backgroundColor: vars.foo,
            },
          });
          <div {...stylex.props(styles.default, someStyle)} />
        `,
          {
            filename: THIS_FILE,
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        import { someStyle, vars } from './__fixtures__/constants.stylex.js';
        _inject2(".x1mqxbix{color:black}", 3000);
        _inject2(".x1ptj8da{background-color:var(--xu6xsfm)}", 3000);
        const styles = {
          default: {
            kMwMTN: "x1mqxbix",
            kWkggS: "x1ptj8da",
            $$css: true
          }
        };
        <div {...stylex.props(styles.default, someStyle)} />;"
      `);
    });
    test('object import from .stylex.js file', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          import {someStyle} from './__fixtures__/constants.stylex.js';
          const styles = stylex.create({
            default: {
              color: 'black',
              backgroundColor: someStyle.foo,
            },
          });
          <div {...stylex.props(styles.default, someStyle.foo)} />
        `,
          {
            filename: THIS_FILE,
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        import { someStyle } from './__fixtures__/constants.stylex.js';
        _inject2(".x1mqxbix{color:black}", 3000);
        _inject2(".xxtkuhj{background-color:var(--x18h8e3f)}", 3000);
        const styles = {
          default: {
            kMwMTN: "x1mqxbix",
            kWkggS: "xxtkuhj",
            $$css: true
          }
        };
        <div {...stylex.props(styles.default, someStyle.foo)} />;"
      `);
    });
  });
});
