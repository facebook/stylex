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
const flowPlugin = require('@babel/plugin-syntax-flow');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [flowPlugin, [stylexPlugin, { runtimeInjection: true, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.create()', () => {
    test('transforms style object', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('transforms style object with import *', () => {
      expect(
        transform(`
           import * as foo from 'stylex';
           const styles = foo.create({
             default: {
               backgroundColor: 'red',
               color: 'blue',
             }
           });
         `),
      ).toMatchInlineSnapshot(`
        "import * as foo from 'stylex';
        foo.inject(".xrkmrrc{background-color:red}", 3000);
        foo.inject(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('transforms style object with named imports', () => {
      expect(
        transform(`
           import {create} from 'stylex';
           const styles = create({
             default: {
               backgroundColor: 'red',
               color: 'blue',
             }
           });
         `),
      ).toMatchInlineSnapshot(`
        "import { create } from 'stylex';
        import __stylex__ from "stylex";
        __stylex__.inject(".xrkmrrc{background-color:red}", 3000);
        __stylex__.inject(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('transforms style object with custom property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              '--background-color': 'red',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xgau0yw{--background-color:red}", 1);"
      `);
    });

    test('transforms style object with custom property as value', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              '--final-color': 'var(--background-color)',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x13tgbkp{--final-color:var(--background-color)}", 1);"
      `);
    });

    test('transforms multiple namespaces', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: 'red',
            },
            default2: {
              color: 'blue',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('does not transform attr() value', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              content: 'attr(some-attribute)',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xd71okc{content:attr(some-attribute)}", 3000);"
      `);
    });

    test('handles camelCased transition properties', () => {
      const camelCased = transform(`
        import stylex from 'stylex';
        const styles = stylex.create({
          default: {
            transitionProperty: 'marginTop',
          },
        });
      `);
      const kebabCased = transform(`
        import stylex from 'stylex';
        const styles = stylex.create({
          default: {
            transitionProperty: 'margin-top',
          },
        });
      `);

      expect(camelCased).toEqual(kebabCased);

      expect(camelCased).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1cfch2b{transition-property:margin-top}", 3000);"
      `);
    });

    test('leaves transition properties of custom properties alone', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              transitionProperty: '--foo',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x17389it{transition-property:--foo}", 3000);"
      `);
    });

    test('transforms nested pseudo-class to CSS', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               ':hover': {
                 backgroundColor: 'red',
                 color: 'blue',
               },
             },
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1gykpug:hover{background-color:red}", 3130);
        stylex.inject(".x17z2mba:hover{color:blue}", 3130);"
      `);
    });

    test('transforms nested pseudo-class within properties to CSS', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               backgroundColor: {
                 ':hover': 'red',
               },
               color: {
                 ':hover': 'blue',
               }
             },
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1gykpug:hover{background-color:red}", 3130);
        stylex.inject(".x17z2mba:hover{color:blue}", 3130);"
      `);
    });

    test('transforms array values as fallbacks', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               position: ['sticky', 'fixed']
             },
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1ruww2u{position:sticky;position:fixed}", 3000);"
      `);
    });

    test('transforms array values as fallbacks within media query', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               position: {
                 default: 'fixed',
                 '@media (min-width: 768px)': ['sticky', 'fixed'],
               }
             },
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xixxii4{position:fixed}", 3000);
        stylex.inject("@media (min-width: 768px){.x1vazst0.x1vazst0{position:sticky;position:fixed}}", 3200);"
      `);
    });

    // TODO: add more vendor-prefixed properties and values
    test('transforms properties requiring vendor prefixes', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               userSelect: 'none',
             },
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x87ps6o{user-select:none}", 3000);"
      `);
    });

    // Legacy, short?
    test('transforms valid shorthands', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               overflow: 'hidden',
               borderStyle: 'dashed',
               borderWidth: 1
             }
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xb3r6kr{overflow:hidden}", 2000);
        stylex.inject(".xbsl7fq{border-style:dashed}", 2000);
        stylex.inject(".xmkeg23{border-width:1px}", 2000);"
      `);
    });

    test('Uses stylex.include correctly with Identifiers', () => {
      expect(
        transform(`
           import {create, include} from 'stylex';
           export const styles = create({
             foo: {
               ...include(importedStyles)
             }
           });
         `),
      ).toMatchInlineSnapshot(`
        "import { create, include } from 'stylex';
        export const styles = {
          foo: {
            ...importedStyles,
            $$css: true
          }
        };"
      `);
    });

    test('Uses stylex.include correctly with MemberExpressions', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           export const styles = stylex.create({
             foo: {
               ...stylex.include(importedStyles.foo)
             }
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        export const styles = {
          foo: {
            ...importedStyles.foo,
            $$css: true
          }
        };"
      `);
    });

    test('Uses stylex.firstThatWorks correctly', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              position: stylex.firstThatWorks('sticky', 'fixed'),
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x15oojuh{position:fixed;position:sticky}", 3000);
        export const styles = {
          foo: {
            position: "x15oojuh",
            $$css: true
          }
        };"
      `);
    });

    test('transforms complex property values containing custom properties variables', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           const styles = stylex.create({
             default: {
               boxShadow: '0px 2px 4px var(--shadow-1)',
             }
           });
         `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}", 3000);"
      `);
    });

    describe('pseudo-classes', () => {
      // TODO: this should either fail or guarantee an insertion order relative to valid pseudo-classes
      test('transforms invalid pseudo-class', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                ':invalpwdijad': {
                  backgroundColor: 'red',
                  color: 'blue',
                },
              },
            });
         `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x19iys6w:invalpwdijad{background-color:red}", 3040);
          stylex.inject(".x5z3o4w:invalpwdijad{color:blue}", 3040);"
        `);
      });

      test('transforms valid pseudo-classes in order', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                ':hover': {
                  color: 'blue',
                },
                ':active': {
                  color: 'red',
                },
                ':focus': {
                  color: 'yellow',
                },
                ':nth-child(2n)': {
                  color: 'purple'
                }
              },
            });
         `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x17z2mba:hover{color:blue}", 3130);
          stylex.inject(".x96fq8s:active{color:red}", 3170);
          stylex.inject(".x1wvtd7d:focus{color:yellow}", 3150);
          stylex.inject(".x126ychx:nth-child(2n){color:purple}", 3060);"
        `);
      });

      test('transforms pseudo-class with array value as fallbacks', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                ':hover': {
                  position: ['sticky', 'fixed'],
                }
              },
            });
         `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1nxcus0:hover{position:sticky;position:fixed}", 3130);"
        `);
      });
    });

    describe('pseudo-classes within properties', () => {
      // TODO: this should either fail or guarantee an insertion order relative to valid pseudo-classes
      test('transforms invalid pseudo-class', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: {':invalpwdijad': 'red'},
                color: {':invalpwdijad': 'blue'},
              },
            });
         `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x19iys6w:invalpwdijad{background-color:red}", 3040);
          stylex.inject(".x5z3o4w:invalpwdijad{color:blue}", 3040);"
        `);
      });

      test('transforms valid pseudo-classes in order', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                color: {
                  ':hover': 'blue',
                  ':active':'red',
                  ':focus': 'yellow',
                  ':nth-child(2n)': 'purple',
                },
              },
            });
         `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x17z2mba:hover{color:blue}", 3130);
          stylex.inject(".x96fq8s:active{color:red}", 3170);
          stylex.inject(".x1wvtd7d:focus{color:yellow}", 3150);
          stylex.inject(".x126ychx:nth-child(2n){color:purple}", 3060);"
        `);
      });

      test('transforms pseudo-class with array value as fallbacks', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                position: {
                  ':hover': ['sticky', 'fixed'],
                }
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1nxcus0:hover{position:sticky;position:fixed}", 3130);"
        `);
      });
    });

    // TODO: more unsupported pseudo-classes
    describe('pseudo-elements', () => {
      test('transforms ::before and ::after', () => {
        expect(
          transform(`
             import stylex from 'stylex';
             const styles = stylex.create({
               foo: {
                 '::before': {
                   color: 'red'
                 },
                 '::after': {
                   color: 'blue'
                 },
               },
             });
           `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x16oeupf::before{color:red}", 8000);
          stylex.inject(".xdaarc3::after{color:blue}", 8000);"
        `);
      });

      test('transforms ::placeholder', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                '::placeholder': {
                  color: 'gray',
                },
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x6yu8oj::placeholder{color:gray}", 8000);"
        `);
      });

      test('transforms ::thumb', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                '::thumb': {
                  width: 16,
                },
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1en94km::-webkit-slider-thumb, .x1en94km::-moz-range-thumb, .x1en94km::-ms-thumb{width:16px}", 9000);"
        `);
      });
    });

    describe('queries', () => {
      test('transforms media queries', () => {
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
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 3000);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);"
        `);
      });

      test('transforms supports queries', () => {
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
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 3000);
          stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
          stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);"
        `);
      });
    });

    describe('queries within properties', () => {
      test('transforms media queries', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: {
                  default: 'red',
                  '@media (min-width: 1000px)': 'blue',
                  '@media (min-width: 2000px)': 'purple',
                }
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 3000);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);"
        `);
      });

      test('transforms supports queries', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: {
                  default:'red',
                  '@supports (hover: hover)': 'blue',
                  '@supports not (hover: hover)': 'purple',
                }
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 3000);
          stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
          stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);"
        `);
      });
    });

    test('auto-expands shorthands', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const borderRadius = 2;
          const styles = stylex.create({
            default: {
              margin: 'calc((100% - 50px) * 0.5) 20px 0',
            },
            error: {
              borderColor: 'red blue',
              borderStyle: 'dashed',
              borderWidth: '0 0 2px 0',
            },
            root: {
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'var(--divider)',
              borderRadius: borderRadius * 2,
              borderBottomWidth: '5px',
              borderBottomStyle: 'solid',
              borderBottomColor: 'red',
            },
            short: {
              padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
              paddingTop: 0,
            },
            valid: {
              borderColor: 'green',
              borderStyle: 'solid',
              borderWidth: 1,
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        stylex.inject(".xe4njm9{margin:calc((100% - 50px) * .5) 20px 0}", 1000);
        stylex.inject(".xs4buau{border-color:red blue}", 2000);
        stylex.inject(".xbsl7fq{border-style:dashed}", 2000);
        stylex.inject(".xn43iik{border-width:0 0 2px 0}", 2000);
        stylex.inject(".xmkeg23{border-width:1px}", 2000);
        stylex.inject(".xa309fb{border-bottom-width:5px}", 4000);
        stylex.inject(".x1y0btm7{border-style:solid}", 2000);
        stylex.inject(".x1q0q8m5{border-bottom-style:solid}", 4000);
        stylex.inject(".x1lh7sze{border-color:var(--divider)}", 2000);
        stylex.inject(".xud65wk{border-bottom-color:red}", 4000);
        stylex.inject(".x12oqio5{border-radius:4px}", 2000);
        stylex.inject(".x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}", 1000);
        stylex.inject(".xexx8yu{padding-top:0}", 4000);
        stylex.inject(".x1bg2uv5{border-color:green}", 2000);"
      `);
    });

    test('Last property wins, even if shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const borderRadius = 2;
          const styles = stylex.create({
            default: {
              marginTop: 5,
              marginEnd: 10,
              marginBottom: 15,
              marginStart: 20,
            },
            override: {
              marginBottom: 100,
              margin: 0,
            }
          });
          stylex(styles.default, styles.override);
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        stylex.inject(".x1ok221b{margin-top:5px}", 4000);
        stylex.inject(".x1sa5p1d{margin-inline-end:10px}", 3000);
        stylex.inject(".x1fqp7bg{margin-bottom:15px}", 4000);
        stylex.inject(".xqsn43r{margin-inline-start:20px}", 3000);
        stylex.inject(".x1ghz6dp{margin:0}", 1000);
        "x1ghz6dp";"
      `);
    });

    test('Adds null for constituent properties of shorthands', () => {
      expect(
        transform(
          `
            import stylex from 'stylex';
            const borderRadius = 2;
            export const styles = stylex.create({
              default: {
                margin: 'calc((100% - 50px) * 0.5) 20px 0',
              },
              error: {
                borderColor: 'red blue',
                borderStyle: 'dashed',
                borderWidth: '0 0 2px 0',
              },
              root: {
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'var(--divider)',
                borderRadius: borderRadius * 2,
                borderBottomWidth: '5px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'red',
              },
              short: {
                padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
                paddingTop: 0,
              },
              shortReversed: {
                paddingTop: 0,
                padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
              },
              valid: {
                borderColor: 'green',
                borderStyle: 'solid',
                borderWidth: 1,
              }
            });
         `,
          { runtimeInjection: false },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        export const styles = {
          default: {
            margin: "xe4njm9",
            marginInline: null,
            marginInlineStart: null,
            marginLeft: null,
            marginInlineEnd: null,
            marginRight: null,
            marginBlock: null,
            marginTop: null,
            marginBottom: null,
            $$css: true
          },
          error: {
            borderColor: "xs4buau",
            borderInlineColor: null,
            borderInlineStartColor: null,
            borderLeftColor: null,
            borderInlineEndColor: null,
            borderRightColor: null,
            borderBlockColor: null,
            borderTopColor: null,
            borderBottomColor: null,
            borderStyle: "xbsl7fq",
            borderInlineStyle: null,
            borderInlineStartStyle: null,
            borderLeftStyle: null,
            borderInlineEndStyle: null,
            borderRightStyle: null,
            borderBlockStyle: null,
            borderTopStyle: null,
            borderBottomStyle: null,
            borderWidth: "xn43iik",
            borderInlineWidth: null,
            borderInlineStartWidth: null,
            borderLeftWidth: null,
            borderInlineEndWidth: null,
            borderRightWidth: null,
            borderBlockWidth: null,
            borderTopWidth: null,
            borderBottomWidth: null,
            $$css: true
          },
          root: {
            borderWidth: "xmkeg23",
            borderInlineWidth: null,
            borderInlineStartWidth: null,
            borderLeftWidth: null,
            borderInlineEndWidth: null,
            borderRightWidth: null,
            borderBlockWidth: null,
            borderTopWidth: null,
            borderBottomWidth: "xa309fb",
            borderStyle: "x1y0btm7",
            borderInlineStyle: null,
            borderInlineStartStyle: null,
            borderLeftStyle: null,
            borderInlineEndStyle: null,
            borderRightStyle: null,
            borderBlockStyle: null,
            borderTopStyle: null,
            borderBottomStyle: "x1q0q8m5",
            borderColor: "x1lh7sze",
            borderInlineColor: null,
            borderInlineStartColor: null,
            borderLeftColor: null,
            borderInlineEndColor: null,
            borderRightColor: null,
            borderBlockColor: null,
            borderTopColor: null,
            borderBottomColor: "xud65wk",
            borderRadius: "x12oqio5",
            borderStartStartRadius: null,
            borderStartEndRadius: null,
            borderEndStartRadius: null,
            borderEndEndRadius: null,
            borderTopLeftRadius: null,
            borderTopRightRadius: null,
            borderBottomLeftRadius: null,
            borderBottomRightRadius: null,
            $$css: true
          },
          short: {
            padding: "x1lmef92",
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingTop: "xexx8yu",
            paddingBottom: null,
            $$css: true
          },
          shortReversed: {
            paddingTop: null,
            padding: "x1lmef92",
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingBottom: null,
            $$css: true
          },
          valid: {
            borderColor: "x1bg2uv5",
            borderInlineColor: null,
            borderInlineStartColor: null,
            borderLeftColor: null,
            borderInlineEndColor: null,
            borderRightColor: null,
            borderBlockColor: null,
            borderTopColor: null,
            borderBottomColor: null,
            borderStyle: "x1y0btm7",
            borderInlineStyle: null,
            borderInlineStartStyle: null,
            borderLeftStyle: null,
            borderInlineEndStyle: null,
            borderRightStyle: null,
            borderBlockStyle: null,
            borderTopStyle: null,
            borderBottomStyle: null,
            borderWidth: "xmkeg23",
            borderInlineWidth: null,
            borderInlineStartWidth: null,
            borderLeftWidth: null,
            borderInlineEndWidth: null,
            borderRightWidth: null,
            borderBlockWidth: null,
            borderTopWidth: null,
            borderBottomWidth: null,
            $$css: true
          }
        };"
      `);
    });

    test('Can leave shorthands as is when configured.', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const borderRadius = 2;
          export const styles = stylex.create({
            default: {
              marginTop: 'calc((100% - 50px) * 0.5)',
              marginRight: 20,
              marginBottom: 0,
            },
            error: {
              borderVerticalColor: 'red',
              borderHorizontalColor: 'blue',
              borderStyle: 'dashed',
              borderBottomWidth: 2,
            },
            root: {
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'var(--divider)',
              borderRadius: borderRadius * 2,
              borderBottomWidth: 5,
              borderBottomStyle: 'solid',
              borderBottomColor: 'red',
            },
            short: {
              paddingVertical: 'calc((100% - 50px) * 0.5)',
              paddingHorizontal: 'var(--rightpadding, 20px)',
              paddingTop: 0,
            },
            shortReversed: {
              paddingTop: 0,
              paddingVertical: 'calc((100% - 50px) * 0.5)',
              paddingHorizontal: 'var(--rightpadding, 20px)',
            },
            valid: {
              borderColor: 'green',
              borderStyle: 'solid',
              borderWidth: 1,
            }
          });
         `,
          { runtimeInjection: false, styleResolution: 'property-specificity' },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        export const styles = {
          default: {
            marginTop: "xxsse2n",
            marginRight: "x1wh8b8d",
            marginBottom: "xat24cr",
            $$css: true
          },
          error: {
            borderBlockColor: "xzu6wam",
            borderInlineColor: "xgomli1",
            borderStyle: "xbsl7fq",
            borderBottomWidth: "xlxy82",
            $$css: true
          },
          root: {
            borderWidth: "xmkeg23",
            borderStyle: "x1y0btm7",
            borderColor: "x1lh7sze",
            borderRadius: "x12oqio5",
            borderBottomWidth: "xa309fb",
            borderBottomStyle: "x1q0q8m5",
            borderBottomColor: "xud65wk",
            $$css: true
          },
          short: {
            paddingBlock: "x190pm2f",
            paddingInline: "x1n86tx6",
            paddingTop: "xexx8yu",
            $$css: true
          },
          shortReversed: {
            paddingTop: "xexx8yu",
            paddingBlock: "x190pm2f",
            paddingInline: "x1n86tx6",
            $$css: true
          },
          valid: {
            borderColor: "x1bg2uv5",
            borderStyle: "x1y0btm7",
            borderWidth: "xmkeg23",
            $$css: true
          }
        };"
      `);
    });
  });

  describe('[transform] stylex.create() with functions', () => {
    test('transforms style object with function', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              backgroundColor: 'red',
              color,
            })
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject(".x19dipnz{color:var(--color,revert)}", 3000);
        export const styles = {
          default: color => [{
            backgroundColor: "xrkmrrc",
            color: "x19dipnz",
            $$css: true
          }, {
            "--color": color != null ? color : "initial"
          }]
        };"
      `);
    });

    test('adds units for numbers in style object with function', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (width) => ({
              backgroundColor: 'red',
              width,
            })
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject(".x17fnjtu{width:var(--width,revert)}", 4000);
        export const styles = {
          default: width => [{
            backgroundColor: "xrkmrrc",
            width: "x17fnjtu",
            $$css: true
          }, {
            "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : "initial")(width)
          }]
        };"
      `);
    });

    test('transforms mix of objects and functions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              backgroundColor: 'red',
              color: color,
            }),
            mono: {
              color: 'black',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject(".x19dipnz{color:var(--color,revert)}", 3000);
        stylex.inject(".x1mqxbix{color:black}", 3000);
        export const styles = {
          default: color => [{
            backgroundColor: "xrkmrrc",
            color: "x19dipnz",
            $$css: true
          }, {
            "--color": color != null ? color : "initial"
          }],
          mono: {
            color: "x1mqxbix",
            $$css: true
          }
        };"
      `);
    });
    test('transforms styles that set CSS vars', () => {
      // NOTE: the generated variable name is a little weird, but valid.
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (bgColor) => ({
              '--background-color': bgColor,
            }),
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xyv4n8w{--background-color:var(----background-color,revert)}", 1);
        export const styles = {
          default: bgColor => [{
            "--background-color": "xyv4n8w",
            $$css: true
          }, {
            "----background-color": bgColor != null ? bgColor : "initial"
          }]
        };"
      `);
    });
    test('transforms functions with nested dynamic values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              ':hover': {
                backgroundColor: 'red',
                color,
              },
            }),
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1gykpug:hover{background-color:red}", 3130);
        stylex.inject(".x11bf1mc:hover{color:var(--1ijzsae,revert)}", 3130);
        export const styles = {
          default: color => [{
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x11bf1mc",
            $$css: true
          }, {
            "--1ijzsae": color != null ? color : "initial"
          }]
        };"
      `);
    });
    test('transforms mix of objects and functions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              backgroundColor: 'red',
              color: color,
            }),
            mono: {
              color: 'black',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 3000);
        stylex.inject(".x19dipnz{color:var(--color,revert)}", 3000);
        stylex.inject(".x1mqxbix{color:black}", 3000);
        export const styles = {
          default: color => [{
            backgroundColor: "xrkmrrc",
            color: "x19dipnz",
            $$css: true
          }, {
            "--color": color != null ? color : "initial"
          }],
          mono: {
            color: "x1mqxbix",
            $$css: true
          }
        };"
      `);
    });
    test('transforms styles that set CSS vars', () => {
      // NOTE: the generated variable name is a little weird, but valid.
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (bgColor) => ({
              '--background-color': bgColor,
            }),
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xyv4n8w{--background-color:var(----background-color,revert)}", 1);
        export const styles = {
          default: bgColor => [{
            "--background-color": "xyv4n8w",
            $$css: true
          }, {
            "----background-color": bgColor != null ? bgColor : "initial"
          }]
        };"
      `);
    });
    test('transforms functions with nested dynamic values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              ':hover': {
                backgroundColor: 'red',
                color,
              },
            }),
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1gykpug:hover{background-color:red}", 3130);
        stylex.inject(".x11bf1mc:hover{color:var(--1ijzsae,revert)}", 3130);
        export const styles = {
          default: color => [{
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x11bf1mc",
            $$css: true
          }, {
            "--1ijzsae": color != null ? color : "initial"
          }]
        };"
      `);
    });
  });
});
