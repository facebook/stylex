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
  const { code, metadata } = transformSync(source, {
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
          unstable_moduleResolution: { type: 'commonJS' },
          ...opts,
        },
      ],
    ],
  });

  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.create()', () => {
    describe('static styles', () => {
      test('unused style object', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            root: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);"
        `);
      });

      test('style object', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          export const styles = {
            root: {
              kWkggS: "xrkmrrc",
              kMwMTN: "xju2f9n",
              $$css: true
            }
          };"
        `);
      });

      test('style object (multiple)', () => {
        // Check multiple objects and different key types
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              backgroundColor: 'red',
            },
            other: {
              color: 'blue',
            },
            'bar-baz': {
              color: 'green',
            },
            1: {
              color: 'blue',
            },
            [2]: {
              color: 'purple',
            },
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".xju2f9n{color:blue}", 3000);
          _inject2(".x125ip1n{color:purple}", 3000);
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".x1prwzq3{color:green}", 3000);
          export const styles = {
            "1": {
              kMwMTN: "xju2f9n",
              $$css: true
            },
            "2": {
              kMwMTN: "x125ip1n",
              $$css: true
            },
            root: {
              kWkggS: "xrkmrrc",
              $$css: true
            },
            other: {
              kMwMTN: "xju2f9n",
              $$css: true
            },
            "bar-baz": {
              kMwMTN: "x1prwzq3",
              $$css: true
            }
          };"
        `);
      });

      test('style object with custom properties', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              '--background-color': 'red',
              '--otherColor': 'green',
            }
          });
        `);

        // Must not modify casing of custom properties
        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".xgau0yw{--background-color:red}", 1);
          _inject2(".x1p9b6ba{--otherColor:green}", 1);
          export const styles = {
            root: {
              "--background-color": "xgau0yw",
              "--otherColor": "x1p9b6ba",
              $$css: true
            }
          };"
        `);
      });

      test('style object with shortform properties', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          const borderRadius = 2;
          export const styles = stylex.create({
            error: {
              borderColor: 'red blue',
              borderStyle: 'dashed solid',
              borderWidth: '0 0 2px 0',
              margin: 'calc((100% - 50px) * 0.5) 20px 0',
              padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
            },
            short: {
              borderBottomWidth: '5px',
              borderBottomStyle: 'solid',
              borderBottomColor: 'red',
              borderColor: 'var(--divider)',
              borderRadius: borderRadius * 2,
              borderStyle: 'solid',
              borderWidth: 1,
              marginTop: 'calc((100% - 50px) * 0.5)',
              marginRight: 20,
              marginBottom: 0,
              paddingTop: 0,
            },
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          const borderRadius = 2;
          _inject2(".xs4buau{border-color:red blue}", 2000);
          _inject2(".xn06r42{border-style:dashed solid}", 2000);
          _inject2(".xn43iik{border-width:0 0 2px 0}", 2000);
          _inject2(".xe4njm9{margin:calc((100% - 50px) * .5) 20px 0}", 1000);
          _inject2(".x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}", 1000);
          _inject2(".x1lh7sze{border-color:var(--divider)}", 2000);
          _inject2(".x12oqio5{border-radius:4px}", 2000);
          _inject2(".x1y0btm7{border-style:solid}", 2000);
          _inject2(".xmkeg23{border-width:1px}", 2000);
          _inject2(".xxsse2n{margin-top:calc((100% - 50px) * .5)}", 4000);
          _inject2(".x1wh8b8d{margin-right:20px}", 4000);
          _inject2(".xat24cr{margin-bottom:0}", 4000);
          _inject2(".xexx8yu{padding-top:0}", 4000);
          export const styles = {
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
              ksu8eU: "xn06r42",
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
              kogj98: "xe4njm9",
              kUOVxO: null,
              keTefX: null,
              koQZXg: null,
              k71WvV: null,
              km5ZXQ: null,
              kqGvvJ: null,
              keoZOQ: null,
              k1K539: null,
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
            short: {
              kVAM5u: "x1lh7sze",
              kzOINU: null,
              kGJrpR: null,
              kaZRDh: null,
              kBCPoo: null,
              k26BEO: null,
              k5QoK5: null,
              kLZC3w: null,
              kL6WhQ: null,
              kaIpWk: "x12oqio5",
              krdFHd: null,
              kfmiAY: null,
              kVL7Gh: null,
              kT0f0o: null,
              kIxVMA: null,
              ksF3WI: null,
              kqGeR4: null,
              kYm2EN: null,
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
              keoZOQ: "xxsse2n",
              km5ZXQ: "x1wh8b8d",
              keTefX: null,
              k71WvV: null,
              k1K539: "xat24cr",
              kLKAdn: "xexx8yu",
              $$css: true
            }
          };"
        `);
      });

      test('style object with shortform properties (styleResolution: "property-specificity")', () => {
        const options = {
          runtimeInjection: false,
          styleResolution: 'property-specificity',
        };

        const { code } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const borderRadius = 2;
          export const styles = stylex.create({
            error: {
              borderColor: 'red blue',
              borderStyle: 'dashed solid',
              borderWidth: '0 0 2px 0',
              margin: 'calc((100% - 50px) * 0.5) 20px 0',
              padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
            },
            short: {
              borderBottomWidth: '5px',
              borderBottomStyle: 'solid',
              borderBottomColor: 'red',
              borderColor: 'var(--divider)',
              borderRadius: borderRadius * 2,
              borderStyle: 'solid',
              borderWidth: 1,
              marginTop: 'calc((100% - 50px) * 0.5)',
              marginRight: 20,
              marginBottom: 0,
              paddingTop: 0,
            },
          });
        `,
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          const borderRadius = 2;
          export const styles = {
            error: {
              kVAM5u: "xs4buau",
              ksu8eU: "xn06r42",
              kMzoRj: "xn43iik",
              kogj98: "xe4njm9",
              kmVPX3: "x1lmef92",
              $$css: true
            },
            short: {
              kt9PQ7: "xa309fb",
              kfdmCh: "x1q0q8m5",
              kL6WhQ: "xud65wk",
              kVAM5u: "x1lh7sze",
              kaIpWk: "x12oqio5",
              ksu8eU: "x1y0btm7",
              kMzoRj: "xmkeg23",
              keoZOQ: "xxsse2n",
              km5ZXQ: "x1wh8b8d",
              k1K539: "xat24cr",
              kLKAdn: "xexx8yu",
              $$css: true
            }
          };"
        `);
      });

      test('style object requiring vendor prefixes', () => {
        // TODO: add more vendor-prefixed properties and values
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              userSelect: 'none',
            },
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".x87ps6o{user-select:none}", 3000);
          export const styles = {
            root: {
              kfSwDN: "x87ps6o",
              $$css: true
            }
          };"
        `);
      });

      describe('simple values', () => {
        test('set custom property', () => {
          const options = {
            filename: 'MyComponent.js',
            unstable_moduleResolution: { type: 'haste' },
          };

          const { code } = transform(
            `
            import * as stylex from '@stylexjs/stylex';
            import {vars} from 'vars.stylex.js';

            export const styles = stylex.create({
              root: {
                [vars.foo]: 500,
              },
            });
          `,
            options,
          );

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            import { vars } from 'vars.stylex.js';
            _inject2(".x1pojaxg{--x1mxfvjx:500}", 1);
            export const styles = {
              root: {
                "--x1mxfvjx": "x1pojaxg",
                $$css: true
              }
            };"
          `);
        });

        test('set "transitionProperty"', () => {
          const camelCased = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                transitionProperty: 'marginTop',
              },
            });
          `);

          expect(camelCased.code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1cfch2b{transition-property:margin-top}", 3000);
            export const styles = {
              root: {
                k1ekBW: "x1cfch2b",
                $$css: true
              }
            };"
          `);

          const kebabCased = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                transitionProperty: 'margin-top',
              },
            });
          `);

          expect(kebabCased.code).toEqual(camelCased.code);

          const customProperty = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                transitionProperty: '--foo',
              },
            });
          `);

          expect(customProperty.code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x17389it{transition-property:--foo}", 3000);
            export const styles = {
              root: {
                k1ekBW: "x17389it",
                $$css: true
              }
            };"
          `);
        });

        test('use "attr()" function', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                content: 'attr(some-attribute)',
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xd71okc{content:attr(some-attribute)}", 3000);
            export const styles = {
              root: {
                kah6P1: "xd71okc",
                $$css: true
              }
            };"
          `);
        });

        test('use array (fallbacks)', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                position: ['sticky', 'fixed']
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1ruww2u{position:sticky;position:fixed}", 3000);
            export const styles = {
              root: {
                kVAEAm: "x1ruww2u",
                $$css: true
              }
            };"
          `);
        });

        test('use "stylex.firstThatWorks"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                position: stylex.firstThatWorks('sticky', 'fixed'),
              }
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x15oojuh{position:fixed;position:sticky}", 3000);
            export const styles = {
              root: {
                kVAEAm: "x15oojuh",
                $$css: true
              }
            };"
          `);
        });

        test('use CSS variable', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                backgroundColor: 'var(--background-color)',
              }
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xn9heto{background-color:var(--background-color)}", 3000);
            export const styles = {
              root: {
                kWkggS: "xn9heto",
                $$css: true
              }
            };"
          `);
        });

        test('use string containing CSS variables', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                boxShadow: '0px 2px 4px var(--shadow-1)',
              }
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}", 3000);
            export const styles = {
              root: {
                kGVxlE: "xxnfx33",
                $$css: true
              }
            };"
          `);
        });
      });

      describe('object values: pseudo-classes', () => {
        test('invalid pseudo-class', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: {
                  ':invalidpseudo': 'blue'
                },
              },
            });
          `);

          // TODO: this should either fail or guarantee an insertion order relative to valid pseudo-classes
          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1qo2jjy:invalidpseudo{color:blue}", 3040);
            export const styles = {
              root: {
                kMwMTN: "x1qo2jjy",
                $$css: true
              }
            };"
          `);
        });

        test('valid pseudo-class', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                backgroundColor: {
                  ':hover': 'red',
                },
                color: {
                  ':hover': 'blue',
                }
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1gykpug:hover{background-color:red}", 3130);
            _inject2(".x17z2mba:hover{color:blue}", 3130);
            export const styles = {
              root: {
                kWkggS: "x1gykpug",
                kMwMTN: "x17z2mba",
                $$css: true
              }
            };"
          `);
        });

        test('pseudo-class generated order', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: {
                  ':hover': 'blue',
                  ':active':'red',
                  ':focus': 'yellow',
                  ':nth-child(2n)': 'purple',
                },
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x17z2mba:hover{color:blue}", 3130);
            _inject2(".x96fq8s:active{color:red}", 3170);
            _inject2(".x1wvtd7d:focus{color:yellow}", 3150);
            _inject2(".x126ychx:nth-child(2n){color:purple}", 3060);
            export const styles = {
              root: {
                kMwMTN: "x17z2mba x96fq8s x1wvtd7d x126ychx",
                $$css: true
              }
            };"
          `);
        });

        test('pseudo-class with array fallbacks', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                position: {
                  ':hover': ['sticky', 'fixed'],
                }
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1nxcus0:hover{position:sticky;position:fixed}", 3130);
            export const styles = {
              root: {
                kVAEAm: "x1nxcus0",
                $$css: true
              }
            };"
          `);
        });
      });

      describe('object values: pseudo-elements', () => {
        test('"::before" and "::after"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: {
                '::before': {
                  color: 'red'
                },
                '::after': {
                  color: 'blue'
                },
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x16oeupf::before{color:red}", 8000);
            _inject2(".xdaarc3::after{color:blue}", 8000);
            export const styles = {
              foo: {
                kxBb7d: "x16oeupf",
                kB1Fuz: "xdaarc3",
                $$css: true
              }
            };"
          `);
        });

        test('"::placeholder"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: {
                '::placeholder': {
                  color: 'gray',
                },
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x6yu8oj::placeholder{color:gray}", 8000);
            export const styles = {
              foo: {
                k8Qsv1: "x6yu8oj",
                $$css: true
              }
            };"
          `);
        });

        test('"::thumb"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: {
                '::thumb': {
                  width: 16,
                },
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1en94km::-webkit-slider-thumb, .x1en94km::-moz-range-thumb, .x1en94km::-ms-thumb{width:16px}", 9000);
            export const styles = {
              foo: {
                k8pbKx: "x1en94km",
                $$css: true
              }
            };"
          `);
        });

        test('"::before" containing pseudo-classes', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
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
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
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
      });

      describe('object values: queries', () => {
        test('media queries', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                backgroundColor: {
                  default: 'red',
                  '@media (min-width: 1000px)': 'blue',
                  '@media (min-width: 2000px)': 'purple',
                }
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xrkmrrc{background-color:red}", 3000);
            _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
            _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
            export const styles = {
              root: {
                kWkggS: "xrkmrrc xc445zv x1ssfqz5",
                $$css: true
              }
            };"
          `);
        });

        test('supports queries', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                backgroundColor: {
                  default:'red',
                  '@supports (hover: hover)': 'blue',
                  '@supports not (hover: hover)': 'purple',
                }
              },
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xrkmrrc{background-color:red}", 3000);
            _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
            _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
            export const styles = {
              root: {
                kWkggS: "xrkmrrc x6m3b6q x6um648",
                $$css: true
              }
            };"
          `);
        });

        test('media query with pseudo-classes', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                fontSize: {
                  default: '1rem',
                  '@media (min-width: 800px)': {
                    default: '2rem',
                    ':hover': '2.2rem'
                  }
                }
              },
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1jchvi3{font-size:1rem}", 3000);
            _inject2("@media (min-width: 800px){.x1w3nbkt.x1w3nbkt{font-size:2rem}}", 3200);
            _inject2("@media (min-width: 800px){.xicay7j.xicay7j:hover{font-size:2.2rem}}", 3330);
            export const styles = {
              root: {
                kGuDYH: "x1jchvi3 x1w3nbkt xicay7j",
                $$css: true
              }
            };"
          `);
        });

        test('media query with array fallbacks', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              default: {
                position: {
                  default: 'fixed',
                  '@media (min-width: 768px)': ['sticky', 'fixed'],
                }
              },
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xixxii4{position:fixed}", 3000);
            _inject2("@media (min-width: 768px){.x1vazst0.x1vazst0{position:sticky;position:fixed}}", 3200);
            export const styles = {
              default: {
                kVAEAm: "xixxii4 x1vazst0",
                $$css: true
              }
            };"
          `);
        });
      });
    });

    describe('dynamic styles', () => {
      test('style function', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: (color) => ({
              backgroundColor: 'red',
              color,
            })
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xfx01vb{color:var(--color)}", 3000);
          _inject2("@property --color { syntax: \\"*\\"; inherits: false;}", 0);
          export const styles = {
            root: color => [{
              kWkggS: "xrkmrrc",
              kMwMTN: "xfx01vb",
              $$css: true
            }, {
              "--color": color != null ? color : undefined
            }]
          };"
        `);
      });

      test('style function and object', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            one: (color) => ({
              color: color,
            }),
            two: {
              color: 'black',
            },
          });
        `);

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".xfx01vb{color:var(--color)}", 3000);
          _inject2(".x1mqxbix{color:black}", 3000);
          _inject2("@property --color { syntax: \\"*\\"; inherits: false;}", 0);
          export const styles = {
            one: color => [{
              kMwMTN: "xfx01vb",
              $$css: true
            }, {
              "--color": color != null ? color : undefined
            }],
            two: {
              kMwMTN: "x1mqxbix",
              $$css: true
            }
          };"
        `);
      });

      test('style function with custom properties', () => {
        const { code } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: (bgColor, otherColor) => ({
              '--background-color': bgColor,
              '--otherColor': otherColor,
            }),
          });
        `);

        // NOTE: the generated variable name is a little weird, but valid.
        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
          _inject2(".x15mgraa{--background-color:var(----background-color)}", 1);
          _inject2(".x1qph05k{--otherColor:var(----otherColor)}", 1);
          _inject2("@property ----background-color { syntax: \\"*\\"; inherits: false;}", 0);
          _inject2("@property ----otherColor { syntax: \\"*\\"; inherits: false;}", 0);
          export const styles = {
            root: (bgColor, otherColor) => [{
              "--background-color": bgColor == null ? null : "x15mgraa",
              "--otherColor": otherColor == null ? null : "x1qph05k",
              $$css: true
            }, {
              "----background-color": bgColor != null ? bgColor : undefined,
              "----otherColor": otherColor != null ? otherColor : undefined
            }]
          };"
        `);
      });

      describe('simple values', () => {
        test('set number unit', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width) => ({
                width,
              })
            });
          `);

          // Check that dynamic number values get units where appropriate
          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1bl4301{width:var(--width)}", 4000);
            _inject2("@property --width { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: width => [{
                kzqmXN: "x1bl4301",
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
              }]
            };"
          `);
        });

        test('set custom property', () => {
          const options = {
            filename: 'MyComponent.js',
            unstable_moduleResolution: { type: 'haste' },
          };

          const { code } = transform(
            `
            import * as stylex from '@stylexjs/stylex';
            import {vars} from 'vars.stylex.js';

            export const styles = stylex.create({
              root: (width) => ({
                [vars.width]: width
              })
            });
          `,
            options,
          );

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            import { vars } from 'vars.stylex.js';
            _inject2(".x14vhreu{--x1anmu0j:var(----x1anmu0j)}", 1);
            _inject2("@property ----x1anmu0j { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: width => [{
                "--x1anmu0j": width == null ? null : "x14vhreu",
                $$css: true
              }, {
                "----x1anmu0j": width != null ? width : undefined
              }]
            };"
          `);
        });
      });

      describe('object values: pseudo-classes', () => {
        test('valid pseudo-class', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: {
                  ':hover': color,
                },
                color: {
                  ':hover': color,
                }
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1ttfofm:hover{background-color:var(--1e2mv7m)}", 3130);
            _inject2(".x74ai9j:hover{color:var(--1113oo7)}", 3130);
            _inject2("@property --1e2mv7m { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --1113oo7 { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: color => [{
                kWkggS: "x1ttfofm",
                kMwMTN: "x74ai9j",
                $$css: true
              }, {
                "--1e2mv7m": color != null ? color : undefined,
                "--1113oo7": color != null ? color : undefined
              }]
            };"
          `);
        });

        test('pseudo-class generated order', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (hover, active, focus) => ({
                color: {
                  ':hover': hover,
                  ':active': active,
                  ':focus': focys,
                  ':nth-child(2n)': 'purple',
                },
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x74ai9j:hover{color:var(--1113oo7)}", 3130);
            _inject2(".x19c4yy1:active{color:var(--hxnnmm)}", 3170);
            _inject2(".x10peeyq:focus{color:var(--8tbbve)}", 3150);
            _inject2(".x126ychx:nth-child(2n){color:purple}", 3060);
            _inject2("@property --1113oo7 { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --hxnnmm { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --8tbbve { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: (hover, active, focus) => [{
                kMwMTN: "x74ai9j x19c4yy1 x10peeyq x126ychx",
                $$css: true
              }, {
                "--1113oo7": hover != null ? hover : undefined,
                "--hxnnmm": active != null ? active : undefined,
                "--8tbbve": focys != null ? focys : undefined
              }]
            };"
          `);
        });
      });

      describe('object values: pseudo-elements', () => {
        test('"::before" and "::after"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: (a, b) => ({
                '::before': {
                  color: a
                },
                '::after': {
                  color: b
                },
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x6r7ojb::before{color:var(--1g451k2)}", 8000);
            _inject2(".x5ga601::after{color:var(--19erzii)}", 8000);
            _inject2("@property --1g451k2 { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --19erzii { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              foo: (a, b) => [{
                kxBb7d: "x6r7ojb",
                kB1Fuz: "x5ga601",
                $$css: true
              }, {
                "--1g451k2": a != null ? a : undefined,
                "--19erzii": b != null ? b : undefined
              }]
            };"
          `);
        });

        test('"::placeholder"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: (color) => ({
                '::placeholder': {
                  color,
                },
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".xwdnmik::placeholder{color:var(--163tekb)}", 8000);
            _inject2("@property --163tekb { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              foo: color => [{
                k8Qsv1: "xwdnmik",
                $$css: true
              }, {
                "--163tekb": color != null ? color : undefined
              }]
            };"
          `);
        });

        test('"::thumb"', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: (width) => ({
                '::thumb': {
                  width,
                },
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x3j4sww::-webkit-slider-thumb, .x3j4sww::-moz-range-thumb, .x3j4sww::-ms-thumb{width:var(--msahdu)}", 9000);
            _inject2("@property --msahdu { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              foo: width => [{
                k8pbKx: "x3j4sww",
                $$css: true
              }, {
                "--msahdu": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
              }]
            };"
          `);
        });

        test('"::before" containing pseudo-classes', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              foo: (color) => ({
                '::before': {
                  color: {
                    default: 'red',
                    ':hover': color,
                  }
                },
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x16oeupf::before{color:red}", 8000);
            _inject2(".x10u3axo::before:hover{color:var(--6bge3v)}", 8130);
            _inject2("@property --6bge3v { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              foo: color => [{
                kxBb7d: "x16oeupf x10u3axo",
                $$css: true
              }, {
                "--6bge3v": color != null ? color : undefined
              }]
            };"
          `);
        });
      });

      describe('object values: queries', () => {
        test('media queries', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (a, b, c) => ({
                width: {
                  default: 'color-mix(' + color + ', blue)',
                  '@media (min-width: 1000px)': b,
                  '@media (min-width: 2000px)': c,
                }
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1svif2g{width:var(--1xmrurk)}", 4000);
            _inject2("@media (min-width: 1000px){.x1a6pj3q.x1a6pj3q{width:var(--wm47pl)}}", 4200);
            _inject2("@media (min-width: 2000px){.xf0apgt.xf0apgt{width:var(--1obb2yn)}}", 4200);
            _inject2("@property --1xmrurk { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --wm47pl { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --1obb2yn { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: (a, b, c) => [{
                kzqmXN: "x1svif2g x1a6pj3q xf0apgt",
                $$css: true
              }, {
                "--1xmrurk": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)('color-mix(' + color + ', blue)'),
                "--wm47pl": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(b),
                "--1obb2yn": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(c)
              }]
            };"
          `);
        });

        test('supports queries', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (a, b, c) => ({
                color: {
                  default: a,
                  '@supports (hover: hover)': b,
                  '@supports not (hover: hover)': c,
                }
              }),
            });
          `);

          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1n25116{color:var(--4xs81a)}", 3000);
            _inject2("@supports (hover: hover){.x1oeo35w.x1oeo35w{color:var(--b262sw)}}", 3030);
            _inject2("@supports not (hover: hover){.x10db8fb.x10db8fb{color:var(--wu2acw)}}", 3030);
            _inject2("@property --4xs81a { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --b262sw { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --wu2acw { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: (a, b, c) => [{
                kMwMTN: "x1n25116 x1oeo35w x10db8fb",
                $$css: true
              }, {
                "--4xs81a": a != null ? a : undefined,
                "--b262sw": b != null ? b : undefined,
                "--wu2acw": c != null ? c : undefined
              }]
            };"
          `);
        });

        test('media query with pseudo-classes', () => {
          const { code } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (a, b, c) => ({
                fontSize: {
                  default: a,
                  '@media (min-width: 800px)': {
                    default: b,
                    ':hover': c
                  }
                }
              }),
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import * as stylex from '@stylexjs/stylex';
            _inject2(".x1cfcgx7{font-size:var(--19zvkyr)}", 3000);
            _inject2("@media (min-width: 800px){.x956mei.x956mei{font-size:var(--1xajcet)}}", 3200);
            _inject2("@media (min-width: 800px){.xarp7f8.xarp7f8:hover{font-size:var(--ke45ok)}}", 3330);
            _inject2("@property --19zvkyr { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --1xajcet { syntax: \\"*\\"; inherits: false;}", 0);
            _inject2("@property --ke45ok { syntax: \\"*\\"; inherits: false;}", 0);
            export const styles = {
              root: (a, b, c) => [{
                kGuDYH: "x1cfcgx7 x956mei xarp7f8",
                $$css: true
              }, {
                "--19zvkyr": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(a),
                "--1xajcet": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(b),
                "--ke45ok": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(c)
              }]
            };"
          `);
        });
      });
    });

    describe('options `debug:true`', () => {
      test('adds debug data', () => {
        const options = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
        };

        const { code } = transform(
          `
            import * as stylex from '@stylexjs/stylex';
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
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
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
      });

      test('adds debug data for npm packages', () => {
        const options = {
          debug: true,
          filename: '/js/node_modules/npm-package/dist/components/Foo.react.js',
        };

        const { code } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
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
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
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

      test('adds debug data (haste)', () => {
        const options = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };

        const { code } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
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
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
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
      });

      test('adds debug data for npm packages (haste)', () => {
        const options = {
          debug: true,
          filename: '/node_modules/npm-package/dist/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };

        const { code } = transform(
          `
          import * as stylex from '@stylexjs/stylex';
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
          options,
        );

        expect(code).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import * as stylex from '@stylexjs/stylex';
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
    });

    // LEGACY (TODO: Remove)
    describe('legacy / deprecated', () => {
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
          `).code,
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1gykpug:hover{background-color:red}", 3130);
          _inject2(".x17z2mba:hover{color:blue}", 3130);"
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
            `).code,
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
            `).code,
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
            `).code,
          ).toMatchInlineSnapshot(`
            "import _inject from "@stylexjs/stylex/lib/stylex-inject";
            var _inject2 = _inject;
            import stylex from 'stylex';
            _inject2(".x1nxcus0:hover{position:sticky;position:fixed}", 3130);"
          `);
        });
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
          `).code,
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
          `).code,
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
          `).code,
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
          `).code,
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
          `).code,
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
          _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);"
        `);
      });

      test('transforms dynamic shorthands in legacy-expand-shorthands mode', () => {
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
          ).code,
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
  });
});
