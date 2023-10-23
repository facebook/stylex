/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
    plugins: [flowPlugin, [stylexPlugin, opts]],
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
        stylex.inject(".xrkmrrc{background-color:red}", 4);
        stylex.inject(".xju2f9n{color:blue}", 4);"
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
        foo.inject(".xrkmrrc{background-color:red}", 4);
        foo.inject(".xju2f9n{color:blue}", 4);"
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
        __stylex__.inject(".xrkmrrc{background-color:red}", 4);
        __stylex__.inject(".xju2f9n{color:blue}", 4);"
      `);
    });

    test('transforms style object with custom propety', () => {
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
        stylex.inject(".xgau0yw{--background-color:red}", 4);"
      `);
    });

    test('transforms style object with custom propety as value', () => {
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
        stylex.inject(".x13tgbkp{--final-color:var(--background-color)}", 4);"
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
        stylex.inject(".xrkmrrc{background-color:red}", 4);
        stylex.inject(".xju2f9n{color:blue}", 4);"
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
        stylex.inject(".xd71okc{content:attr(some-attribute)}", 4);"
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
        stylex.inject(".x1cfch2b{transition-property:margin-top}", 4);"
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
        stylex.inject(".x17389it{transition-property:--foo}", 4);"
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
        stylex.inject(".x1gykpug:hover{background-color:red}", 17);
        stylex.inject(".x17z2mba:hover{color:blue}", 17);"
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
        stylex.inject(".x1gykpug:hover{background-color:red}", 17);
        stylex.inject(".x17z2mba:hover{color:blue}", 17);"
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
        stylex.inject(".x1ruww2u{position:sticky;position:fixed}", 4);"
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
        stylex.inject(".xixxii4{position:fixed}", 4);
        stylex.inject("@media (min-width: 768px){.x1vazst0.x1vazst0{position:sticky;position:fixed}}", 25);"
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
        stylex.inject(".x87ps6o{user-select:none}", 4);"
      `);
    });

    // Legacy, short?
    test('tranforms valid shorthands', () => {
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
        stylex.inject(".xb3r6kr{overflow:hidden}", 3);
        stylex.inject(".xbsl7fq{border-style:dashed}", 3);
        stylex.inject(".xmkeg23{border-width:1px}", 3);"
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
stylex.inject(".x15oojuh{position:fixed;position:sticky}", 4);
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
        stylex.inject(".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}", 4);"
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
          stylex.inject(".x19iys6w:invalpwdijad{background-color:red}", 8);
          stylex.inject(".x5z3o4w:invalpwdijad{color:blue}", 8);"
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
          stylex.inject(".x17z2mba:hover{color:blue}", 17);
          stylex.inject(".x96fq8s:active{color:red}", 21);
          stylex.inject(".x1wvtd7d:focus{color:yellow}", 20);
          stylex.inject(".x126ychx:nth-child(2n){color:purple}", 10);"
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
          stylex.inject(".x1nxcus0:hover{position:sticky;position:fixed}", 17);"
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
          stylex.inject(".x19iys6w:invalpwdijad{background-color:red}", 8);
          stylex.inject(".x5z3o4w:invalpwdijad{color:blue}", 8);"
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
          stylex.inject(".x17z2mba:hover{color:blue}", 17);
          stylex.inject(".x96fq8s:active{color:red}", 21);
          stylex.inject(".x1wvtd7d:focus{color:yellow}", 20);
          stylex.inject(".x126ychx:nth-child(2n){color:purple}", 10);"
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
          stylex.inject(".x1nxcus0:hover{position:sticky;position:fixed}", 17);"
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
          stylex.inject(".x16oeupf::before{color:red}", 8);
          stylex.inject(".xdaarc3::after{color:blue}", 8);"
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
          stylex.inject(".x6yu8oj::placeholder{color:gray}", 8);"
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
          stylex.inject(".x1en94km::-webkit-slider-thumb, .x1en94km::-moz-range-thumb, .x1en94km::-ms-thumb{width:16px}", 8);"
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
          stylex.inject(".xrkmrrc{background-color:red}", 4);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 25);
          stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 25);"
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
          stylex.inject(".xrkmrrc{background-color:red}", 4);
          stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 24);
          stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 24);"
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
          stylex.inject(".xrkmrrc{background-color:red}", 4);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 25);
          stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 25);"
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
          stylex.inject(".xrkmrrc{background-color:red}", 4);
          stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 24);
          stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 24);"
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
              border: '1px solid var(--divider)',
              borderRadius: borderRadius * 2,
              borderBottom: '5px solid red',
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
        stylex.inject(".xxsse2n{margin-top:calc((100% - 50px) * .5)}", 4);
        stylex.inject(".x3aesyq{margin-inline-end:20px}", 4);
        stylex.inject(".xat24cr{margin-bottom:0}", 4);
        stylex.inject(".xqsn43r{margin-inline-start:20px}", 4);
        stylex.inject(".xs4buau{border-color:red blue}", 3);
        stylex.inject(".xbsl7fq{border-style:dashed}", 3);
        stylex.inject(".xn43iik{border-width:0 0 2px 0}", 3);
        stylex.inject(".xmkeg23{border-width:1px}", 3);
        stylex.inject(".xa309fb{border-bottom-width:5px}", 4);
        stylex.inject(".x1y0btm7{border-style:solid}", 3);
        stylex.inject(".x1q0q8m5{border-bottom-style:solid}", 4);
        stylex.inject(".x1lh7sze{border-color:var(--divider)}", 3);
        stylex.inject(".xud65wk{border-bottom-color:red}", 4);
        stylex.inject(".x12oqio5{border-radius:4px}", 3);
        stylex.inject(".xexx8yu{padding-top:0}", 4);
        stylex.inject(".xcrpjku{padding-right:var(--rightpadding,20px)}", 4, ".xcrpjku{padding-left:var(--rightpadding,20px)}");
        stylex.inject(".x18xuxqe{padding-bottom:calc((100% - 50px) * .5)}", 4);
        stylex.inject(".xyv1419{padding-left:var(--rightpadding,20px)}", 4, ".xyv1419{padding-right:var(--rightpadding,20px)}");
        stylex.inject(".x1bg2uv5{border-color:green}", 3);"
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
        // Expect the className to reflect override entirely
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        stylex.inject(".x1ok221b{margin-top:5px}", 4);
        stylex.inject(".x1sa5p1d{margin-inline-end:10px}", 4);
        stylex.inject(".x1fqp7bg{margin-bottom:15px}", 4);
        stylex.inject(".xqsn43r{margin-inline-start:20px}", 4);
        stylex.inject(".x1ghz6dp{margin:0}", 3);
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
                border: '1px solid var(--divider)',
                borderRadius: borderRadius * 2,
                borderBottom: '5px solid red',
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
          { stylexSheetName: '<>' },
        ),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        export const styles = {
          default: {
            marginTop: "xxsse2n",
            marginInlineEnd: "x3aesyq",
            marginBottom: "xat24cr",
            marginInlineStart: "xqsn43r",
            marginLeft: null,
            marginRight: null,
            $$css: true
          },
          error: {
            borderColor: "xs4buau",
            borderTopColor: null,
            borderInlineEndColor: null,
            borderRightColor: null,
            borderBottomColor: null,
            borderInlineStartColor: null,
            borderLeftColor: null,
            borderStyle: "xbsl7fq",
            borderTopStyle: null,
            borderInlineEndStyle: null,
            borderRightStyle: null,
            borderBottomStyle: null,
            borderInlineStartStyle: null,
            borderLeftStyle: null,
            borderWidth: "xn43iik",
            borderTopWidth: null,
            borderInlineEndWidth: null,
            borderRightWidth: null,
            borderBottomWidth: null,
            borderInlineStartWidth: null,
            borderLeftWidth: null,
            $$css: true
          },
          root: {
            borderWidth: "xmkeg23",
            borderTopWidth: null,
            borderInlineEndWidth: null,
            borderRightWidth: null,
            borderBottomWidth: "xa309fb",
            borderInlineStartWidth: null,
            borderLeftWidth: null,
            borderStyle: "x1y0btm7",
            borderTopStyle: null,
            borderInlineEndStyle: null,
            borderRightStyle: null,
            borderBottomStyle: "x1q0q8m5",
            borderInlineStartStyle: null,
            borderLeftStyle: null,
            borderColor: "x1lh7sze",
            borderTopColor: null,
            borderInlineEndColor: null,
            borderRightColor: null,
            borderBottomColor: "xud65wk",
            borderInlineStartColor: null,
            borderLeftColor: null,
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
            paddingTop: "xexx8yu",
            paddingEnd: "xcrpjku",
            paddingBottom: "x18xuxqe",
            paddingStart: "xyv1419",
            $$css: true
          },
          shortReversed: {
            paddingTop: "xx5yw1q",
            paddingEnd: "xcrpjku",
            paddingBottom: "x18xuxqe",
            paddingStart: "xyv1419",
            $$css: true
          },
          valid: {
            borderColor: "x1bg2uv5",
            borderTopColor: null,
            borderInlineEndColor: null,
            borderRightColor: null,
            borderBottomColor: null,
            borderInlineStartColor: null,
            borderLeftColor: null,
            borderStyle: "x1y0btm7",
            borderTopStyle: null,
            borderInlineEndStyle: null,
            borderRightStyle: null,
            borderBottomStyle: null,
            borderInlineStartStyle: null,
            borderLeftStyle: null,
            borderWidth: "xmkeg23",
            borderTopWidth: null,
            borderInlineEndWidth: null,
            borderRightWidth: null,
            borderBottomWidth: null,
            borderInlineStartWidth: null,
            borderLeftWidth: null,
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
          { stylexSheetName: '<>', styleResolution: 'property-specificity' },
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
        stylex.inject(".xrkmrrc{background-color:red}", 4);
        stylex.inject(".x19dipnz{color:var(--color,revert)}", 4);
        export const styles = {
          default: color => [{
            backgroundColor: "xrkmrrc",
            color: "x19dipnz",
            $$css: true
          }, {
            "--color": color ?? "initial"
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
        stylex.inject(".xrkmrrc{background-color:red}", 4);
        stylex.inject(".x17fnjtu{width:var(--width,revert)}", 4);
        export const styles = {
          default: width => [{
            backgroundColor: "xrkmrrc",
            width: "x17fnjtu",
            $$css: true
          }, {
            "--width": (val => typeof val === "number" ? val + "px" : val ?? "initial")(width)
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
        stylex.inject(".xrkmrrc{background-color:red}", 4);
        stylex.inject(".x19dipnz{color:var(--color,revert)}", 4);
        stylex.inject(".x1mqxbix{color:black}", 4);
        export const styles = {
          default: color => [{
            backgroundColor: "xrkmrrc",
            color: "x19dipnz",
            $$css: true
          }, {
            "--color": color ?? "initial"
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
        stylex.inject(".xyv4n8w{--background-color:var(----background-color,revert)}", 4);
        export const styles = {
          default: bgColor => [{
            "--background-color": "xyv4n8w",
            $$css: true
          }, {
            "----background-color": bgColor ?? "initial"
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
        stylex.inject(".x1gykpug:hover{background-color:red}", 17);
        stylex.inject(".x11bf1mc:hover{color:var(--1ijzsae,revert)}", 17);
        export const styles = {
          default: color => [{
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x11bf1mc",
            $$css: true
          }, {
            "--1ijzsae": color ?? "initial"
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
        stylex.inject(".xrkmrrc{background-color:red}", 4);
        stylex.inject(".x19dipnz{color:var(--color,revert)}", 4);
        stylex.inject(".x1mqxbix{color:black}", 4);
        export const styles = {
          default: color => [{
            backgroundColor: "xrkmrrc",
            color: "x19dipnz",
            $$css: true
          }, {
            "--color": color ?? "initial"
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
        stylex.inject(".xyv4n8w{--background-color:var(----background-color,revert)}", 4);
        export const styles = {
          default: bgColor => [{
            "--background-color": "xyv4n8w",
            $$css: true
          }, {
            "----background-color": bgColor ?? "initial"
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
        stylex.inject(".x1gykpug:hover{background-color:red}", 17);
        stylex.inject(".x11bf1mc:hover{color:var(--1ijzsae,revert)}", 17);
        export const styles = {
          default: color => [{
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x11bf1mc",
            $$css: true
          }, {
            "--1ijzsae": color ?? "initial"
          }]
        };"
      `);
    });
  });
});
