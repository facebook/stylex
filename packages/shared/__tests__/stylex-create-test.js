/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 *
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
            "priority": 4,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 4,
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
            "paddingBottom": "x18xuxqe",
            "paddingEnd": "xcrpjku",
            "paddingStart": "xyv1419",
            "paddingTop": "xexx8yu",
          },
        },
        {
          "x18xuxqe": {
            "ltr": ".x18xuxqe{padding-bottom:calc((100% - 50px) * .5)}",
            "priority": 4,
            "rtl": null,
          },
          "xcrpjku": {
            "ltr": ".xcrpjku{padding-right:var(--rightpadding,20px)}",
            "priority": 4,
            "rtl": ".xcrpjku{padding-left:var(--rightpadding,20px)}",
          },
          "xexx8yu": {
            "ltr": ".xexx8yu{padding-top:0}",
            "priority": 4,
            "rtl": null,
          },
          "xyv1419": {
            "ltr": ".xyv1419{padding-left:var(--rightpadding,20px)}",
            "priority": 4,
            "rtl": ".xyv1419{padding-right:var(--rightpadding,20px)}",
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
            "priority": 4,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('transforms style object with custom propety as value', () => {
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
            "priority": 4,
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
            "priority": 4,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 4,
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
            "priority": 4,
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
            "priority": 17,
            "rtl": null,
          },
          "x1gykpug": {
            "ltr": ".x1gykpug:hover{background-color:red}",
            "priority": 17,
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
            "priority": 4,
            "rtl": null,
          },
        },
      ]
    `);
  });

  test('tranforms valid shorthands', () => {
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
            "borderBottomStyle": null,
            "borderBottomWidth": null,
            "borderInlineEndStyle": null,
            "borderInlineEndWidth": null,
            "borderInlineStartStyle": null,
            "borderInlineStartWidth": null,
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
            "priority": 3,
            "rtl": null,
          },
          "xbsl7fq": {
            "ltr": ".xbsl7fq{border-style:dashed}",
            "priority": 3,
            "rtl": null,
          },
          "xmkeg23": {
            "ltr": ".xmkeg23{border-width:1px}",
            "priority": 3,
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
            "priority": 25,
            "rtl": null,
          },
          "xc445zv": {
            "ltr": "@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}",
            "priority": 25,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 4,
            "rtl": null,
          },
        },
      ]
    `);
  });
});
