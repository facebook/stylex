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
      flow: {
        all: true,
      },
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 1);
        stylex.inject(".xju2f9n{color:blue}", 1);"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xgau0yw{--background-color:red}", 1);"
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
         `)
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xrkmrrc{background-color:red}", 1);
        stylex.inject(".xju2f9n{color:blue}", 1);"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xd71okc{content:attr(some-attribute)}", 1);"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1gykpug:hover{background-color:red}", 8);
        stylex.inject(".x17z2mba:hover{color:blue}", 8);"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1ruww2u{position:sticky;position:fixed}", 1);"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x87ps6o{user-select:none}", 1);"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x6ikm8r{overflow-x:hidden}", 1);
        stylex.inject(".x10wlt62{overflow-y:hidden}", 1);
        stylex.inject(".xlya59e{border-top-style:dashed}", 1);
        stylex.inject(".x157eodl{border-right-style:dashed}", 1, ".x157eodl{border-left-style:dashed}");
        stylex.inject(".xpvcztv{border-bottom-style:dashed}", 1);
        stylex.inject(".x1q04ism{border-left-style:dashed}", 1, ".x1q04ism{border-right-style:dashed}");
        stylex.inject(".x178xt8z{border-top-width:1px}", 1);
        stylex.inject(".xm81vs4{border-right-width:1px}", 1, ".xm81vs4{border-left-width:1px}");
        stylex.inject(".xso031l{border-bottom-width:1px}", 1);
        stylex.inject(".xy80clv{border-left-width:1px}", 1, ".xy80clv{border-right-width:1px}");"
      `);
    });

    test('preserves imported object spread', () => {
      expect(
        transform(`
           import stylex from 'stylex';
           export const styles = stylex.create({
             foo: {
               ...(importedStyles.foo: XStyle<>)
             }
           });
         `)
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

    test('Uses stylex.include correctly with Identifiers', () => {
      expect(
        transform(`
           import {create, include} from 'stylex';
           export const styles = create({
             foo: {
               ...include(importedStyles)
             }
           });
         `)
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
         `)
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
           export const styles = stylex.create({
             foo: {
               position: stylex.firstThatWorks('sticky', 'fixed'),
             }
           });
         `)
      ).toMatchInlineSnapshot(`
        "export const styles = stylex.create({
          foo: {
            position: stylex.firstThatWorks('sticky', 'fixed')
          }
        });"
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}", 1);"
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
         `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x19iys6w:invalpwdijad{background-color:red}", 2);
          stylex.inject(".x5z3o4w:invalpwdijad{color:blue}", 2);"
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
         `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x17z2mba:hover{color:blue}", 8);
          stylex.inject(".x96fq8s:active{color:red}", 10);
          stylex.inject(".x1wvtd7d:focus{color:yellow}", 9);
          stylex.inject(".x126ychx:nth-child(2n){color:purple}", 6);"
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
         `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1nxcus0:hover{position:sticky;position:fixed}", 8);"
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
           `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x16oeupf::before{color:red}", 2);
          stylex.inject(".xdaarc3::after{color:blue}", 2);"
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
           `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x6yu8oj::placeholder{color:gray}", 12);"
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
           `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".x1en94km::-webkit-slider-thumb, .x1en94km::-moz-range-thumb, .x1en94km::-ms-thumb{width:16px}", 13);"
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
           `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 1);
          stylex.inject("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 2);
          stylex.inject("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 2);"
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

           `)
        ).toMatchInlineSnapshot(`
          "import stylex from 'stylex';
          stylex.inject(".xrkmrrc{background-color:red}", 1);
          stylex.inject("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 2);
          stylex.inject("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 2);"
        `);
      });
    });

    test('[legacy] auto-expands shorthands', () => {
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
         `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        const borderRadius = 2;
        stylex.inject(".xxsse2n{margin-top:calc((100% - 50px) * .5)}", 1);
        stylex.inject(".x1h5jrl4{margin-right:20px}", 1, ".x1h5jrl4{margin-left:20px}");
        stylex.inject(".xat24cr{margin-bottom:0}", 1);
        stylex.inject(".xmn8rco{margin-left:20px}", 1, ".xmn8rco{margin-right:20px}");
        stylex.inject(".x1uu1fcu{border-top-color:red}", 1);
        stylex.inject(".xkwlhv9{border-right-color:blue}", 1, ".xkwlhv9{border-left-color:blue}");
        stylex.inject(".xud65wk{border-bottom-color:red}", 1);
        stylex.inject(".x1z0yhbn{border-left-color:blue}", 1, ".x1z0yhbn{border-right-color:blue}");
        stylex.inject(".xlya59e{border-top-style:dashed}", 1);
        stylex.inject(".x157eodl{border-right-style:dashed}", 1, ".x157eodl{border-left-style:dashed}");
        stylex.inject(".xpvcztv{border-bottom-style:dashed}", 1);
        stylex.inject(".x1q04ism{border-left-style:dashed}", 1, ".x1q04ism{border-right-style:dashed}");
        stylex.inject(".x972fbf{border-top-width:0}", 1);
        stylex.inject(".xcfux6l{border-right-width:0}", 1, ".xcfux6l{border-left-width:0}");
        stylex.inject(".xlxy82{border-bottom-width:2px}", 1);
        stylex.inject(".xm0m39n{border-left-width:0}", 1, ".xm0m39n{border-right-width:0}");
        stylex.inject(".x1n2xptk{border-top:1px solid var(--divider)}", 1);
        stylex.inject(".xkbpzyx{border-right:1px solid var(--divider)}", 1, ".xkbpzyx{border-left:1px solid var(--divider)}");
        stylex.inject(".xdwpb5{border-bottom:5px solid red}", 1);
        stylex.inject(".x1rr5fae{border-left:1px solid var(--divider)}", 1, ".x1rr5fae{border-right:1px solid var(--divider)}");
        stylex.inject(".x1lcm9me{border-top-left-radius:4px}", 1, ".x1lcm9me{border-top-right-radius:4px}");
        stylex.inject(".x1yr5g0i{border-top-right-radius:4px}", 1, ".x1yr5g0i{border-top-left-radius:4px}");
        stylex.inject(".xrt01vj{border-bottom-right-radius:4px}", 1, ".xrt01vj{border-bottom-left-radius:4px}");
        stylex.inject(".x10y3i5r{border-bottom-left-radius:4px}", 1, ".x10y3i5r{border-bottom-right-radius:4px}");
        stylex.inject(".xexx8yu{padding-top:0}", 1);
        stylex.inject(".xcrpjku{padding-right:var(--rightpadding,20px)}", 1, ".xcrpjku{padding-left:var(--rightpadding,20px)}");
        stylex.inject(".x18xuxqe{padding-bottom:calc((100% - 50px) * .5)}", 1);
        stylex.inject(".xyv1419{padding-left:var(--rightpadding,20px)}", 1, ".xyv1419{padding-right:var(--rightpadding,20px)}");
        stylex.inject(".xb9njkq{border-top-color:green}", 1);
        stylex.inject(".x1plg3iu{border-right-color:green}", 1, ".x1plg3iu{border-left-color:green}");
        stylex.inject(".x1hnil3p{border-bottom-color:green}", 1);
        stylex.inject(".x1s0fimb{border-left-color:green}", 1, ".x1s0fimb{border-right-color:green}");
        stylex.inject(".x13fuv20{border-top-style:solid}", 1);
        stylex.inject(".xu3j5b3{border-right-style:solid}", 1, ".xu3j5b3{border-left-style:solid}");
        stylex.inject(".x1q0q8m5{border-bottom-style:solid}", 1);
        stylex.inject(".x26u7qi{border-left-style:solid}", 1, ".x26u7qi{border-right-style:solid}");
        stylex.inject(".x178xt8z{border-top-width:1px}", 1);
        stylex.inject(".xm81vs4{border-right-width:1px}", 1, ".xm81vs4{border-left-width:1px}");
        stylex.inject(".xso031l{border-bottom-width:1px}", 1);
        stylex.inject(".xy80clv{border-left-width:1px}", 1, ".xy80clv{border-right-width:1px}");"
      `);
    });
  });
});
