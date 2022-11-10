/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
      flow: {
        all: true,
      },
    },
    plugins: [jsx, [stylexPlugin, opts]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex() call', () => {
    test('empty stylex call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          stylex();
        `)
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        stylex.inject(".x1t391ir{background-color:blue}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        stylex.inject(".x1t391ir{background-color:blue}", 1);
        "x1e2nbdu x1t391ir";"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        stylex.inject(".x1t391ir{background-color:blue}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        stylex.inject(".x1t391ir{background-color:blue}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x123j3cw{padding-top:5px}", 1);
        stylex.inject(".x1mpkggp{padding-right:5px}", 1, ".x1mpkggp{padding-left:5px}");
        stylex.inject(".xs9asl8{padding-bottom:5px}", 1);
        stylex.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
        "x123j3cw x1mpkggp xs9asl8 x1t2a60a";"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x123j3cw{padding-top:5px}", 1);
        stylex.inject(".x1mpkggp{padding-right:5px}", 1, ".x1mpkggp{padding-left:5px}");
        stylex.inject(".xs9asl8{padding-bottom:5px}", 1);
        stylex.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
        export const styles = {
          foo: {
            paddingTop: "x123j3cw",
            paddingEnd: "x1mpkggp",
            paddingBottom: "xs9asl8",
            paddingStart: "x1t2a60a",
            $$css: true
          }
        };
        "x123j3cw x1mpkggp xs9asl8 x1t2a60a";"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        stylex.inject(".x17z2mba:hover{color:blue}", 8);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 1);
        stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 2);
        stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 2);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 1);
        stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 2);
        stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 2);
        "xrkmrrc x6m3b6q x6um648";"
      `);
    });

    describe('with conditional styles and collisions', () => {
      test('stylex call with conditions', () => {
        expect(
          transform(`
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 1);
          stylex.inject(".xju2f9n{color:blue}", 1);
          "xrkmrrc" + (isActive ? " xju2f9n" : "");"
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
          stylex.inject(".xju2f9n{color:blue}", 1);
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x123j3cw{padding-top:5px}", 1);
          stylex.inject(".x1iji9kk{padding-right:10px}", 1, ".x1iji9kk{padding-left:10px}");
          stylex.inject(".xs9asl8{padding-bottom:5px}", 1);
          stylex.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
          stylex.inject(".x1nn3v0j{padding-top:2px}", 1);
          stylex.inject(".xg83lxy{padding-right:2px}", 1, ".xg83lxy{padding-left:2px}");
          stylex.inject(".x1120s5i{padding-bottom:2px}", 1);
          stylex.inject(".x1sln4lm{padding-left:10px}", 1, ".x1sln4lm{padding-right:10px}");
          "x1nn3v0j xg83lxy x1120s5i x1sln4lm";"
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x123j3cw{padding-top:5px}", 1);
          stylex.inject(".x1iji9kk{padding-right:10px}", 1, ".x1iji9kk{padding-left:10px}");
          stylex.inject(".xs9asl8{padding-bottom:5px}", 1);
          stylex.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
          stylex.inject(".x1nn3v0j{padding-top:2px}", 1);
          stylex.inject(".xg83lxy{padding-right:2px}", 1, ".xg83lxy{padding-left:2px}");
          stylex.inject(".x1120s5i{padding-bottom:2px}", 1);
          stylex.inject(".x1h0ha7o{padding-left:2px}", 1, ".x1h0ha7o{padding-right:2px}");
          "x1nn3v0j xg83lxy x1120s5i";"
        `);
      });

      test('stylex call with conditions and collisions', () => {
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
            stylex(styles.red, isActive && styles.blue);
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
          stylex.inject(".xju2f9n{color:blue}", 1);
          "" + (isActive ? " xju2f9n" : " x1e2nbdu");"
        `);
      });

      test('stylex call with conditions and null collisions', () => {
        expect(
          transform(`
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
          "" + (isActive ? "" : " x1e2nbdu");"
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
            options
          )
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
          "FooBar__styles.default x1e2nbdu";"
        `);
      });

      test('stylex call produces dev class name with conditions', () => {
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
            options
          )
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
          stylex.inject(".x1t391ir{background-color:blue}", 1);
          "FooBar__styles.default x1e2nbdu" + (isActive ? " FooBar__otherStyles.default x1t391ir" : "");"
        `);
      });

      test('stylex call produces dev class name with collisions', () => {
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
            options
          )
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1e2nbdu{color:red}", 1);
          stylex.inject(".xju2f9n{color:blue}", 1);
          "FooBar__styles.default" + (isActive ? " xju2f9n FooBar__styles.active" : " x1e2nbdu");"
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
          `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        stylex.inject(".x1t391ir{background-color:blue}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x17z2mba:hover{color:blue}", 8);
        stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 2);
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex(styles[variant]);
          stylex.inject(".x1e2nbdu{color:red}", 1);
          stylex.inject(".x1t391ir{background-color:blue}", 1);
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
          `)
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
          stylex.inject(".x1e2nbdu{color:red}", 1);
          stylex.inject(".x1t391ir{background-color:blue}", 1);
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex(styles.default, props);
          stylex.inject(".x1e2nbdu{color:red}", 1);
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
          `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          "x17z2mba xc445zv";
          stylex.inject(".x17z2mba:hover{color:blue}", 8);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 2);
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
          { importSources: ['custom-stylex-path'] }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from 'custom-stylex-path';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        "x1e2nbdu";"
      `);
    });
  });
  describe('Specific edge-case bugs', () => {
    test.only('Basic stylex call', () => {
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
          { dev: true }
        )
      ).toMatchInlineSnapshot(`
        "import stylex from '@stylexjs/stylex';
        stylex.inject(".x9f619{box-sizing:border-box}", 1);
        stylex.inject(".x1yc5d2u{grid-area:sidebar}", 1);
        stylex.inject(".x1fdo2jl{grid-area:content}", 1);
        stylex.inject(".xrvj5dj{display:grid}", 1);
        stylex.inject(".x7k18q3{grid-template-rows:100%}", 1);
        stylex.inject(".x5gp9wm{grid-template-areas:\\"content\\"}", 1);
        stylex.inject(".x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 1);
        stylex.inject(".x17lh93j{grid-template-areas:\\"sidebar content\\"}", 1);
        stylex.inject("@media (max-width: 640px){.xmr4b4k.xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 2);
        stylex.inject("@media (max-width: 640px){.xesbpuc.xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2);
        stylex.inject("@media (max-width: 640px){.x15nfgh4.x15nfgh4{grid-template-columns:100%}}", 2);
        stylex.inject(".x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 1);
        export const styles = {
          sidebar: {
            "UnkownFile__styles.sidebar": "UnkownFile__styles.sidebar",
            boxSizing: "x9f619",
            gridArea: "x1yc5d2u",
            $$css: true
          },
          content: {
            "UnkownFile__styles.content": "UnkownFile__styles.content",
            gridArea: "x1fdo2jl",
            $$css: true
          },
          root: {
            "UnkownFile__styles.root": "UnkownFile__styles.root",
            display: "xrvj5dj",
            gridTemplateRows: "x7k18q3",
            gridTemplateAreas: "x5gp9wm",
            $$css: true
          },
          withSidebar: {
            "UnkownFile__styles.withSidebar": "UnkownFile__styles.withSidebar",
            gridTemplateColumns: "x1rkzygb",
            gridTemplateRows: "x7k18q3",
            gridTemplateAreas: "x17lh93j",
            "@media (max-width: 640px)_gridTemplateRows": "xmr4b4k",
            "@media (max-width: 640px)_gridTemplateAreas": "xesbpuc",
            "@media (max-width: 640px)_gridTemplateColumns": "x15nfgh4",
            $$css: true
          },
          noSidebar: {
            "UnkownFile__styles.noSidebar": "UnkownFile__styles.noSidebar",
            gridTemplateColumns: "x1mkdm3x",
            $$css: true
          }
        };
        "UnkownFile__styles.root xrvj5dj" + (sidebar == null ? " x7k18q3 x5gp9wm UnkownFile__styles.noSidebar x1mkdm3x" : " x7k18q3 x17lh93j  x1rkzygb UnkownFile__styles.withSidebar xmr4b4k xesbpuc x15nfgh4");"
      `);
    });
  });
});
