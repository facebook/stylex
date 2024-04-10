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
import stylex from '@stylexjs/stylex';

/* eslint-disable quotes */
describe('Development Runtime Transformation', () => {
  describe('[transform] CSS keyframes', () => {
    let metadata = [];
    beforeEach(() => {
      metadata = [];
      inject({
        dev: false,
        test: false,
        insert: (key, ltr, priority, rtl) => {
          metadata.push([key, { ltr, rtl }, priority]);
        },
      });
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
      expect(name).toMatchInlineSnapshot(`"x1id2van-B"`);

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
            "animationName": "x1phmjlw",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1id2van-B",
            {
              "ltr": "@keyframes x1id2van-B{from{inset-inline-start:0px;}to{inset-inline-start:500px;}}",
              "rtl": null,
            },
            1,
          ],
          [
            "x1phmjlw",
            {
              "ltr": ".x1phmjlw{animation-name:x1id2van-B}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });
  });
});
