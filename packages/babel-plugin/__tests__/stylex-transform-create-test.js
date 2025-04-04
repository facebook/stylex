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
    babelrc: false,
    plugins: [
      flowPlugin,
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          unstable_moduleResolution: { type: 'haste' },
          ...opts,
        },
      ],
    ],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.create()', () => {
    test('supports debug data (haste)', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              color: 'red'
            },
            'bar-baz': {
              display: 'block'
            },
            1: {
              fontSize: '1em'
            }
          });
        `,
          {
            debug: true,
            filename: '/html/js/components/Foo.react.js',
            unstable_moduleResolution: { type: 'haste' },
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".fontSize-xrv4cvt{font-size:1em}", 3000);
        _inject2(".color-x1e2nbdu{color:red}", 3000);
        _inject2(".display-x1lliihq{display:block}", 3000);
        export const styles = {
          "1": {
            "fontSize-kGuDYH": "fontSize-xrv4cvt",
            $$css: "Foo.react.js:10"
          },
          foo: {
            "color-kMwMTN": "color-x1e2nbdu",
            $$css: "Foo.react.js:4"
          },
          "bar-baz": {
            "display-k1xSpc": "display-x1lliihq",
            $$css: "Foo.react.js:7"
          }
        };"
      `);

      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              color: 'red'
            },
            'bar-baz': {
              display: 'block'
            },
            1: {
              fontSize: '1em'
            }
          });
        `,
          {
            debug: true,
            filename:
              '/js/node_modules/npm-package/dist/components/Foo.react.js',
            unstable_moduleResolution: { type: 'haste' },
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".fontSize-xrv4cvt{font-size:1em}", 3000);
        _inject2(".color-x1e2nbdu{color:red}", 3000);
        _inject2(".display-x1lliihq{display:block}", 3000);
        export const styles = {
          "1": {
            "fontSize-kGuDYH": "fontSize-xrv4cvt",
            $$css: "npm-package:components/Foo.react.js:10"
          },
          foo: {
            "color-kMwMTN": "color-x1e2nbdu",
            $$css: "npm-package:components/Foo.react.js:4"
          },
          "bar-baz": {
            "display-k1xSpc": "display-x1lliihq",
            $$css: "npm-package:components/Foo.react.js:7"
          }
        };"
      `);
    });

    test('supports debug data (commonJS)', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              color: 'red'
            },
            'bar-baz': {
              display: 'block'
            },
            1: {
              fontSize: '1em'
            }
          });
        `,
          {
            debug: true,
            filename: '/html/js/components/Foo.react.js',
            unstable_moduleResolution: { type: 'commonJS' },
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".fontSize-xrv4cvt{font-size:1em}", 3000);
        _inject2(".color-x1e2nbdu{color:red}", 3000);
        _inject2(".display-x1lliihq{display:block}", 3000);
        export const styles = {
          "1": {
            "fontSize-kGuDYH": "fontSize-xrv4cvt",
            $$css: "components/Foo.react.js:10"
          },
          foo: {
            "color-kMwMTN": "color-x1e2nbdu",
            $$css: "components/Foo.react.js:4"
          },
          "bar-baz": {
            "display-k1xSpc": "display-x1lliihq",
            $$css: "components/Foo.react.js:7"
          }
        };"
      `);

      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              color: 'red'
            },
            'bar-baz': {
              display: 'block'
            },
            1: {
              fontSize: '1em'
            }
          });
        `,
          {
            debug: true,
            filename:
              '/js/node_modules/npm-package/dist/components/Foo.react.js',
            unstable_moduleResolution: { type: 'commonJS' },
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".fontSize-xrv4cvt{font-size:1em}", 3000);
        _inject2(".color-x1e2nbdu{color:red}", 3000);
        _inject2(".display-x1lliihq{display:block}", 3000);
        export const styles = {
          "1": {
            "fontSize-kGuDYH": "fontSize-xrv4cvt",
            $$css: "npm-package:components/Foo.react.js:10"
          },
          foo: {
            "color-kMwMTN": "color-x1e2nbdu",
            $$css: "npm-package:components/Foo.react.js:4"
          },
          "bar-baz": {
            "display-k1xSpc": "display-x1lliihq",
            $$css: "npm-package:components/Foo.react.js:7"
          }
        };"
      `);
    });

    test('stress test various key types and style variants (haste)', () => {
      expect(
        transform(
          `
            import stylex from 'stylex';

            export const styles = stylex.create({
              foo: {
                color: 'red',
                ':hover': {
                  color: 'blue',
                },
                '@media (min-width: 768px)': {
                  color: 'green',
                },
              },
              'bar-baz': {
                display: 'block',
                padding: '10px',
              },
              1: {
                fontSize: '14px',
              },
            });
          `,
          {
            debug: true,
            filename: '/src/components/Foo.react.js',
            unstable_moduleResolution: { type: 'haste' },
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".fontSize-xif65rj{font-size:14px}", 3000);
        _inject2(".color-x1e2nbdu{color:red}", 3000);
        _inject2(".color-x17z2mba:hover{color:blue}", 3130);
        _inject2("@media (min-width: 768px){.color-x1eatcr5.color-x1eatcr5{color:green}}", 3200);
        _inject2(".display-x1lliihq{display:block}", 3000);
        _inject2(".padding-x7z7khe{padding:10px}", 1000);
        export const styles = {
          "1": {
            "fontSize-kGuDYH": "fontSize-xif65rj",
            $$css: "Foo.react.js:18"
          },
          foo: {
            "color-kMwMTN": "color-x1e2nbdu",
            ":hover_color-kDPRdz": "color-x17z2mba",
            "@media (min-width: 768px)_color-kvvVxc": "color-x1eatcr5",
            $$css: "Foo.react.js:5"
          },
          "bar-baz": {
            "display-k1xSpc": "display-x1lliihq",
            "padding-kmVPX3": "padding-x7z7khe",
            "paddingInline-kg3NbH": null,
            "paddingStart-kuDDbn": null,
            "paddingLeft-kE3dHu": null,
            "paddingEnd-kP0aTx": null,
            "paddingRight-kpe85a": null,
            "paddingBlock-k8WAf4": null,
            "paddingTop-kLKAdn": null,
            "paddingBottom-kGO01o": null,
            $$css: "Foo.react.js:14"
          }
        };"
      `);
    });

    test('stress test various key types and style variants (commonJS)', () => {
      expect(
        transform(
          `
            import stylex from 'stylex';

            export const styles = stylex.create({
              foo: {
                color: 'red',
                ':hover': {
                  color: 'blue',
                },
                '@media (min-width: 768px)': {
                  color: 'green',
                },
              },
              'bar-baz': {
                display: 'block',
                padding: '10px',
              },
              1: {
                fontSize: '14px',
              },
            });
          `,
          {
            debug: true,
            filename: '/src/components/Foo.react.js',
            unstable_moduleResolution: { type: 'commonJS' },
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".fontSize-xif65rj{font-size:14px}", 3000);
        _inject2(".color-x1e2nbdu{color:red}", 3000);
        _inject2(".color-x17z2mba:hover{color:blue}", 3130);
        _inject2("@media (min-width: 768px){.color-x1eatcr5.color-x1eatcr5{color:green}}", 3200);
        _inject2(".display-x1lliihq{display:block}", 3000);
        _inject2(".padding-x7z7khe{padding:10px}", 1000);
        export const styles = {
          "1": {
            "fontSize-kGuDYH": "fontSize-xif65rj",
            $$css: "components/Foo.react.js:18"
          },
          foo: {
            "color-kMwMTN": "color-x1e2nbdu",
            ":hover_color-kDPRdz": "color-x17z2mba",
            "@media (min-width: 768px)_color-kvvVxc": "color-x1eatcr5",
            $$css: "components/Foo.react.js:5"
          },
          "bar-baz": {
            "display-k1xSpc": "display-x1lliihq",
            "padding-kmVPX3": "padding-x7z7khe",
            "paddingInline-kg3NbH": null,
            "paddingStart-kuDDbn": null,
            "paddingLeft-kE3dHu": null,
            "paddingEnd-kP0aTx": null,
            "paddingRight-kpe85a": null,
            "paddingBlock-k8WAf4": null,
            "paddingTop-kLKAdn": null,
            "paddingBottom-kGO01o": null,
            $$css: "components/Foo.react.js:14"
          }
        };"
      `);
    });

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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as foo from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import { create } from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xgau0yw{--background-color:red}", 1);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x13tgbkp{--final-color:var(--background-color)}", 1);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xd71okc{content:attr(some-attribute)}", 3000);"
      `);
    });

    test('does not add unit when setting variable value', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          import {vars} from 'myTheme.stylex.js';

          const styles = stylex.create({
            default: {
              [vars.foo]: 500,
            },
          });
        `,
          {
            filename: 'MyComponent.js',
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        import { vars } from 'myTheme.stylex.js';
        _inject2(".x4b9xku{--x1w7bng0:500}", 1);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1cfch2b{transition-property:margin-top}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x17389it{transition-property:--foo}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1gykpug:hover{background-color:red}", 3130);
        _inject2(".x17z2mba:hover{color:blue}", 3130);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1gykpug:hover{background-color:red}", 3130);
        _inject2(".x17z2mba:hover{color:blue}", 3130);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ruww2u{position:sticky;position:fixed}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xixxii4{position:fixed}", 3000);
        _inject2("@media (min-width: 768px){.x1vazst0.x1vazst0{position:sticky;position:fixed}}", 3200);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x87ps6o{user-select:none}", 3000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xb3r6kr{overflow:hidden}", 2000);
        _inject2(".xbsl7fq{border-style:dashed}", 2000);
        _inject2(".xmkeg23{border-width:1px}", 2000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x15oojuh{position:fixed;position:sticky}", 3000);
        export const styles = {
          foo: {
            kVAEAm: "x15oojuh",
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}", 3000);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x19iys6w:invalpwdijad{background-color:red}", 3040);
          _inject2(".x5z3o4w:invalpwdijad{color:blue}", 3040);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x17z2mba:hover{color:blue}", 3130);
          _inject2(".x96fq8s:active{color:red}", 3170);
          _inject2(".x1wvtd7d:focus{color:yellow}", 3150);
          _inject2(".x126ychx:nth-child(2n){color:purple}", 3060);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1nxcus0:hover{position:sticky;position:fixed}", 3130);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x19iys6w:invalpwdijad{background-color:red}", 3040);
          _inject2(".x5z3o4w:invalpwdijad{color:blue}", 3040);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x17z2mba:hover{color:blue}", 3130);
          _inject2(".x96fq8s:active{color:red}", 3170);
          _inject2(".x1wvtd7d:focus{color:yellow}", 3150);
          _inject2(".x126ychx:nth-child(2n){color:purple}", 3060);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1nxcus0:hover{position:sticky;position:fixed}", 3130);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x16oeupf::before{color:red}", 8000);
          _inject2(".xdaarc3::after{color:blue}", 8000);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x6yu8oj::placeholder{color:gray}", 8000);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1en94km::-webkit-slider-thumb, .x1en94km::-moz-range-thumb, .x1en94km::-ms-thumb{width:16px}", 9000);"
        `);
      });

      test('transforms pseudo class within a pseudo element', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            export const styles = stylex.create({
              foo: {
                '::before': {
                  color: {
                    default: 'red',
                    ':hover': 'blue',
                  }
                },
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x16oeupf::before{color:red}", 8000);
          _inject2(".xeb2lg0::before:hover{color:blue}", 8130);
          export const styles = {
            foo: {
              kxBb7d: "x16oeupf xeb2lg0",
              $$css: true
            }
          };"
        `);
      });

      test('transforms legacy pseudo class within a pseudo element', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            export const styles = stylex.create({
              foo: {
                '::before': {
                  color: 'red',
                  ':hover': {
                    color: 'blue',
                  },
                },
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x16oeupf::before{color:red}", 8000);
          _inject2(".xeb2lg0::before:hover{color:blue}", 8130);
          export const styles = {
            foo: {
              kxBb7d: "x16oeupf",
              kkC3X7: "xeb2lg0",
              $$css: true
            }
          };"
        `);
      });

      test('transforms pseudo elements within legacy pseudo class', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            export const styles = stylex.create({
              foo: {
                '::before': {
                  color: 'red',
                },
                ':hover': {
                  '::before': {
                    color: 'blue',
                  },
                },
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x16oeupf::before{color:red}", 8000);
          _inject2(".xzzpreb:hover::before{color:blue}", 8130);
          export const styles = {
            foo: {
              kxBb7d: "x16oeupf",
              kFlxxK: "xzzpreb",
              $$css: true
            }
          };"
        `);
      });

      test('transforms pseudo elements sandwiched within pseudo classes', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            export const styles = stylex.create({
              foo: {
                '::before': {
                  color: 'red',
                },
                ':hover': {
                  '::before': {
                    color: {
                      default: 'blue',
                      ':hover': 'green',
                      ':active': 'purple',
                    },
                  },
                },
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x16oeupf::before{color:red}", 8000);
          _inject2(".xzzpreb:hover::before{color:blue}", 8130);
          _inject2(".x1gobd9t:hover::before:hover{color:green}", 8260);
          _inject2(".xs8jp5:hover::before:active{color:purple}", 8300);
          export const styles = {
            foo: {
              kxBb7d: "x16oeupf",
              kFlxxK: "xzzpreb x1gobd9t xs8jp5",
              $$css: true
            }
          };"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
          _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);"
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
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
          _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const borderRadius = 2;
        _inject2(".xe4njm9{margin:calc((100% - 50px) * .5) 20px 0}", 1000);
        _inject2(".xs4buau{border-color:red blue}", 2000);
        _inject2(".xbsl7fq{border-style:dashed}", 2000);
        _inject2(".xn43iik{border-width:0 0 2px 0}", 2000);
        _inject2(".xmkeg23{border-width:1px}", 2000);
        _inject2(".x1y0btm7{border-style:solid}", 2000);
        _inject2(".x1lh7sze{border-color:var(--divider)}", 2000);
        _inject2(".x12oqio5{border-radius:4px}", 2000);
        _inject2(".xa309fb{border-bottom-width:5px}", 4000);
        _inject2(".x1q0q8m5{border-bottom-style:solid}", 4000);
        _inject2(".xud65wk{border-bottom-color:red}", 4000);
        _inject2(".x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}", 1000);
        _inject2(".xexx8yu{padding-top:0}", 4000);
        _inject2(".x1bg2uv5{border-color:green}", 2000);"
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        const borderRadius = 2;
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".x1sa5p1d{margin-inline-end:10px}", 3000);
        _inject2(".x1fqp7bg{margin-bottom:15px}", 4000);
        _inject2(".xqsn43r{margin-inline-start:20px}", 3000);
        _inject2(".x1ghz6dp{margin:0}", 1000);
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
            kogj98: "xe4njm9",
            kUOVxO: null,
            keTefX: null,
            koQZXg: null,
            k71WvV: null,
            km5ZXQ: null,
            kqGvvJ: null,
            keoZOQ: null,
            k1K539: null,
            $$css: true
          },
          error: {
            kVAM5u: "xs4buau",
            kzOINU: null,
            kGJrpR: null,
            kaZRDh: null,
            kBCPoo: null,
            k26BEO: null,
            k5QoK5: null,
            kLZC3w: null,
            kL6WhQ: null,
            ksu8eU: "xbsl7fq",
            kJRH4f: null,
            kVhnKS: null,
            k4WBpm: null,
            k8ry5P: null,
            kSWEuD: null,
            kDUl1X: null,
            kPef9Z: null,
            kfdmCh: null,
            kMzoRj: "xn43iik",
            kjGldf: null,
            k2ei4v: null,
            kZ1KPB: null,
            ke9TFa: null,
            kWqL5O: null,
            kLoX6v: null,
            kEafiO: null,
            kt9PQ7: null,
            $$css: true
          },
          root: {
            kMzoRj: "xmkeg23",
            kjGldf: null,
            k2ei4v: null,
            kZ1KPB: null,
            ke9TFa: null,
            kWqL5O: null,
            kLoX6v: null,
            kEafiO: null,
            ksu8eU: "x1y0btm7",
            kJRH4f: null,
            kVhnKS: null,
            k4WBpm: null,
            k8ry5P: null,
            kSWEuD: null,
            kDUl1X: null,
            kPef9Z: null,
            kVAM5u: "x1lh7sze",
            kzOINU: null,
            kGJrpR: null,
            kaZRDh: null,
            kBCPoo: null,
            k26BEO: null,
            k5QoK5: null,
            kLZC3w: null,
            kaIpWk: "x12oqio5",
            krdFHd: null,
            kfmiAY: null,
            kVL7Gh: null,
            kT0f0o: null,
            kIxVMA: null,
            ksF3WI: null,
            kqGeR4: null,
            kYm2EN: null,
            kt9PQ7: "xa309fb",
            kfdmCh: "x1q0q8m5",
            kL6WhQ: "xud65wk",
            $$css: true
          },
          short: {
            kmVPX3: "x1lmef92",
            kg3NbH: null,
            kuDDbn: null,
            kE3dHu: null,
            kP0aTx: null,
            kpe85a: null,
            k8WAf4: null,
            kGO01o: null,
            kLKAdn: "xexx8yu",
            $$css: true
          },
          shortReversed: {
            kmVPX3: "x1lmef92",
            kg3NbH: null,
            kuDDbn: null,
            kE3dHu: null,
            kP0aTx: null,
            kpe85a: null,
            k8WAf4: null,
            kLKAdn: null,
            kGO01o: null,
            $$css: true
          },
          valid: {
            kVAM5u: "x1bg2uv5",
            kzOINU: null,
            kGJrpR: null,
            kaZRDh: null,
            kBCPoo: null,
            k26BEO: null,
            k5QoK5: null,
            kLZC3w: null,
            kL6WhQ: null,
            ksu8eU: "x1y0btm7",
            kJRH4f: null,
            kVhnKS: null,
            k4WBpm: null,
            k8ry5P: null,
            kSWEuD: null,
            kDUl1X: null,
            kPef9Z: null,
            kfdmCh: null,
            kMzoRj: "xmkeg23",
            kjGldf: null,
            k2ei4v: null,
            kZ1KPB: null,
            ke9TFa: null,
            kWqL5O: null,
            kLoX6v: null,
            kEafiO: null,
            kt9PQ7: null,
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
            keoZOQ: "xxsse2n",
            km5ZXQ: "x1wh8b8d",
            k1K539: "xat24cr",
            $$css: true
          },
          error: {
            k5QoK5: "xzu6wam",
            kzOINU: "xgomli1",
            ksu8eU: "xbsl7fq",
            kt9PQ7: "xlxy82",
            $$css: true
          },
          root: {
            kMzoRj: "xmkeg23",
            ksu8eU: "x1y0btm7",
            kVAM5u: "x1lh7sze",
            kaIpWk: "x12oqio5",
            kt9PQ7: "xa309fb",
            kfdmCh: "x1q0q8m5",
            kL6WhQ: "xud65wk",
            $$css: true
          },
          short: {
            k8WAf4: "x190pm2f",
            kg3NbH: "x1n86tx6",
            kLKAdn: "xexx8yu",
            $$css: true
          },
          shortReversed: {
            kLKAdn: "xexx8yu",
            k8WAf4: "x190pm2f",
            kg3NbH: "x1n86tx6",
            $$css: true
          },
          valid: {
            kVAM5u: "x1bg2uv5",
            ksu8eU: "x1y0btm7",
            kMzoRj: "xmkeg23",
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xfx01vb{color:var(--color)}", 3000);
        _inject2("@property --color { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: color => [{
            kWkggS: "xrkmrrc",
            kMwMTN: "xfx01vb",
            $$css: true
          }, {
            "--color": color != null ? color : undefined
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".x1bl4301{width:var(--width)}", 4000);
        _inject2("@property --width { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: width => [{
            kWkggS: "xrkmrrc",
            kzqmXN: "x1bl4301",
            $$css: true
          }, {
            "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xfx01vb{color:var(--color)}", 3000);
        _inject2(".x1mqxbix{color:black}", 3000);
        _inject2("@property --color { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: color => [{
            kWkggS: "xrkmrrc",
            kMwMTN: "xfx01vb",
            $$css: true
          }, {
            "--color": color != null ? color : undefined
          }],
          mono: {
            kMwMTN: "x1mqxbix",
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x15mgraa{--background-color:var(----background-color)}", 1);
        _inject2("@property ----background-color { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: bgColor => [{
            "--background-color": bgColor == null ? null : "x15mgraa",
            $$css: true
          }, {
            "----background-color": bgColor != null ? bgColor : undefined
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1gykpug:hover{background-color:red}", 3130);
        _inject2(".xtyu0qe:hover{color:var(--1ijzsae)}", 3130);
        _inject2("@property --1ijzsae { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: color => [{
            kGzVvX: "x1gykpug",
            kDPRdz: "xtyu0qe",
            $$css: true
          }, {
            "--1ijzsae": color != null ? color : undefined
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xfx01vb{color:var(--color)}", 3000);
        _inject2(".x1mqxbix{color:black}", 3000);
        _inject2("@property --color { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: color => [{
            kWkggS: "xrkmrrc",
            kMwMTN: "xfx01vb",
            $$css: true
          }, {
            "--color": color != null ? color : undefined
          }],
          mono: {
            kMwMTN: "x1mqxbix",
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x15mgraa{--background-color:var(----background-color)}", 1);
        _inject2("@property ----background-color { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: bgColor => [{
            "--background-color": bgColor == null ? null : "x15mgraa",
            $$css: true
          }, {
            "----background-color": bgColor != null ? bgColor : undefined
          }]
        };"
      `);
    });
    test('transforms functions with dynamic values within conditional values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              backgroundColor: 'red',
              color: {
                default: color,
                ':hover': {
                  '@media (min-width: 1000px)': 'green',
                  default: 'blue',
                }
              },
            }),
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".x1n25116{color:var(--4xs81a)}", 3000);
        _inject2("@media (min-width: 1000px){.xtljkjt.xtljkjt:hover{color:green}}", 3330);
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        _inject2("@property --4xs81a { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: color => [{
            kWkggS: "xrkmrrc",
            kMwMTN: "x1n25116 xtljkjt x17z2mba",
            $$css: true
          }, {
            "--4xs81a": color != null ? color : undefined
          }]
        };"
      `);
    });
    test('transforms functions with multiple dynamic values within conditional values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (color) => ({
              backgroundColor: 'red',
              color: {
                default: color,
                ':hover': {
                  '@media (min-width: 1000px)': 'green',
                  default: 'color-mix(' + color + ', blue)',
                }
              },
            }),
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".x1n25116{color:var(--4xs81a)}", 3000);
        _inject2("@media (min-width: 1000px){.xtljkjt.xtljkjt:hover{color:green}}", 3330);
        _inject2(".x1d4gdy3:hover{color:var(--w5m4kq)}", 3130);
        _inject2("@property --4xs81a { syntax: \\"*\\"; inherits: false;}", 0);
        _inject2("@property --w5m4kq { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: color => [{
            kWkggS: "xrkmrrc",
            kMwMTN: "x1n25116 xtljkjt x1d4gdy3",
            $$css: true
          }, {
            "--4xs81a": color != null ? color : undefined,
            "--w5m4kq": 'color-mix(' + color + ', blue)' != null ? 'color-mix(' + color + ', blue)' : undefined
          }]
        };"
      `);
    });

    test('transforms shorthands in legacy-expand-shorthands mode', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: (margin) => ({
              backgroundColor: 'red',
              margin: {
                default: margin,
                ':hover': margin + 4,
              },
              marginTop: margin - 4,
            })
          });
        `,
          { styleResolution: 'legacy-expand-shorthands' },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".x1ie72y1{margin-right:var(--14mfytm)}", 3000, ".x1ie72y1{margin-left:var(--14mfytm)}");
        _inject2(".x128459:hover{margin-right:var(--yepcm9)}", 3130, ".x128459:hover{margin-left:var(--yepcm9)}");
        _inject2(".x1hvr6ea{margin-bottom:var(--14mfytm)}", 4000);
        _inject2(".x3skgmg:hover{margin-bottom:var(--yepcm9)}", 4130);
        _inject2(".x1k44ad6{margin-left:var(--14mfytm)}", 3000, ".x1k44ad6{margin-right:var(--14mfytm)}");
        _inject2(".x10ktymb:hover{margin-left:var(--yepcm9)}", 3130, ".x10ktymb:hover{margin-right:var(--yepcm9)}");
        _inject2(".x17zef60{margin-top:var(--marginTop)}", 4000);
        _inject2("@property --14mfytm { syntax: \\"*\\"; inherits: false;}", 0);
        _inject2("@property --yepcm9 { syntax: \\"*\\"; inherits: false;}", 0);
        _inject2("@property --marginTop { syntax: \\"*\\"; inherits: false;}", 0);
        export const styles = {
          default: margin => [{
            kWkggS: "xrkmrrc",
            kETOaJ: "x1ie72y1 x128459",
            k1K539: "x1hvr6ea x3skgmg",
            kXtLW5: "x1k44ad6 x10ktymb",
            keoZOQ: "x17zef60",
            $$css: true
          }, {
            "--14mfytm": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(margin),
            "--yepcm9": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(margin + 4),
            "--marginTop": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(margin - 4)
          }]
        };"
      `);
    });
  });

  describe('[transform] setting vars with stylex.create()', () => {
    test('preserves kebab-case in CSS variable names', () => {
      // NOTE: the generated variable name is a little weird, but valid.
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: {
              '--background-color': 'red',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xgau0yw{--background-color:red}", 1);
        export const styles = {
          default: {
            "--background-color": "xgau0yw",
            $$css: true
          }
        };"
      `);
    });

    test('preserves camelCase in CSS variable names', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              '--myCustomVar': 'red',
              '--anotherCamelVar': '10px',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ujxqga{--myCustomVar:red}", 1);
        _inject2(".x1g24lt9{--anotherCamelVar:10px}", 1);"
      `);
    });
  });
});
