/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
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
      }),
    ).toMatchInlineSnapshot(`
      [
        "x1higzey-B",
        {
          "ltr": "@keyframes x1higzey-B{from{background-color:red;}to{background-color:#00f;}}",
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
      }),
    ).toMatchInlineSnapshot(`
      [
        "x1jkcf39-B",
        {
          "ltr": "@keyframes x1jkcf39-B{from{inset-inline-start:0;}to{inset-inline-start:500px;}}",
          "priority": 1,
          "rtl": null,
        },
      ]
    `);
  });
});
