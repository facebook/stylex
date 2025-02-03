/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import styleXCreate from '../src/stylex-create';
import { defaultOptions } from '../src/utils/default-options';

const options = { ...defaultOptions, debug: true };

describe('stylex-create-test', () => {
  test('color:red', () => {
    expect(
      styleXCreate(
        {
          default: {
            backgroundColor: 'red',
            color: 'blue',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
            "color-kMwMTN": "color-xju2f9n",
          },
        },
        {
          "backgroundColor-xrkmrrc": {
            "ltr": ".backgroundColor-xrkmrrc{background-color:red}",
            "priority": 3000,
            "rtl": null,
          },
          "color-xju2f9n": {
            "ltr": ".color-xju2f9n{color:blue}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "backgroundColor-xrkmrrc": [
              "backgroundColor",
            ],
            "color-xju2f9n": [
              "color",
            ],
          },
        },
      ]
    `);
  });

  test('transitionProperty:marginTop', () => {
    const camelCase = styleXCreate(
      {
        default: {
          transitionProperty: 'marginTop',
        },
      },
      options,
    );
    const dashCase = styleXCreate(
      {
        default: {
          transitionProperty: 'margin-top',
        },
      },
      options,
    );
    expect(camelCase).toEqual(dashCase);

    expect(camelCase).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "transitionProperty-k1ekBW": "transitionProperty-x1cfch2b",
          },
        },
        {
          "transitionProperty-x1cfch2b": {
            "ltr": ".transitionProperty-x1cfch2b{transition-property:margin-top}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "transitionProperty-x1cfch2b": [
              "transitionProperty",
            ],
          },
        },
      ]
    `);
  });

  test('willChange:marginTop', () => {
    const camelCase = styleXCreate(
      {
        default: {
          willChange: 'marginTop',
        },
      },
      options,
    );
    const dashCase = styleXCreate(
      {
        default: {
          willChange: 'margin-top',
        },
      },
      options,
    );
    expect(camelCase).toEqual(dashCase);

    expect(camelCase).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "willChange-k6sLGO": "willChange-x1a6dnx1",
          },
        },
        {
          "willChange-x1a6dnx1": {
            "ltr": ".willChange-x1a6dnx1{will-change:margin-top}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "willChange-x1a6dnx1": [
              "willChange",
            ],
          },
        },
      ]
    `);
  });

  test('transitionProperty:--foo', () => {
    expect(
      styleXCreate(
        {
          default: {
            transitionProperty: '--foo',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "transitionProperty-k1ekBW": "transitionProperty-x17389it",
          },
        },
        {
          "transitionProperty-x17389it": {
            "ltr": ".transitionProperty-x17389it{transition-property:--foo}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "transitionProperty-x17389it": [
              "transitionProperty",
            ],
          },
        },
      ]
    `);
  });

  test('willChange:--foo', () => {
    expect(
      styleXCreate(
        {
          default: {
            willChange: '--foo',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "willChange-k6sLGO": "willChange-x1lxaxzv",
          },
        },
        {
          "willChange-x1lxaxzv": {
            "ltr": ".willChange-x1lxaxzv{will-change:--foo}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "willChange-x1lxaxzv": [
              "willChange",
            ],
          },
        },
      ]
    `);
  });

  test('transitionProperty:opacity, marginTop', () => {
    const camelCase = styleXCreate(
      {
        default: {
          transitionProperty: 'opacity, marginTop',
        },
      },
      options,
    );
    const dashCase = styleXCreate(
      {
        default: {
          transitionProperty: 'opacity, margin-top',
        },
      },
      options,
    );
    expect(camelCase).toEqual(dashCase);

    expect(camelCase).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "transitionProperty-k1ekBW": "transitionProperty-x95ccmk",
          },
        },
        {
          "transitionProperty-x95ccmk": {
            "ltr": ".transitionProperty-x95ccmk{transition-property:opacity,margin-top}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "transitionProperty-x95ccmk": [
              "transitionProperty",
            ],
          },
        },
      ]
    `);
  });

  test('padding shorthand', () => {
    expect(
      styleXCreate(
        {
          short: {
            padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
            paddingTop: 0,
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "short": {
            "$$css": true,
            "padding-kmVPX3": "padding-x1lmef92",
            "paddingBlock-k8WAf4": null,
            "paddingBottom-kGO01o": null,
            "paddingEnd-kP0aTx": null,
            "paddingInline-kg3NbH": null,
            "paddingLeft-kE3dHu": null,
            "paddingRight-kpe85a": null,
            "paddingStart-kuDDbn": null,
            "paddingTop-kLKAdn": "paddingTop-xexx8yu",
          },
        },
        {
          "padding-x1lmef92": {
            "ltr": ".padding-x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}",
            "priority": 1000,
            "rtl": null,
          },
          "paddingTop-xexx8yu": {
            "ltr": ".paddingTop-xexx8yu{padding-top:0}",
            "priority": 4000,
            "rtl": null,
          },
        },
        {
          "short": {
            "padding-x1lmef92": [
              "padding",
            ],
            "paddingTop-xexx8yu": [
              "paddingTop",
            ],
          },
        },
      ]
    `);
  });

  test('transforms style object with custom property', () => {
    expect(
      styleXCreate(
        {
          default: {
            '--background-color': 'red',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "--background-color": "--background-color-xgau0yw",
          },
        },
        {
          "--background-color-xgau0yw": {
            "ltr": ".--background-color-xgau0yw{--background-color:red}",
            "priority": 1,
            "rtl": null,
          },
        },
        {
          "default": {
            "--background-color-xgau0yw": [
              "--background-color",
            ],
          },
        },
      ]
    `);
  });

  test('transforms style object with custom property as value', () => {
    expect(
      styleXCreate(
        {
          default: {
            '--final-color': 'var(--background-color)',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "--final-color": "--final-color-x13tgbkp",
          },
        },
        {
          "--final-color-x13tgbkp": {
            "ltr": ".--final-color-x13tgbkp{--final-color:var(--background-color)}",
            "priority": 1,
            "rtl": null,
          },
        },
        {
          "default": {
            "--final-color-x13tgbkp": [
              "--final-color",
            ],
          },
        },
      ]
    `);
  });

  test('transforms multiple namespaces', () => {
    expect(
      styleXCreate(
        {
          default: {
            backgroundColor: 'red',
          },

          default2: {
            color: 'blue',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
          },
          "default2": {
            "$$css": true,
            "color-kMwMTN": "color-xju2f9n",
          },
        },
        {
          "backgroundColor-xrkmrrc": {
            "ltr": ".backgroundColor-xrkmrrc{background-color:red}",
            "priority": 3000,
            "rtl": null,
          },
          "color-xju2f9n": {
            "ltr": ".color-xju2f9n{color:blue}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "backgroundColor-xrkmrrc": [
              "backgroundColor",
            ],
          },
          "default2": {
            "color-xju2f9n": [
              "color",
            ],
          },
        },
      ]
    `);
  });

  test('does not transform attr() value', () => {
    expect(
      styleXCreate(
        {
          default: {
            content: 'attr(some-attribute)',
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "content-kah6P1": "content-xd71okc",
          },
        },
        {
          "content-xd71okc": {
            "ltr": ".content-xd71okc{content:attr(some-attribute)}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "content-xd71okc": [
              "content",
            ],
          },
        },
      ]
    `);
  });

  test('does not add units to variable value', () => {
    expect(
      styleXCreate(
        {
          default: {
            '--foo': 500,
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "--foo": "--foo-xwzgxvi",
          },
        },
        {
          "--foo-xwzgxvi": {
            "ltr": ".--foo-xwzgxvi{--foo:500}",
            "priority": 1,
            "rtl": null,
          },
        },
        {
          "default": {
            "--foo-xwzgxvi": [
              "--foo",
            ],
          },
        },
      ]
    `);
  });

  test('transforms nested pseudo-class to CSS', () => {
    expect(
      styleXCreate(
        {
          default: {
            ':hover': {
              backgroundColor: 'red',
              color: 'blue',
            },
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            ":hover_backgroundColor-kGzVvX": "backgroundColor-x1gykpug",
            ":hover_color-kDPRdz": "color-x17z2mba",
          },
        },
        {
          "backgroundColor-x1gykpug": {
            "ltr": ".backgroundColor-x1gykpug:hover{background-color:red}",
            "priority": 3130,
            "rtl": null,
          },
          "color-x17z2mba": {
            "ltr": ".color-x17z2mba:hover{color:blue}",
            "priority": 3130,
            "rtl": null,
          },
        },
        {
          "default": {
            "backgroundColor-x1gykpug": [
              ":hover",
              "backgroundColor",
            ],
            "color-x17z2mba": [
              ":hover",
              "color",
            ],
          },
        },
      ]
    `);
  });

  test('transforms nested pseudo-classes within pseudo elements', () => {
    expect(
      styleXCreate(
        {
          default: {
            '::before': {
              color: {
                default: 'red',
                ':hover': 'blue',
              },
            },
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "::before_color-kxBb7d": "color-x16oeupf color-xeb2lg0",
          },
        },
        {
          "color-x16oeupf": {
            "ltr": ".color-x16oeupf::before{color:red}",
            "priority": 8000,
            "rtl": null,
          },
          "color-xeb2lg0": {
            "ltr": ".color-xeb2lg0::before:hover{color:blue}",
            "priority": 8130,
            "rtl": null,
          },
        },
        {
          "default": {
            "color-x16oeupf": [
              "::before",
              "default",
              "color",
            ],
            "color-xeb2lg0": [
              "::before",
              ":hover",
              "color",
            ],
          },
        },
      ]
    `);
  });

  test('transforms nested legacy pseudo-classes within pseudo elements', () => {
    expect(
      styleXCreate(
        {
          default: {
            '::before': {
              color: 'red',
              ':hover': {
                color: 'blue',
              },
            },
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "::before_:hover_color-kkC3X7": "color-xeb2lg0",
            "::before_color-kxBb7d": "color-x16oeupf",
          },
        },
        {
          "color-x16oeupf": {
            "ltr": ".color-x16oeupf::before{color:red}",
            "priority": 8000,
            "rtl": null,
          },
          "color-xeb2lg0": {
            "ltr": ".color-xeb2lg0::before:hover{color:blue}",
            "priority": 8130,
            "rtl": null,
          },
        },
        {
          "default": {
            "color-x16oeupf": [
              "::before",
              "color",
            ],
            "color-xeb2lg0": [
              "::before",
              ":hover",
              "color",
            ],
          },
        },
      ]
    `);
  });

  test('transforms nested pseudo-element within legacy pseudo class', () => {
    expect(
      styleXCreate(
        {
          default: {
            '::before': {
              color: 'red',
            },
            ':hover': {
              '::before': {
                color: {
                  default: 'blue',
                  ':hover': 'green',
                  ':active': 'yellow',
                },
              },
            },
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "::before_color-kxBb7d": "color-x16oeupf",
            ":hover_::before_color-kFlxxK": "color-xzzpreb color-x1gobd9t color-x1lvqgcc",
          },
        },
        {
          "color-x16oeupf": {
            "ltr": ".color-x16oeupf::before{color:red}",
            "priority": 8000,
            "rtl": null,
          },
          "color-x1gobd9t": {
            "ltr": ".color-x1gobd9t:hover::before:hover{color:green}",
            "priority": 8260,
            "rtl": null,
          },
          "color-x1lvqgcc": {
            "ltr": ".color-x1lvqgcc:hover::before:active{color:yellow}",
            "priority": 8300,
            "rtl": null,
          },
          "color-xzzpreb": {
            "ltr": ".color-xzzpreb:hover::before{color:blue}",
            "priority": 8130,
            "rtl": null,
          },
        },
        {
          "default": {
            "color-x16oeupf": [
              "::before",
              "color",
            ],
            "color-x1gobd9t": [
              ":hover",
              "::before",
              ":hover",
              "color",
            ],
            "color-x1lvqgcc": [
              ":hover",
              "::before",
              ":active",
              "color",
            ],
            "color-xzzpreb": [
              ":hover",
              "::before",
              "default",
              "color",
            ],
          },
        },
      ]
    `);
  });

  test('transforms nested pseudo-classes within pseudo elements', () => {
    const [beforeHover] = styleXCreate({
      default: {
        '::before': {
          color: {
            default: null,
            ':hover': 'blue',
          },
        },
      },
    });

    const [hoverBefore] = styleXCreate({
      default: {
        ':hover': {
          '::before': {
            color: 'blue',
          },
        },
      },
    });

    expect(beforeHover.default).toMatchInlineSnapshot(`
      {
        "$$css": true,
        "kxBb7d": "xeb2lg0",
      }
    `);
    expect(hoverBefore.default).toMatchInlineSnapshot(`
      {
        "$$css": true,
        "kFlxxK": "xzzpreb",
      }
    `);

    expect(beforeHover.default).not.toEqual(hoverBefore.default);
  });

  // This API will not launch as an array, but internally we can continue to use arrays
  test('transforms array values as fallbacks', () => {
    expect(
      styleXCreate(
        {
          default: {
            position: ['sticky', 'fixed'],
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "position-kVAEAm": "position-x1ruww2u",
          },
        },
        {
          "position-x1ruww2u": {
            "ltr": ".position-x1ruww2u{position:sticky;position:fixed}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "position-x1ruww2u": [
              "position",
            ],
          },
        },
      ]
    `);
  });

  test('transforms valid shorthands', () => {
    expect(
      styleXCreate(
        {
          default: {
            overflow: 'hidden',
            borderStyle: 'dashed',
            borderWidth: 1,
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "borderBlockStyle-kDUl1X": null,
            "borderBlockWidth-kLoX6v": null,
            "borderBottomStyle-kfdmCh": null,
            "borderBottomWidth-kt9PQ7": null,
            "borderInlineEndStyle-k8ry5P": null,
            "borderInlineEndWidth-ke9TFa": null,
            "borderInlineStartStyle-kVhnKS": null,
            "borderInlineStartWidth-k2ei4v": null,
            "borderInlineStyle-kJRH4f": null,
            "borderInlineWidth-kjGldf": null,
            "borderLeftStyle-k4WBpm": null,
            "borderLeftWidth-kZ1KPB": null,
            "borderRightStyle-kSWEuD": null,
            "borderRightWidth-kWqL5O": null,
            "borderStyle-ksu8eU": "borderStyle-xbsl7fq",
            "borderTopStyle-kPef9Z": null,
            "borderTopWidth-kEafiO": null,
            "borderWidth-kMzoRj": "borderWidth-xmkeg23",
            "overflow-kVQacm": "overflow-xb3r6kr",
            "overflowX-kXHlph": null,
            "overflowY-kORKVm": null,
          },
        },
        {
          "borderStyle-xbsl7fq": {
            "ltr": ".borderStyle-xbsl7fq{border-style:dashed}",
            "priority": 2000,
            "rtl": null,
          },
          "borderWidth-xmkeg23": {
            "ltr": ".borderWidth-xmkeg23{border-width:1px}",
            "priority": 2000,
            "rtl": null,
          },
          "overflow-xb3r6kr": {
            "ltr": ".overflow-xb3r6kr{overflow:hidden}",
            "priority": 2000,
            "rtl": null,
          },
        },
        {
          "default": {
            "borderStyle-xbsl7fq": [
              "borderStyle",
            ],
            "borderWidth-xmkeg23": [
              "borderWidth",
            ],
            "overflow-xb3r6kr": [
              "overflow",
            ],
          },
        },
      ]
    `);
  });

  test('transforms media queries', () => {
    expect(
      styleXCreate(
        {
          default: {
            backgroundColor: 'red',
            '@media (min-width: 1000px)': {
              backgroundColor: 'blue',
            },

            '@media (min-width: 2000px)': {
              backgroundColor: 'purple',
            },
          },
        },
        options,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "@media (min-width: 1000px)_backgroundColor-ksQ81T": "backgroundColor-xc445zv",
            "@media (min-width: 2000px)_backgroundColor-kkpvmn": "backgroundColor-x1ssfqz5",
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
          },
        },
        {
          "backgroundColor-x1ssfqz5": {
            "ltr": "@media (min-width: 2000px){.backgroundColor-x1ssfqz5.backgroundColor-x1ssfqz5{background-color:purple}}",
            "priority": 3200,
            "rtl": null,
          },
          "backgroundColor-xc445zv": {
            "ltr": "@media (min-width: 1000px){.backgroundColor-xc445zv.backgroundColor-xc445zv{background-color:blue}}",
            "priority": 3200,
            "rtl": null,
          },
          "backgroundColor-xrkmrrc": {
            "ltr": ".backgroundColor-xrkmrrc{background-color:red}",
            "priority": 3000,
            "rtl": null,
          },
        },
        {
          "default": {
            "backgroundColor-x1ssfqz5": [
              "@media (min-width: 2000px)",
              "backgroundColor",
            ],
            "backgroundColor-xc445zv": [
              "@media (min-width: 1000px)",
              "backgroundColor",
            ],
            "backgroundColor-xrkmrrc": [
              "backgroundColor",
            ],
          },
        },
      ]
    `);
  });
});
