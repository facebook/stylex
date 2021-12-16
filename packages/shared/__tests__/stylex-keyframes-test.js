/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 *
 */

import styleXKeyframes from '../src/stylex-keyframes';

describe('stylex-keyframes test', () => {
  test('converts keyframes to CSS', () => {
    expect(
      styleXKeyframes({
        from: {
          backgroundColor: 'red',
        },

        to: {
          backgroundColor: 'blue',
        },
      })
    ).toMatchInlineSnapshot(`
      [
        "xbopttm-B",
        {
          "ltr": "@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}",
          "priority": 1,
          "rtl": null,
        },
      ]
    `);
  });

  test('generates RTL-specific keyframes', () => {
    expect(
      styleXKeyframes({
        from: {
          start: 0,
        },

        to: {
          start: 500,
        },
      })
    ).toMatchInlineSnapshot(`
      [
        "x1lvx8r0-B",
        {
          "ltr": "@keyframes x1lvx8r0-B{from{left:0;}to{left:500px;}}",
          "priority": 1,
          "rtl": "@keyframes x1lvx8r0-B{from{right:0;}to{right:500px;}}",
        },
      ]
    `);
  });
});
