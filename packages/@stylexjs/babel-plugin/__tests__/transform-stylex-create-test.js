/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [[stylexPlugin, { ...opts }]],
  });

  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.create()', () => {
    describe('static styles', () => {
      test('unused style object', () => {
        const { code, metadata } = transform(`
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            root: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `);
        expect(code).toMatchInlineSnapshot(
          '"import * as stylex from \'@stylexjs/stylex\';"',
        );
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xrkmrrc",
                {
                  "ltr": ".xrkmrrc{background-color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "xju2f9n",
                {
                  "ltr": ".xju2f9n{color:blue}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      test('style object', () => {
        const { code, metadata } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `);
        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            root: {
              kWkggS: "xrkmrrc",
              kMwMTN: "xju2f9n",
              $$css: true
            }
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xrkmrrc",
                {
                  "ltr": ".xrkmrrc{background-color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "xju2f9n",
                {
                  "ltr": ".xju2f9n{color:blue}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      test('style object (multiple)', () => {
        // Check multiple objects and different key types
        const { code, metadata } = transform(`
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
          "import * as stylex from '@stylexjs/stylex';
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xju2f9n",
                {
                  "ltr": ".xju2f9n{color:blue}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "x125ip1n",
                {
                  "ltr": ".x125ip1n{color:purple}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "xrkmrrc",
                {
                  "ltr": ".xrkmrrc{background-color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "x1prwzq3",
                {
                  "ltr": ".x1prwzq3{color:green}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      test('style object with custom properties', () => {
        const { code, metadata } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              '--background-color': 'red',
              '--otherColor': 'green',
              '--foo': 10
            }
          });
        `);
        // Must not modify casing of custom properties
        // Must not add units to unitless values
        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            root: {
              "--background-color": "xgau0yw",
              "--otherColor": "x1p9b6ba",
              "--foo": "x40g909",
              $$css: true
            }
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xgau0yw",
                {
                  "ltr": ".xgau0yw{--background-color:red}",
                  "rtl": null,
                },
                1,
              ],
              [
                "x1p9b6ba",
                {
                  "ltr": ".x1p9b6ba{--otherColor:green}",
                  "rtl": null,
                },
                1,
              ],
              [
                "x40g909",
                {
                  "ltr": ".x40g909{--foo:10}",
                  "rtl": null,
                },
                1,
              ],
            ],
          }
        `);
      });

      // TODO: eventually these multi-value shortforms should not be allowed
      // Requires Meta migration to be completed.
      test('style object with shortform properties', () => {
        const { code, metadata } = transform(`
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xs4buau",
                {
                  "ltr": ".xs4buau{border-color:red blue}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xn06r42",
                {
                  "ltr": ".xn06r42{border-style:dashed solid}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xn43iik",
                {
                  "ltr": ".xn43iik{border-width:0 0 2px 0}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xe4njm9",
                {
                  "ltr": ".xe4njm9{margin:calc((100% - 50px) * .5) 20px 0}",
                  "rtl": null,
                },
                1000,
              ],
              [
                "x1lmef92",
                {
                  "ltr": ".x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}",
                  "rtl": null,
                },
                1000,
              ],
              [
                "xa309fb",
                {
                  "ltr": ".xa309fb{border-bottom-width:5px}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "x1q0q8m5",
                {
                  "ltr": ".x1q0q8m5{border-bottom-style:solid}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "xud65wk",
                {
                  "ltr": ".xud65wk{border-bottom-color:red}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "x1lh7sze",
                {
                  "ltr": ".x1lh7sze{border-color:var(--divider)}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "x12oqio5",
                {
                  "ltr": ".x12oqio5{border-radius:4px}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "x1y0btm7",
                {
                  "ltr": ".x1y0btm7{border-style:solid}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xmkeg23",
                {
                  "ltr": ".xmkeg23{border-width:1px}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xxsse2n",
                {
                  "ltr": ".xxsse2n{margin-top:calc((100% - 50px) * .5)}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "x1wh8b8d",
                {
                  "ltr": ".x1wh8b8d{margin-right:20px}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "xat24cr",
                {
                  "ltr": ".xat24cr{margin-bottom:0}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "xexx8yu",
                {
                  "ltr": ".xexx8yu{padding-top:0}",
                  "rtl": null,
                },
                4000,
              ],
            ],
          }
        `);
      });

      test('style object with shortform properties (styleResolution: "property-specificity")', () => {
        const options = {
          runtimeInjection: false,
          styleResolution: 'property-specificity',
        };
        const { code, metadata } = transform(
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xs4buau",
                {
                  "ltr": ".xs4buau{border-color:red blue}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xn06r42",
                {
                  "ltr": ".xn06r42{border-style:dashed solid}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xn43iik",
                {
                  "ltr": ".xn43iik{border-width:0 0 2px 0}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xe4njm9",
                {
                  "ltr": ".xe4njm9{margin:calc((100% - 50px) * .5) 20px 0}",
                  "rtl": null,
                },
                1000,
              ],
              [
                "x1lmef92",
                {
                  "ltr": ".x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}",
                  "rtl": null,
                },
                1000,
              ],
              [
                "xa309fb",
                {
                  "ltr": ".xa309fb{border-bottom-width:5px}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "x1q0q8m5",
                {
                  "ltr": ".x1q0q8m5{border-bottom-style:solid}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "xud65wk",
                {
                  "ltr": ".xud65wk{border-bottom-color:red}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "x1lh7sze",
                {
                  "ltr": ".x1lh7sze{border-color:var(--divider)}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "x12oqio5",
                {
                  "ltr": ".x12oqio5{border-radius:4px}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "x1y0btm7",
                {
                  "ltr": ".x1y0btm7{border-style:solid}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xmkeg23",
                {
                  "ltr": ".xmkeg23{border-width:1px}",
                  "rtl": null,
                },
                2000,
              ],
              [
                "xxsse2n",
                {
                  "ltr": ".xxsse2n{margin-top:calc((100% - 50px) * .5)}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "x1wh8b8d",
                {
                  "ltr": ".x1wh8b8d{margin-right:20px}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "xat24cr",
                {
                  "ltr": ".xat24cr{margin-bottom:0}",
                  "rtl": null,
                },
                4000,
              ],
              [
                "xexx8yu",
                {
                  "ltr": ".xexx8yu{padding-top:0}",
                  "rtl": null,
                },
                4000,
              ],
            ],
          }
        `);
      });

      test('style object requiring vendor prefixes', () => {
        // TODO: add more vendor-prefixed properties and values
        const { code, metadata } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: {
              userSelect: 'none',
            },
          });
        `);
        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            root: {
              kfSwDN: "x87ps6o",
              $$css: true
            }
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "x87ps6o",
                {
                  "ltr": ".x87ps6o{user-select:none}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      describe('simple values', () => {
        test('set custom property', () => {
          const options = {
            filename: 'MyComponent.js',
            unstable_moduleResolution: { type: 'haste' },
          };
          const { code, metadata } = transform(
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
            "import * as stylex from '@stylexjs/stylex';
            import { vars } from 'vars.stylex.js';
            export const styles = {
              root: {
                "--x1mxfvjx": "x1pojaxg",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1pojaxg",
                  {
                    "ltr": ".x1pojaxg{--x1mxfvjx:500}",
                    "rtl": null,
                  },
                  1,
                ],
              ],
            }
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                k1ekBW: "x1cfch2b",
                $$css: true
              }
            };"
          `);
          expect(camelCased.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1cfch2b",
                  {
                    "ltr": ".x1cfch2b{transition-property:margin-top}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
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
          expect(kebabCased.metadata).toEqual(kebabCased.metadata);

          const customProperty = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                transitionProperty: '--foo',
              },
            });
          `);
          expect(customProperty.code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                k1ekBW: "x17389it",
                $$css: true
              }
            };"
          `);
          expect(customProperty.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x17389it",
                  {
                    "ltr": ".x17389it{transition-property:--foo}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);

          const multiProperty = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              one: {
                transitionProperty: 'opacity, insetInlineStart',
              },
              two: {
                transitionProperty: 'opacity, inset-inline-start',
              },
            });
          `);
          expect(multiProperty.code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              one: {
                k1ekBW: "xh6nlrc",
                $$css: true
              },
              two: {
                k1ekBW: "xh6nlrc",
                $$css: true
              }
            };"
          `);
          expect(multiProperty.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xh6nlrc",
                  {
                    "ltr": ".xh6nlrc{transition-property:opacity,inset-inline-start}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('set "willChange"', () => {
          const camelCased = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                willChange: 'insetInlineStart',
              },
            });
          `);
          expect(camelCased.code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                k6sLGO: "x1n5prqt",
                $$css: true
              }
            };"
          `);
          expect(camelCased.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1n5prqt",
                  {
                    "ltr": ".x1n5prqt{will-change:inset-inline-start}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);

          const kebabCased = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                willChange: 'inset-inline-start',
              },
            });
          `);
          expect(kebabCased.code).toEqual(camelCased.code);
          expect(kebabCased.metadata).toEqual(kebabCased.metadata);

          const customProperty = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                willChange: '--foo',
              },
            });
          `);
          expect(customProperty.code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                k6sLGO: "x1lxaxzv",
                $$css: true
              }
            };"
          `);
          expect(customProperty.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1lxaxzv",
                  {
                    "ltr": ".x1lxaxzv{will-change:--foo}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);

          const multiProperty = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              one: {
                willChange: 'opacity, insetInlineStart',
              },
              two: {
                willChange: 'opacity, inset-inline-start',
              }
            });
          `);
          expect(multiProperty.code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              one: {
                k6sLGO: "x30a982",
                $$css: true
              },
              two: {
                k6sLGO: "x30a982",
                $$css: true
              }
            };"
          `);
          expect(multiProperty.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x30a982",
                  {
                    "ltr": ".x30a982{will-change:opacity,inset-inline-start}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);

          const keyword = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                willChange: 'scroll-position'
              }
            });
          `);
          expect(keyword.code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                k6sLGO: "x1q5hf6d",
                $$css: true
              }
            };"
          `);
          expect(keyword.metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1q5hf6d",
                  {
                    "ltr": ".x1q5hf6d{will-change:scroll-position}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('use "attr()" function', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                content: 'attr(some-attribute)',
              },
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kah6P1: "xd71okc",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xd71okc",
                  {
                    "ltr": ".xd71okc{content:attr(some-attribute)}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('use array (fallbacks)', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                position: ['sticky', 'fixed']
              },
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kVAEAm: "x1ruww2u",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1ruww2u",
                  {
                    "ltr": ".x1ruww2u{position:sticky;position:fixed}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('use CSS variable', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                backgroundColor: 'var(--background-color)',
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kWkggS: "xn9heto",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xn9heto",
                  {
                    "ltr": ".xn9heto{background-color:var(--background-color)}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('use string containing CSS variables', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                boxShadow: '0px 2px 4px var(--shadow-1)',
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kGVxlE: "xxnfx33",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xxnfx33",
                  {
                    "ltr": ".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });
      });

      describe('function value: stylex.firstThatWorks()', () => {
        // Check various combinations of fallbacks
        test('args: value, value', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                position: stylex.firstThatWorks('sticky', 'fixed'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kVAEAm: "x15oojuh",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x15oojuh",
                  {
                    "ltr": ".x15oojuh{position:fixed;position:sticky}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('args: value, var', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: stylex.firstThatWorks('red', 'var(--color)'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x1nv2f59",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1nv2f59",
                  {
                    "ltr": ".x1nv2f59{color:var(--color);color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('args: var, value', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: stylex.firstThatWorks('var(--color)', 'red'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x8nmrrw",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x8nmrrw",
                  {
                    "ltr": ".x8nmrrw{color:var(--color,red)}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('args: var, var', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: stylex.firstThatWorks('var(--color)', 'var(--otherColor)'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x1775bb3",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1775bb3",
                  {
                    "ltr": ".x1775bb3{color:var(--color,var(--otherColor))}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('args: var, var, var', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: stylex.firstThatWorks('var(--color)', 'var(--secondColor)', 'var(--thirdColor)'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "xsrkhny",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xsrkhny",
                  {
                    "ltr": ".xsrkhny{color:var(--color,var(--secondColor,var(--thirdColor)))}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('args: func, var, value', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: stylex.firstThatWorks('color-mix(in srgb, currentColor 20%, transparent)', 'var(--color)', 'red'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x8vgp76",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x8vgp76",
                  {
                    "ltr": ".x8vgp76{color:var(--color,red);color:color-mix(in srgb,currentColor 20%,transparent)}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('args: func, var, value, value', () => {
          // Ignore simple fallbacks after the first one
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: stylex.firstThatWorks('color-mix(in srgb, currentColor 20%, transparent)', 'var(--color)', 'red', 'green'),
              }
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x8vgp76",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x8vgp76",
                  {
                    "ltr": ".x8vgp76{color:var(--color,red);color:color-mix(in srgb,currentColor 20%,transparent)}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });
      });

      describe.skip('function value: stylex.types.*()', () => {
        // TODO: port tests from "stylex-types-test.js" in "shared"
      });

      describe('object values: pseudo-classes', () => {
        test('invalid pseudo-class', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: {
                  ':invalidpseudo': 'blue'
                },
              },
            });
          `);
          // TODO: this should either fail or guarantee an insertion
          // order relative to valid pseudo-classes
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x1qo2jjy",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1qo2jjy",
                  {
                    "ltr": ".x1qo2jjy:invalidpseudo{color:blue}",
                    "rtl": null,
                  },
                  3040,
                ],
              ],
            }
          `);
        });

        test('valid pseudo-class', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kWkggS: "x1gykpug",
                kMwMTN: "x17z2mba",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1gykpug",
                  {
                    "ltr": ".x1gykpug:hover{background-color:red}",
                    "rtl": null,
                  },
                  3130,
                ],
                [
                  "x17z2mba",
                  {
                    "ltr": ".x17z2mba:hover{color:blue}",
                    "rtl": null,
                  },
                  3130,
                ],
              ],
            }
          `);
        });

        test('pseudo-class generated order', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "x17z2mba x96fq8s x1wvtd7d x126ychx",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x17z2mba",
                  {
                    "ltr": ".x17z2mba:hover{color:blue}",
                    "rtl": null,
                  },
                  3130,
                ],
                [
                  "x96fq8s",
                  {
                    "ltr": ".x96fq8s:active{color:red}",
                    "rtl": null,
                  },
                  3170,
                ],
                [
                  "x1wvtd7d",
                  {
                    "ltr": ".x1wvtd7d:focus{color:yellow}",
                    "rtl": null,
                  },
                  3150,
                ],
                [
                  "x126ychx",
                  {
                    "ltr": ".x126ychx:nth-child(2n){color:purple}",
                    "rtl": null,
                  },
                  3060,
                ],
              ],
            }
          `);
        });

        test('pseudo-class generated order (nested, same value)', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: {
                  ':hover': {
                    ':active':'red',
                  },
                  ':active': {
                    ':hover':'red',
                  },
                },
              },
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "xa2ikkt",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xa2ikkt",
                  {
                    "ltr": ".xa2ikkt:active:hover{color:red}",
                    "rtl": null,
                  },
                  3300,
                ],
              ],
            }
          `);
        });

        test('pseudo-class generated order (nested, different value)', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                color: {
                  ':hover': {
                    ':active':'red',
                  },
                  ':active': {
                    ':hover':'green',
                  },
                },
              },
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kMwMTN: "xa2ikkt x13pwkn",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xa2ikkt",
                  {
                    "ltr": ".xa2ikkt:active:hover{color:red}",
                    "rtl": null,
                  },
                  3300,
                ],
                [
                  "x13pwkn",
                  {
                    "ltr": ".x13pwkn:active:hover{color:green}",
                    "rtl": null,
                  },
                  3300,
                ],
              ],
            }
          `);
        });

        test('pseudo-class with array fallbacks', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kVAEAm: "x1nxcus0",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1nxcus0",
                  {
                    "ltr": ".x1nxcus0:hover{position:sticky;position:fixed}",
                    "rtl": null,
                  },
                  3130,
                ],
              ],
            }
          `);
        });
      });

      describe('object values: pseudo-elements', () => {
        test('"::before" and "::after"', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: {
                kxBb7d: "x16oeupf",
                kB1Fuz: "xdaarc3",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x16oeupf",
                  {
                    "ltr": ".x16oeupf::before{color:red}",
                    "rtl": null,
                  },
                  8000,
                ],
                [
                  "xdaarc3",
                  {
                    "ltr": ".xdaarc3::after{color:blue}",
                    "rtl": null,
                  },
                  8000,
                ],
              ],
            }
          `);
        });

        test('"::placeholder"', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: {
                k8Qsv1: "x6yu8oj",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x6yu8oj",
                  {
                    "ltr": ".x6yu8oj::placeholder{color:gray}",
                    "rtl": null,
                  },
                  8000,
                ],
              ],
            }
          `);
        });

        test('"::thumb"', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: {
                k8pbKx: "x1en94km",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1en94km",
                  {
                    "ltr": ".x1en94km::-webkit-slider-thumb, .x1en94km::-moz-range-thumb, .x1en94km::-ms-thumb{width:16px}",
                    "rtl": null,
                  },
                  9000,
                ],
              ],
            }
          `);
        });

        test('"::before" containing pseudo-classes', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: {
                kxBb7d: "x16oeupf xeb2lg0",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x16oeupf",
                  {
                    "ltr": ".x16oeupf::before{color:red}",
                    "rtl": null,
                  },
                  8000,
                ],
                [
                  "xeb2lg0",
                  {
                    "ltr": ".xeb2lg0::before:hover{color:blue}",
                    "rtl": null,
                  },
                  8130,
                ],
              ],
            }
          `);
        });
      });

      describe('object values: queries', () => {
        test('media queries with last query wins', () => {
          const { code, metadata } = transform(
            `
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: {
                backgroundColor: {
                  default: 'red',
                  '@media (max-width: 900px)': 'blue',
                  '@media (max-width: 500px)': 'purple',
                  '@media (max-width: 400px)': 'green',
                }
              },
            });
          `,
            { enableMediaQueryOrder: true },
          );
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kWkggS: "xrkmrrc xdm03ys xb3e2qq x856a2w",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xrkmrrc",
                  {
                    "ltr": ".xrkmrrc{background-color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xdm03ys",
                  {
                    "ltr": "@media (min-width: 500.01px) and (max-width: 900px){.xdm03ys.xdm03ys{background-color:blue}}",
                    "rtl": null,
                  },
                  3200,
                ],
                [
                  "xb3e2qq",
                  {
                    "ltr": "@media (min-width: 400.01px) and (max-width: 500px){.xb3e2qq.xb3e2qq{background-color:purple}}",
                    "rtl": null,
                  },
                  3200,
                ],
                [
                  "x856a2w",
                  {
                    "ltr": "@media (max-width: 400px){.x856a2w.x856a2w{background-color:green}}",
                    "rtl": null,
                  },
                  3200,
                ],
              ],
            }
          `);
        });

        test('media queries', () => {
          const { code, metadata } = transform(
            `
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
          `,
          );
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kWkggS: "xrkmrrc xc445zv x1ssfqz5",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xrkmrrc",
                  {
                    "ltr": ".xrkmrrc{background-color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xc445zv",
                  {
                    "ltr": "@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}",
                    "rtl": null,
                  },
                  3200,
                ],
                [
                  "x1ssfqz5",
                  {
                    "ltr": "@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}",
                    "rtl": null,
                  },
                  3200,
                ],
              ],
            }
          `);
        });

        test('supports queries', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kWkggS: "xrkmrrc x6m3b6q x6um648",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xrkmrrc",
                  {
                    "ltr": ".xrkmrrc{background-color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x6m3b6q",
                  {
                    "ltr": "@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}",
                    "rtl": null,
                  },
                  3030,
                ],
                [
                  "x6um648",
                  {
                    "ltr": "@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}",
                    "rtl": null,
                  },
                  3030,
                ],
              ],
            }
          `);
        });

        test('media query with pseudo-classes', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: {
                kGuDYH: "x1jchvi3 x1w3nbkt xicay7j",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1jchvi3",
                  {
                    "ltr": ".x1jchvi3{font-size:1rem}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1w3nbkt",
                  {
                    "ltr": "@media (min-width: 800px){.x1w3nbkt.x1w3nbkt{font-size:2rem}}",
                    "rtl": null,
                  },
                  3200,
                ],
                [
                  "xicay7j",
                  {
                    "ltr": "@media (min-width: 800px){.xicay7j.xicay7j:hover{font-size:2.2rem}}",
                    "rtl": null,
                  },
                  3330,
                ],
              ],
            }
          `);
        });

        test('media query with array fallbacks', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              default: {
                kVAEAm: "xixxii4 x1vazst0",
                $$css: true
              }
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xixxii4",
                  {
                    "ltr": ".xixxii4{position:fixed}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1vazst0",
                  {
                    "ltr": "@media (min-width: 768px){.x1vazst0.x1vazst0{position:sticky;position:fixed}}",
                    "rtl": null,
                  },
                  3200,
                ],
              ],
            }
          `);
        });
      });
    });

    describe('dynamic styles', () => {
      describe('safe conditional checks', () => {
        test('template literal expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: \`\${color}\`,
                color: \`\${color}px\`,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--backgroundColor": \`\${color}\` != null ? \`\${color}\` : undefined,
                "--color": \`\${color}px\` != null ? \`\${color}px\` : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('binary expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width, height) => ({
                width: width + 100,
                height: height * 2,
                margin: width - 50,
                padding: height / 2,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (width, height) => [{
                kzqmXN: "x1bl4301",
                kZKoxP: "x1f5funs",
                kogj98: "x1cpkpif",
                kmVPX3: "x6rcfto",
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width + 100),
                "--height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(height * 2),
                "--margin": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width - 50),
                "--padding": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(height / 2)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1f5funs",
                  {
                    "ltr": ".x1f5funs{height:var(--height)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1cpkpif",
                  {
                    "ltr": ".x1cpkpif{margin:var(--margin)}",
                    "rtl": null,
                  },
                  1000,
                ],
                [
                  "x6rcfto",
                  {
                    "ltr": ".x6rcfto{padding:var(--padding)}",
                    "rtl": null,
                  },
                  1000,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--height",
                  {
                    "ltr": "@property --height { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--margin",
                  {
                    "ltr": "@property --margin { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--padding",
                  {
                    "ltr": "@property --padding { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('unary expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (value) => ({
                opacity: -value,
                transform: +value,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: value => [{
                kSiTet: "xa0d40w",
                k3aq6I: "x1uosm7l",
                $$css: true
              }, {
                "--opacity": -value != null ? -value : undefined,
                "--transform": +value != null ? +value : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xa0d40w",
                  {
                    "ltr": ".xa0d40w{opacity:var(--opacity)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1uosm7l",
                  {
                    "ltr": ".x1uosm7l{transform:var(--transform)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--opacity",
                  {
                    "ltr": "@property --opacity { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--transform",
                  {
                    "ltr": "@property --transform { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('logical expressions with safe left side', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: color || 'red',
                color: color || 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--backgroundColor": (color || 'red') != null ? color || 'red' : undefined,
                "--color": (color || 'black') != null ? color || 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('logical expressions with safe right side', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: 'red' || color,
                color: 'black' || color,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xrkmrrc",
                kMwMTN: "x1mqxbix",
                $$css: true
              }, {}]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xrkmrrc",
                  {
                    "ltr": ".xrkmrrc{background-color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1mqxbix",
                  {
                    "ltr": ".x1mqxbix{color:black}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('nullish coalescing with safe left side', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: color ?? 'red',
                color: color ?? 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--backgroundColor": (color ?? 'red') != null ? color ?? 'red' : undefined,
                "--color": (color ?? 'black') != null ? color ?? 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('conditional expressions with safe branches', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color, isDark) => ({
                backgroundColor: isDark ? 'black' : 'white',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (color, isDark) => [{
                kWkggS: "xr5ldyu",
                $$css: true
              }, {
                "--backgroundColor": (isDark ? 'black' : 'white') != null ? isDark ? 'black' : 'white' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('conditional expressions with safe branches', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color, isDark) => ({
                backgroundColor: isDark ? ('black') : 'white',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (color, isDark) => [{
                kWkggS: "xr5ldyu",
                $$css: true
              }, {
                "--backgroundColor": (isDark ? 'black' : 'white') != null ? isDark ? 'black' : 'white' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('complex nested safe expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width, height, color) => ({
                width: (width + 100) || 200,
                height: (height * 2) ?? 300,
                backgroundColor: \`\${color}\` || 'red',
                color: (-color) || 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (width, height, color) => [{
                kzqmXN: "x1bl4301",
                kZKoxP: "x1f5funs",
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width + 100 || 200),
                "--height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(height * 2 ?? 300),
                "--backgroundColor": (\`\${color}\` || 'red') != null ? \`\${color}\` || 'red' : undefined,
                "--color": (-color || 'black') != null ? -color || 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1f5funs",
                  {
                    "ltr": ".x1f5funs{height:var(--height)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--height",
                  {
                    "ltr": "@property --height { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('complex safe ternary expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (isDark, isLarge, isActive, width, height, color) => ({
                backgroundColor: isDark ? (isLarge ? 'black' : 'gray') : (isActive ? 'blue' : 'white'),
                color: isDark ? (color || 'white') : (color ?? 'black'),
                width: isLarge ? (width + 100) : (width - 50),
                height: isActive ? (height * 2) : (height / 2),
                margin: isDark ? ((width + height) || 20) : ((width - height) ?? 10),
                padding: isLarge ? ((width * height) + 50) : ((width / height) - 25),
                fontSize: isDark ? (isLarge ? (width + 20) : (width - 10)) : (isActive ? (height + 15) : (height - 5)),
                opacity: isLarge ? (isActive ? 1 : 0.8) : (isDark ? 0.9 : 0.7),
                transform: isActive ? (isLarge ? 'scale(1.2)' : 'scale(1.1)') : (isDark ? 'rotate(5deg)' : 'rotate(-5deg)'),
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (isDark, isLarge, isActive, width, height, color) => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                kzqmXN: "x1bl4301",
                kZKoxP: "x1f5funs",
                kogj98: "x1cpkpif",
                kmVPX3: "x6rcfto",
                kGuDYH: "x6zurak",
                kSiTet: "xa0d40w",
                k3aq6I: "x1uosm7l",
                $$css: true
              }, {
                "--backgroundColor": (isDark ? isLarge ? 'black' : 'gray' : isActive ? 'blue' : 'white') != null ? isDark ? isLarge ? 'black' : 'gray' : isActive ? 'blue' : 'white' : undefined,
                "--color": (isDark ? color || 'white' : color ?? 'black') != null ? isDark ? color || 'white' : color ?? 'black' : undefined,
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(isLarge ? width + 100 : width - 50),
                "--height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(isActive ? height * 2 : height / 2),
                "--margin": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(isDark ? width + height || 20 : width - height ?? 10),
                "--padding": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(isLarge ? width * height + 50 : width / height - 25),
                "--fontSize": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(isDark ? isLarge ? width + 20 : width - 10 : isActive ? height + 15 : height - 5),
                "--opacity": (isLarge ? isActive ? 1 : 0.8 : isDark ? 0.9 : 0.7) != null ? isLarge ? isActive ? 1 : 0.8 : isDark ? 0.9 : 0.7 : undefined,
                "--transform": (isActive ? isLarge ? 'scale(1.2)' : 'scale(1.1)' : isDark ? 'rotate(5deg)' : 'rotate(-5deg)') != null ? isActive ? isLarge ? 'scale(1.2)' : 'scale(1.1)' : isDark ? 'rotate(5deg)' : 'rotate(-5deg)' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1f5funs",
                  {
                    "ltr": ".x1f5funs{height:var(--height)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1cpkpif",
                  {
                    "ltr": ".x1cpkpif{margin:var(--margin)}",
                    "rtl": null,
                  },
                  1000,
                ],
                [
                  "x6rcfto",
                  {
                    "ltr": ".x6rcfto{padding:var(--padding)}",
                    "rtl": null,
                  },
                  1000,
                ],
                [
                  "x6zurak",
                  {
                    "ltr": ".x6zurak{font-size:var(--fontSize)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xa0d40w",
                  {
                    "ltr": ".xa0d40w{opacity:var(--opacity)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1uosm7l",
                  {
                    "ltr": ".x1uosm7l{transform:var(--transform)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--height",
                  {
                    "ltr": "@property --height { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--margin",
                  {
                    "ltr": "@property --margin { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--padding",
                  {
                    "ltr": "@property --padding { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--fontSize",
                  {
                    "ltr": "@property --fontSize { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--opacity",
                  {
                    "ltr": "@property --opacity { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--transform",
                  {
                    "ltr": "@property --transform { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });
      });

      test('style function', () => {
        const { code, metadata } = transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            root: (color) => ({
              backgroundColor: 'red',
              color,
            })
          });
        `);
        expect(code).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            root: color => [{
              kWkggS: "xrkmrrc",
              kMwMTN: color != null ? "xfx01vb" : color,
              $$css: true
            }, {
              "--color": color != null ? color : undefined
            }]
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xrkmrrc",
                {
                  "ltr": ".xrkmrrc{background-color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "xfx01vb",
                {
                  "ltr": ".xfx01vb{color:var(--color)}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "--color",
                {
                  "ltr": "@property --color { syntax: "*"; inherits: false;}",
                  "rtl": null,
                },
                0,
              ],
            ],
          }
        `);
      });

      test('style function and object', () => {
        const { code, metadata } = transform(`
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
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            one: color => [{
              kMwMTN: color != null ? "xfx01vb" : color,
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "xfx01vb",
                {
                  "ltr": ".xfx01vb{color:var(--color)}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "x1mqxbix",
                {
                  "ltr": ".x1mqxbix{color:black}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "--color",
                {
                  "ltr": "@property --color { syntax: "*"; inherits: false;}",
                  "rtl": null,
                },
                0,
              ],
            ],
          }
        `);
      });

      test('style function with custom properties', () => {
        const { code, metadata } = transform(`
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
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            root: (bgColor, otherColor) => [{
              "--background-color": bgColor != null ? "x15mgraa" : bgColor,
              "--otherColor": otherColor != null ? "x1qph05k" : otherColor,
              $$css: true
            }, {
              "----background-color": bgColor != null ? bgColor : undefined,
              "----otherColor": otherColor != null ? otherColor : undefined
            }]
          };"
        `);
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "x15mgraa",
                {
                  "ltr": ".x15mgraa{--background-color:var(----background-color)}",
                  "rtl": null,
                },
                1,
              ],
              [
                "x1qph05k",
                {
                  "ltr": ".x1qph05k{--otherColor:var(----otherColor)}",
                  "rtl": null,
                },
                1,
              ],
              [
                "----background-color",
                {
                  "ltr": "@property ----background-color { syntax: "*"; inherits: false;}",
                  "rtl": null,
                },
                0,
              ],
              [
                "----otherColor",
                {
                  "ltr": "@property ----otherColor { syntax: "*"; inherits: false;}",
                  "rtl": null,
                },
                0,
              ],
            ],
          }
        `);
      });

      describe('simple values', () => {
        test('set number unit', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width) => ({
                width,
              })
            });
          `);
          // Check that dynamic number values get units where appropriate
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: width => [{
                kzqmXN: width != null ? "x1bl4301" : width,
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('set mixed values', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width) => ({
                width,
                backgroundColor: 'red',
                height: width + 100,
              })
            });
          `);
          // Check that dynamic number values get units where appropriate
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: width => [{
                kzqmXN: width != null ? "x1bl4301" : width,
                kWkggS: "xrkmrrc",
                kZKoxP: "x1f5funs",
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width),
                "--height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width + 100)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "xrkmrrc",
                  {
                    "ltr": ".xrkmrrc{background-color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1f5funs",
                  {
                    "ltr": ".x1f5funs{height:var(--height)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--height",
                  {
                    "ltr": "@property --height { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('set custom property', () => {
          const options = {
            filename: 'MyComponent.js',
            unstable_moduleResolution: { type: 'haste' },
          };
          const { code, metadata } = transform(
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
            "import * as stylex from '@stylexjs/stylex';
            import { vars } from 'vars.stylex.js';
            export const styles = {
              root: width => [{
                "--x1anmu0j": width != null ? "x14vhreu" : width,
                $$css: true
              }, {
                "----x1anmu0j": width != null ? width : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x14vhreu",
                  {
                    "ltr": ".x14vhreu{--x1anmu0j:var(----x1anmu0j)}",
                    "rtl": null,
                  },
                  1,
                ],
                [
                  "----x1anmu0j",
                  {
                    "ltr": "@property ----x1anmu0j { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });
      });

      describe('safe conditional checks', () => {
        test('template literal expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: \`\${color}\`,
                color: \`\${color}px\`,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--backgroundColor": \`\${color}\` != null ? \`\${color}\` : undefined,
                "--color": \`\${color}px\` != null ? \`\${color}px\` : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('binary expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width, height) => ({
                width: width + 100,
                height: height * 2,
                margin: width - 50,
                padding: height / 2,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (width, height) => [{
                kzqmXN: "x1bl4301",
                kZKoxP: "x1f5funs",
                kogj98: "x1cpkpif",
                kmVPX3: "x6rcfto",
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width + 100),
                "--height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(height * 2),
                "--margin": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width - 50),
                "--padding": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(height / 2)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1f5funs",
                  {
                    "ltr": ".x1f5funs{height:var(--height)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1cpkpif",
                  {
                    "ltr": ".x1cpkpif{margin:var(--margin)}",
                    "rtl": null,
                  },
                  1000,
                ],
                [
                  "x6rcfto",
                  {
                    "ltr": ".x6rcfto{padding:var(--padding)}",
                    "rtl": null,
                  },
                  1000,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--height",
                  {
                    "ltr": "@property --height { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--margin",
                  {
                    "ltr": "@property --margin { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--padding",
                  {
                    "ltr": "@property --padding { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('unary expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (value) => ({
                opacity: -value,
                transform: +value,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: value => [{
                kSiTet: "xa0d40w",
                k3aq6I: "x1uosm7l",
                $$css: true
              }, {
                "--opacity": -value != null ? -value : undefined,
                "--transform": +value != null ? +value : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xa0d40w",
                  {
                    "ltr": ".xa0d40w{opacity:var(--opacity)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1uosm7l",
                  {
                    "ltr": ".x1uosm7l{transform:var(--transform)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--opacity",
                  {
                    "ltr": "@property --opacity { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--transform",
                  {
                    "ltr": "@property --transform { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('logical expressions with safe left side', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: color || 'red',
                color: color || 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--backgroundColor": (color || 'red') != null ? color || 'red' : undefined,
                "--color": (color || 'black') != null ? color || 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('logical expressions with safe right side', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: 'red' || color,
                color: 'black' || color,
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xrkmrrc",
                kMwMTN: "x1mqxbix",
                $$css: true
              }, {}]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xrkmrrc",
                  {
                    "ltr": ".xrkmrrc{background-color:red}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1mqxbix",
                  {
                    "ltr": ".x1mqxbix{color:black}",
                    "rtl": null,
                  },
                  3000,
                ],
              ],
            }
          `);
        });

        test('nullish coalescing with safe left side', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color) => ({
                backgroundColor: color ?? 'red',
                color: color ?? 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--backgroundColor": (color ?? 'red') != null ? color ?? 'red' : undefined,
                "--color": (color ?? 'black') != null ? color ?? 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('conditional expressions with safe branches', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (color, isDark) => ({
                backgroundColor: isDark ? 'black' : 'white',
                color: isDark ? color : 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (color, isDark) => [{
                kWkggS: "xr5ldyu",
                kMwMTN: (isDark ? color : 'black') != null ? "xfx01vb" : isDark ? color : 'black',
                $$css: true
              }, {
                "--backgroundColor": (isDark ? 'black' : 'white') != null ? isDark ? 'black' : 'white' : undefined,
                "--color": (isDark ? color : 'black') != null ? isDark ? color : 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('complex nested safe expressions', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (width, height, color) => ({
                width: (width + 100) || 200,
                height: (height * 2) ?? 300,
                backgroundColor: \`\${color}\` || 'red',
                color: (-color) || 'black',
              })
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (width, height, color) => [{
                kzqmXN: "x1bl4301",
                kZKoxP: "x1f5funs",
                kWkggS: "xr5ldyu",
                kMwMTN: "xfx01vb",
                $$css: true
              }, {
                "--width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width + 100 || 200),
                "--height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(height * 2 ?? 300),
                "--backgroundColor": (\`\${color}\` || 'red') != null ? \`\${color}\` || 'red' : undefined,
                "--color": (-color || 'black') != null ? -color || 'black' : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1bl4301",
                  {
                    "ltr": ".x1bl4301{width:var(--width)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1f5funs",
                  {
                    "ltr": ".x1f5funs{height:var(--height)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "xr5ldyu",
                  {
                    "ltr": ".xr5ldyu{background-color:var(--backgroundColor)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "xfx01vb",
                  {
                    "ltr": ".xfx01vb{color:var(--color)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "--width",
                  {
                    "ltr": "@property --width { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--height",
                  {
                    "ltr": "@property --height { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--backgroundColor",
                  {
                    "ltr": "@property --backgroundColor { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--color",
                  {
                    "ltr": "@property --color { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });
      });

      describe('object values: pseudo-classes', () => {
        test('valid pseudo-class', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: color => [{
                kWkggS: color != null ? "x1ttfofm" : color,
                kMwMTN: color != null ? "x74ai9j" : color,
                $$css: true
              }, {
                "--1e2mv7m": color != null ? color : undefined,
                "--1113oo7": color != null ? color : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1ttfofm",
                  {
                    "ltr": ".x1ttfofm:hover{background-color:var(--1e2mv7m)}",
                    "rtl": null,
                  },
                  3130,
                ],
                [
                  "x74ai9j",
                  {
                    "ltr": ".x74ai9j:hover{color:var(--1113oo7)}",
                    "rtl": null,
                  },
                  3130,
                ],
                [
                  "--1e2mv7m",
                  {
                    "ltr": "@property --1e2mv7m { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--1113oo7",
                  {
                    "ltr": "@property --1113oo7 { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('pseudo-class generated order', () => {
          const { code, metadata } = transform(`
            import * as stylex from '@stylexjs/stylex';
            export const styles = stylex.create({
              root: (hover, active, focus) => ({
                color: {
                  ':hover': hover,
                  ':active': active,
                  ':focus': focus,
                  ':nth-child(2n)': 'purple',
                },
              }),
            });
          `);
          expect(code).toMatchInlineSnapshot(`
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (hover, active, focus) => [{
                kMwMTN: (hover != null ? "x74ai9j" : hover) + (active != null ? "x19c4yy1" : active) + (focus != null ? "x10peeyq" : focus) + "x126ychx",
                $$css: true
              }, {
                "--1113oo7": hover != null ? hover : undefined,
                "--hxnnmm": active != null ? active : undefined,
                "--8tbbve": focus != null ? focus : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x74ai9j",
                  {
                    "ltr": ".x74ai9j:hover{color:var(--1113oo7)}",
                    "rtl": null,
                  },
                  3130,
                ],
                [
                  "x19c4yy1",
                  {
                    "ltr": ".x19c4yy1:active{color:var(--hxnnmm)}",
                    "rtl": null,
                  },
                  3170,
                ],
                [
                  "x10peeyq",
                  {
                    "ltr": ".x10peeyq:focus{color:var(--8tbbve)}",
                    "rtl": null,
                  },
                  3150,
                ],
                [
                  "x126ychx",
                  {
                    "ltr": ".x126ychx:nth-child(2n){color:purple}",
                    "rtl": null,
                  },
                  3060,
                ],
                [
                  "--1113oo7",
                  {
                    "ltr": "@property --1113oo7 { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--hxnnmm",
                  {
                    "ltr": "@property --hxnnmm { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--8tbbve",
                  {
                    "ltr": "@property --8tbbve { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });
      });

      describe('object values: pseudo-elements', () => {
        test('"::before" and "::after"', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: (a, b) => [{
                kxBb7d: a != null ? "x6r7ojb" : a,
                kB1Fuz: b != null ? "x5ga601" : b,
                $$css: true
              }, {
                "--1g451k2": a != null ? a : undefined,
                "--19erzii": b != null ? b : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x6r7ojb",
                  {
                    "ltr": ".x6r7ojb::before{color:var(--1g451k2)}",
                    "rtl": null,
                  },
                  8000,
                ],
                [
                  "x5ga601",
                  {
                    "ltr": ".x5ga601::after{color:var(--19erzii)}",
                    "rtl": null,
                  },
                  8000,
                ],
                [
                  "--1g451k2",
                  {
                    "ltr": "@property --1g451k2 { syntax: "*";}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--19erzii",
                  {
                    "ltr": "@property --19erzii { syntax: "*";}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('"::placeholder"', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: color => [{
                k8Qsv1: color != null ? "xwdnmik" : color,
                $$css: true
              }, {
                "--163tekb": color != null ? color : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "xwdnmik",
                  {
                    "ltr": ".xwdnmik::placeholder{color:var(--163tekb)}",
                    "rtl": null,
                  },
                  8000,
                ],
                [
                  "--163tekb",
                  {
                    "ltr": "@property --163tekb { syntax: "*";}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('"::thumb"', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: width => [{
                k8pbKx: width != null ? "x3j4sww" : width,
                $$css: true
              }, {
                "--msahdu": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x3j4sww",
                  {
                    "ltr": ".x3j4sww::-webkit-slider-thumb, .x3j4sww::-moz-range-thumb, .x3j4sww::-ms-thumb{width:var(--msahdu)}",
                    "rtl": null,
                  },
                  9000,
                ],
                [
                  "--msahdu",
                  {
                    "ltr": "@property --msahdu { syntax: "*";}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('"::before" containing pseudo-classes', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              foo: color => [{
                kxBb7d: "x16oeupf" + "x10u3axo",
                $$css: true
              }, {
                "--6bge3v": color != null ? color : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x16oeupf",
                  {
                    "ltr": ".x16oeupf::before{color:red}",
                    "rtl": null,
                  },
                  8000,
                ],
                [
                  "x10u3axo",
                  {
                    "ltr": ".x10u3axo::before:hover{color:var(--6bge3v)}",
                    "rtl": null,
                  },
                  8130,
                ],
                [
                  "--6bge3v",
                  {
                    "ltr": "@property --6bge3v { syntax: "*";}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });
      });

      describe('object values: queries', () => {
        test('media queries', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (a, b, c) => [{
                kzqmXN: "x1svif2g" + (b != null ? "x1a6pj3q" : b) + (c != null ? "xf0apgt" : c),
                $$css: true
              }, {
                "--1xmrurk": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)('color-mix(' + color + ', blue)'),
                "--wm47pl": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(b),
                "--1obb2yn": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(c)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1svif2g",
                  {
                    "ltr": ".x1svif2g{width:var(--1xmrurk)}",
                    "rtl": null,
                  },
                  4000,
                ],
                [
                  "x1a6pj3q",
                  {
                    "ltr": "@media (min-width: 1000px){.x1a6pj3q.x1a6pj3q{width:var(--wm47pl)}}",
                    "rtl": null,
                  },
                  4200,
                ],
                [
                  "xf0apgt",
                  {
                    "ltr": "@media (min-width: 2000px){.xf0apgt.xf0apgt{width:var(--1obb2yn)}}",
                    "rtl": null,
                  },
                  4200,
                ],
                [
                  "--1xmrurk",
                  {
                    "ltr": "@property --1xmrurk { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--wm47pl",
                  {
                    "ltr": "@property --wm47pl { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--1obb2yn",
                  {
                    "ltr": "@property --1obb2yn { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('supports queries', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (a, b, c) => [{
                kMwMTN: (a != null ? "x1n25116" : a) + (b != null ? "x1oeo35w" : b) + (c != null ? "x10db8fb" : c),
                $$css: true
              }, {
                "--4xs81a": a != null ? a : undefined,
                "--b262sw": b != null ? b : undefined,
                "--wu2acw": c != null ? c : undefined
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1n25116",
                  {
                    "ltr": ".x1n25116{color:var(--4xs81a)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x1oeo35w",
                  {
                    "ltr": "@supports (hover: hover){.x1oeo35w.x1oeo35w{color:var(--b262sw)}}",
                    "rtl": null,
                  },
                  3030,
                ],
                [
                  "x10db8fb",
                  {
                    "ltr": "@supports not (hover: hover){.x10db8fb.x10db8fb{color:var(--wu2acw)}}",
                    "rtl": null,
                  },
                  3030,
                ],
                [
                  "--4xs81a",
                  {
                    "ltr": "@property --4xs81a { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--b262sw",
                  {
                    "ltr": "@property --b262sw { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--wu2acw",
                  {
                    "ltr": "@property --wu2acw { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
          `);
        });

        test('media query with pseudo-classes', () => {
          const { code, metadata } = transform(`
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
            "import * as stylex from '@stylexjs/stylex';
            export const styles = {
              root: (a, b, c) => [{
                kGuDYH: (a != null ? "x1cfcgx7" : a) + (b != null ? "x956mei" : b) + (c != null ? "xarp7f8" : c),
                $$css: true
              }, {
                "--19zvkyr": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(a),
                "--1xajcet": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(b),
                "--ke45ok": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(c)
              }]
            };"
          `);
          expect(metadata).toMatchInlineSnapshot(`
            {
              "stylex": [
                [
                  "x1cfcgx7",
                  {
                    "ltr": ".x1cfcgx7{font-size:var(--19zvkyr)}",
                    "rtl": null,
                  },
                  3000,
                ],
                [
                  "x956mei",
                  {
                    "ltr": "@media (min-width: 800px){.x956mei.x956mei{font-size:var(--1xajcet)}}",
                    "rtl": null,
                  },
                  3200,
                ],
                [
                  "xarp7f8",
                  {
                    "ltr": "@media (min-width: 800px){.xarp7f8.xarp7f8:hover{font-size:var(--ke45ok)}}",
                    "rtl": null,
                  },
                  3330,
                ],
                [
                  "--19zvkyr",
                  {
                    "ltr": "@property --19zvkyr { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--1xajcet",
                  {
                    "ltr": "@property --1xajcet { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
                [
                  "--ke45ok",
                  {
                    "ltr": "@property --ke45ok { syntax: "*"; inherits: false;}",
                    "rtl": null,
                  },
                  0,
                ],
              ],
            }
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
        const { code, metadata } = transform(
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
          "import * as stylex from '@stylexjs/stylex';
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "fontSize-xrv4cvt",
                {
                  "ltr": ".fontSize-xrv4cvt{font-size:1em}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "color-x1e2nbdu",
                {
                  "ltr": ".color-x1e2nbdu{color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "display-x1lliihq",
                {
                  "ltr": ".display-x1lliihq{display:block}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      test('adds debug data for npm packages', () => {
        const options = {
          debug: true,
          filename: '/js/node_modules/npm-package/dist/components/Foo.react.js',
        };
        const { code, metadata } = transform(
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
          "import * as stylex from '@stylexjs/stylex';
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "fontSize-xrv4cvt",
                {
                  "ltr": ".fontSize-xrv4cvt{font-size:1em}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "color-x1e2nbdu",
                {
                  "ltr": ".color-x1e2nbdu{color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "display-x1lliihq",
                {
                  "ltr": ".display-x1lliihq{display:block}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      test('adds debug data (haste)', () => {
        const options = {
          debug: true,
          filename: '/html/js/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };
        const { code, metadata } = transform(
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
          "import * as stylex from '@stylexjs/stylex';
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "fontSize-xrv4cvt",
                {
                  "ltr": ".fontSize-xrv4cvt{font-size:1em}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "color-x1e2nbdu",
                {
                  "ltr": ".color-x1e2nbdu{color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "display-x1lliihq",
                {
                  "ltr": ".display-x1lliihq{display:block}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });

      test('adds debug data for npm packages (haste)', () => {
        const options = {
          debug: true,
          filename: '/node_modules/npm-package/dist/components/Foo.react.js',
          unstable_moduleResolution: { type: 'haste' },
        };
        const { code, metadata } = transform(
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
          "import * as stylex from '@stylexjs/stylex';
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
        expect(metadata).toMatchInlineSnapshot(`
          {
            "stylex": [
              [
                "fontSize-xrv4cvt",
                {
                  "ltr": ".fontSize-xrv4cvt{font-size:1em}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "color-x1e2nbdu",
                {
                  "ltr": ".color-x1e2nbdu{color:red}",
                  "rtl": null,
                },
                3000,
              ],
              [
                "display-x1lliihq",
                {
                  "ltr": ".display-x1lliihq{display:block}",
                  "rtl": null,
                },
                3000,
              ],
            ],
          }
        `);
      });
    });

    // LEGACY (TODO: Remove)
    describe('legacy / deprecated', () => {
      const options = {
        runtimeInjection: true,
      };

      test('transforms nested pseudo-class to CSS', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                ':hover': {
                  backgroundColor: 'red',
                  color: 'blue',
                },
              },
            });
          `,
            options,
          ).code,
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
            transform(
              `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  ':invalpwdijad': {
                    backgroundColor: 'red',
                    color: 'blue',
                  },
                },
              });
            `,
              options,
            ).code,
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
            transform(
              `
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
            `,
              options,
            ).code,
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
            transform(
              `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  ':hover': {
                    position: ['sticky', 'fixed'],
                  }
                },
              });
            `,
              options,
            ).code,
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
          transform(
            `
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
          `,
            options,
          ).code,
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
          transform(
            `
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
          `,
            options,
          ).code,
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
          transform(
            `
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
          `,
            options,
          ).code,
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
          transform(
            `
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
          `,
            options,
          ).code,
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
          transform(
            `
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
          `,
            options,
          ).code,
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
            {
              runtimeInjection: true,
              styleResolution: 'legacy-expand-shorthands',
            },
          ).code,
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".x1555q52{margin-inline-end:var(--14mfytm)}", 3000);
          _inject2(".x1bi16m7:hover{margin-inline-end:var(--yepcm9)}", 3130);
          _inject2(".x1hvr6ea{margin-bottom:var(--14mfytm)}", 4000);
          _inject2(".x3skgmg:hover{margin-bottom:var(--yepcm9)}", 4130);
          _inject2(".x1feukp3{margin-inline-start:var(--14mfytm)}", 3000);
          _inject2(".xgzim5p:hover{margin-inline-start:var(--yepcm9)}", 3130);
          _inject2(".x17zef60{margin-top:var(--marginTop)}", 4000);
          _inject2("@property --14mfytm { syntax: \\"*\\"; inherits: false;}", 0);
          _inject2("@property --yepcm9 { syntax: \\"*\\"; inherits: false;}", 0);
          _inject2("@property --marginTop { syntax: \\"*\\"; inherits: false;}", 0);
          export const styles = {
            default: margin => [{
              kWkggS: "xrkmrrc",
              k71WvV: (margin != null ? "x1555q52" : margin) + "x1bi16m7",
              k1K539: (margin != null ? "x1hvr6ea" : margin) + "x3skgmg",
              keTefX: (margin != null ? "x1feukp3" : margin) + "xgzim5p",
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
