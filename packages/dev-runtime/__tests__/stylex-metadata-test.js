/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import inject from '../src';
import stylex from '@stylexjs/stylex';

describe('Development Plugin Metadata', () => {
  describe('[metadata] plugin metadata', () => {
    test('stylex metadata is correctly set', () => {
      const metadata = [];
      inject({
        dev: false,
        test: false,
        insert: (key, ltr, priority, rtl) => {
          metadata.push([key, { ltr, rtl }, priority]);
        },
      });

      // eslint-disable-next-line no-unused-vars
      const _styles = stylex.create({
        foo: {
          color: 'red',
          height: 5,
          ':hover': {
            start: 10,
          },
          '@media (min-width: 1000px)': {
            end: 5,
          },
        },
      });

      // eslint-disable-next-line no-unused-vars
      const _name = stylex.keyframes({
        from: {
          start: 0,
        },
        to: {
          start: 100,
        },
      });

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1e2nbdu",
            {
              "ltr": ".x1e2nbdu{color:red}",
              "rtl": null,
            },
            4,
          ],
          [
            "x1ycjhwn",
            {
              "ltr": ".x1ycjhwn{height:5px}",
              "rtl": null,
            },
            4,
          ],
          [
            "xaiupp8",
            {
              "ltr": ".xaiupp8:hover{inset-inline-start:10px}",
              "rtl": null,
            },
            17,
          ],
          [
            "x1uy60zq",
            {
              "ltr": "@media (min-width: 1000px){.x1uy60zq.x1uy60zq{inset-inline-end:5px}}",
              "rtl": null,
            },
            25,
          ],
          [
            "xqv9ub1-B",
            {
              "ltr": "@keyframes xqv9ub1-B{from{inset-inline-start:0;}to{inset-inline-start:100px;}}",
              "rtl": null,
            },
            1,
          ],
        ]
      `);
    });
  });
});
