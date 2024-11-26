/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

import inject from '../src';

let metadata = [];
const stylex = inject({
  dev: false,
  test: false,
  insert: (key, ltr, priority, rtl) => {
    metadata.push([key, { ltr, rtl }, priority]);
  },
});

/* eslint-disable quotes */
describe('Development Runtime Transformation', () => {
  describe('[transform] CSS keyframes', () => {
    beforeEach(() => {
      metadata = [];
    });

    test('converts keyframes to CSS', () => {
      expect(
        stylex.keyframes({
          from: {
            backgroundColor: 'red',
          },

          to: {
            backgroundColor: 'blue',
          },
        }),
      ).toMatchInlineSnapshot(`"xbopttm-B"`);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xbopttm-B",
            {
              "ltr": "@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}",
              "rtl": null,
            },
            1,
          ],
        ]
      `);
    });

    test('allows template literal references to keyframes', () => {
      expect(
        stylex.keyframes({
          from: {
            backgroundColor: 'blue',
          },

          to: {
            backgroundColor: 'red',
          },
        }),
      ).toMatchInlineSnapshot(`"x3zqmp-B"`);
    });

    test('generates RTL-specific keyframes', () => {
      const name = stylex.keyframes({
        from: {
          start: 0,
        },

        to: {
          start: 500,
        },
      });
      expect(name).toMatchInlineSnapshot(`"x1jkcf39-B"`);

      expect(
        stylex.create({
          root: {
            animationName: name,
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "root": {
            "$$css": true,
            "animationName": "x1vfi257",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1jkcf39-B",
            {
              "ltr": "@keyframes x1jkcf39-B{from{inset-inline-start:0;}to{inset-inline-start:500px;}}",
              "rtl": null,
            },
            1,
          ],
          [
            "x1vfi257",
            {
              "ltr": ".x1vfi257{animation-name:x1jkcf39-B}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });
  });
});
