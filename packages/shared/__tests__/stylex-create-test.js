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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "backgroundColor": "xrkmrrc",
            "color": "xju2f9n",
          },
        },
        {
          "xju2f9n": {
            "ltr": ".xju2f9n{color:blue}",
            "priority": 1,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 1,
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "short": {
            "paddingBottom": "x18xuxqe",
            "paddingEnd": "xcrpjku",
            "paddingStart": "xyv1419",
            "paddingTop": "xexx8yu",
          },
        },
        {
          "x18xuxqe": {
            "ltr": ".x18xuxqe{padding-bottom:calc((100% - 50px) * .5)}",
            "priority": 1,
            "rtl": null,
          },
          "xcrpjku": {
            "ltr": ".xcrpjku{padding-right:var(--rightpadding,20px)}",
            "priority": 1,
            "rtl": ".xcrpjku{padding-left:var(--rightpadding,20px)}",
          },
          "xexx8yu": {
            "ltr": ".xexx8yu{padding-top:0}",
            "priority": 1,
            "rtl": null,
          },
          "xyv1419": {
            "ltr": ".xyv1419{padding-left:var(--rightpadding,20px)}",
            "priority": 1,
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
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

  test('transforms style object with custom propety as value', () => {
    expect(
      styleXCreate({
        default: {
          '--final-color': 'var(--background-color)',
        },
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "backgroundColor": "xrkmrrc",
          },
          "default2": {
            "color": "xju2f9n",
          },
        },
        {
          "xju2f9n": {
            "ltr": ".xju2f9n{color:blue}",
            "priority": 1,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 1,
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "content": "xd71okc",
          },
        },
        {
          "xd71okc": {
            "ltr": ".xd71okc{content:attr(some-attribute)}",
            "priority": 1,
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            ":hover": {
              "backgroundColor": "x1gykpug",
              "color": "x17z2mba",
            },
          },
        },
        {
          "x17z2mba": {
            "ltr": ".x17z2mba:hover{color:blue}",
            "priority": 8,
            "rtl": null,
          },
          "x1gykpug": {
            "ltr": ".x1gykpug:hover{background-color:red}",
            "priority": 8,
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "position": "x1ruww2u",
          },
        },
        {
          "x1ruww2u": {
            "ltr": ".x1ruww2u{position:sticky;position:fixed}",
            "priority": 1,
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "borderBottomStyle": "xpvcztv",
            "borderBottomWidth": "xso031l",
            "borderEndStyle": "x157eodl",
            "borderEndWidth": "xm81vs4",
            "borderStartStyle": "x1q04ism",
            "borderStartWidth": "xy80clv",
            "borderTopStyle": "xlya59e",
            "borderTopWidth": "x178xt8z",
            "overflowX": "x6ikm8r",
            "overflowY": "x10wlt62",
          },
        },
        {
          "x10wlt62": {
            "ltr": ".x10wlt62{overflow-y:hidden}",
            "priority": 1,
            "rtl": null,
          },
          "x157eodl": {
            "ltr": ".x157eodl{border-right-style:dashed}",
            "priority": 1,
            "rtl": ".x157eodl{border-left-style:dashed}",
          },
          "x178xt8z": {
            "ltr": ".x178xt8z{border-top-width:1px}",
            "priority": 1,
            "rtl": null,
          },
          "x1q04ism": {
            "ltr": ".x1q04ism{border-left-style:dashed}",
            "priority": 1,
            "rtl": ".x1q04ism{border-right-style:dashed}",
          },
          "x6ikm8r": {
            "ltr": ".x6ikm8r{overflow-x:hidden}",
            "priority": 1,
            "rtl": null,
          },
          "xlya59e": {
            "ltr": ".xlya59e{border-top-style:dashed}",
            "priority": 1,
            "rtl": null,
          },
          "xm81vs4": {
            "ltr": ".xm81vs4{border-right-width:1px}",
            "priority": 1,
            "rtl": ".xm81vs4{border-left-width:1px}",
          },
          "xpvcztv": {
            "ltr": ".xpvcztv{border-bottom-style:dashed}",
            "priority": 1,
            "rtl": null,
          },
          "xso031l": {
            "ltr": ".xso031l{border-bottom-width:1px}",
            "priority": 1,
            "rtl": null,
          },
          "xy80clv": {
            "ltr": ".xy80clv{border-left-width:1px}",
            "priority": 1,
            "rtl": ".xy80clv{border-right-width:1px}",
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
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "default": {
            "@media (min-width: 1000px)": {
              "backgroundColor": "xc445zv",
            },
            "@media (min-width: 2000px)": {
              "backgroundColor": "x1ssfqz5",
            },
            "backgroundColor": "xrkmrrc",
          },
        },
        {
          "x1ssfqz5": {
            "ltr": "@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}",
            "priority": 2,
            "rtl": null,
          },
          "xc445zv": {
            "ltr": "@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}",
            "priority": 2,
            "rtl": null,
          },
          "xrkmrrc": {
            "ltr": ".xrkmrrc{background-color:red}",
            "priority": 1,
            "rtl": null,
          },
        },
      ]
    `);
  });
});
