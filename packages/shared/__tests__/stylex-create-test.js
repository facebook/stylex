/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import styleXCreate from '../src/stylex-create';

describe('stylex-create-test', () => {
  test('color:red', () => {
    expect(
      styleXCreate({
        default: {
          backgroundColor: 'red',
          color: 'blue',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
            "color": "xju2f9n",
          },
        },
        {
          "xju2f9n": {
            "ltr": ".xju2f9n{color:blue}",
            "priority": 3000,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transitionProperty:marginTop', () => {
    const camelCase = styleXCreate({
      default: {
        transitionProperty: 'marginTop',
      },
    });
    const dashCase = styleXCreate({
      default: {
        transitionProperty: 'margin-top',
      },
    });
    expect(camelCase).toEqual(dashCase);

    expect(camelCase).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "transitionProperty": "x1cfch2b",
          },
        },
        {
          "x1cfch2b": {
            "ltr": ".x1cfch2b{transition-property:margin-top}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('willChange:marginTop', () => {
    const camelCase = styleXCreate({
      default: {
        willChange: 'marginTop',
      },
    });
    const dashCase = styleXCreate({
      default: {
        willChange: 'margin-top',
      },
    });
    expect(camelCase).toEqual(dashCase);

    expect(camelCase).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "willChange": "x1a6dnx1",
          },
        },
        {
          "x1a6dnx1": {
            "ltr": ".x1a6dnx1{will-change:margin-top}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transitionProperty:--foo', () => {
    expect(
      styleXCreate({
        default: {
          transitionProperty: '--foo',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "transitionProperty": "x17389it",
          },
        },
        {
          "x17389it": {
            "ltr": ".x17389it{transition-property:--foo}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('willChange:--foo', () => {
    expect(
      styleXCreate({
        default: {
          willChange: '--foo',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "willChange": "x1lxaxzv",
          },
        },
        {
          "x1lxaxzv": {
            "ltr": ".x1lxaxzv{will-change:--foo}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transitionProperty:opacity, marginTop', () => {
    const camelCase = styleXCreate({
      default: {
        transitionProperty: 'opacity, marginTop',
      },
    });
    const dashCase = styleXCreate({
      default: {
        transitionProperty: 'opacity, margin-top',
      },
    });
    expect(camelCase).toEqual(dashCase);

    expect(camelCase).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "transitionProperty": "x95ccmk",
          },
        },
        {
          "x95ccmk": {
            "ltr": ".x95ccmk{transition-property:opacity,margin-top}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('padding shorthand', () => {
    expect(
      styleXCreate({
        short: {
          padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
          paddingTop: 0,
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "short": {
            "$$css": true,
            "padding": "x1lmef92",
            "paddingBottom": null,
            "paddingEnd": null,
            "paddingLeft": null,
            "paddingRight": null,
            "paddingStart": null,
            "paddingTop": "xexx8yu",
          },
        },
        {
          "x1lmef92": {
            "ltr": ".x1lmef92{padding:calc((100% - 50px) * .5) var(--rightpadding,20px)}",
            "priority": 1000,
            "rtl": null,
          },
          "xexx8yu": {
            "ltr": ".xexx8yu{padding-top:0}",
            "priority": 4000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms style object with custom property', () => {
    expect(
      styleXCreate({
        default: {
          '--background-color': 'red',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "--background-color": "xgau0yw",
          },
        },
        {
          "xgau0yw": {
            "ltr": ".xgau0yw{--background-color:red}",
            "priority": 1,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms style object with custom property as value', () => {
    expect(
      styleXCreate({
        default: {
          '--final-color': 'var(--background-color)',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "--final-color": "x13tgbkp",
          },
        },
        {
          "x13tgbkp": {
            "ltr": ".x13tgbkp{--final-color:var(--background-color)}",
            "priority": 1,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms multiple namespaces', () => {
    expect(
      styleXCreate({
        default: {
          backgroundColor: 'red',
        },

        default2: {
          color: 'blue',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
          },
          "default2": {
            "$$css": true,
            "color": "xju2f9n",
          },
        },
        {
          "xju2f9n": {
            "ltr": ".xju2f9n{color:blue}",
            "priority": 3000,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('does not transform attr() value', () => {
    expect(
      styleXCreate({
        default: {
          content: 'attr(some-attribute)',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "content": "xd71okc",
          },
        },
        {
          "xd71okc": {
            "ltr": ".xd71okc{content:attr(some-attribute)}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms nested pseudo-class to CSS', () => {
    expect(
      styleXCreate({
        default: {
          ':hover': {
            backgroundColor: 'red',
            color: 'blue',
          },
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x17z2mba",
          },
        },
        {
          "x17z2mba": {
            "ltr": ".x17z2mba:hover{color:blue}",
            "priority": 3130,
            "rtl": null,
          },
          "x1gykpug": {
            "ltr": ".x1gykpug:hover{background-color:red}",
            "priority": 3130,
            "rtl": null,
          },
        },
      ]
    `);
  });

  // This API will not launch as an array, but internally we can continue to use arrays
  test('transforms array values as fallbacks', () => {
    expect(
      styleXCreate({
        default: {
          position: ['sticky', 'fixed'],
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "position": "x1ruww2u",
          },
        },
        {
          "x1ruww2u": {
            "ltr": ".x1ruww2u{position:sticky;position:fixed}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms valid shorthands', () => {
    expect(
      styleXCreate({
        default: {
          overflow: 'hidden',
          borderStyle: 'dashed',
          borderWidth: 1,
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "borderBlockStyle": null,
            "borderBlockWidth": null,
            "borderBottomStyle": null,
            "borderBottomWidth": null,
            "borderInlineEndStyle": null,
            "borderInlineEndWidth": null,
            "borderInlineStartStyle": null,
            "borderInlineStartWidth": null,
            "borderInlineStyle": null,
            "borderInlineWidth": null,
            "borderLeftStyle": null,
            "borderLeftWidth": null,
            "borderRightStyle": null,
            "borderRightWidth": null,
            "borderStyle": "xbsl7fq",
            "borderTopStyle": null,
            "borderTopWidth": null,
            "borderWidth": "xmkeg23",
            "overflow": "xb3r6kr",
            "overflowX": null,
            "overflowY": null,
          },
        },
        {
          "xb3r6kr": {
            "ltr": ".xb3r6kr{overflow:hidden}",
            "priority": 2000,
            "rtl": null,
          },
          "xbsl7fq": {
            "ltr": ".xbsl7fq{border-style:dashed}",
            "priority": 2000,
            "rtl": null,
          },
          "xmkeg23": {
            "ltr": ".xmkeg23{border-width:1px}",
            "priority": 2000,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms media queries', () => {
    expect(
      styleXCreate({
        default: {
          backgroundColor: 'red',
          '@media (min-width: 1000px)': {
            backgroundColor: 'blue',
          },

          '@media (min-width: 2000px)': {
            backgroundColor: 'purple',
          },
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "$$css": true,
            "@media (min-width: 1000px)_backgroundColor": "xc445zv",
            "@media (min-width: 2000px)_backgroundColor": "x1ssfqz5",
            "backgroundColor": "xrkmrrc",
          },
        },
        {
          "x1ssfqz5": {
            "ltr": "@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}",
            "priority": 3200,
            "rtl": null,
          },
          "xc445zv": {
            "ltr": "@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}",
            "priority": 3200,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 3000,
            "rtl": null,
          },
        },
      ]
    `);
  });
});
