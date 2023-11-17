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

describe('Development Plugin Transformation', () => {
  describe('[transform] stylex.defineVars()', () => {
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

    test('transforms style object', () => {
      expect(
        stylex.defineVars(
          {
            bgColor: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            },
            bgColorDisabled: {
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            },
            cornerRadius: '10px',
            fgColor: {
              default: 'pink',
            },
          },
          {
            themeName: 'buttonTheme',
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "__themeName__": "x1y709cs",
          "bgColor": "var(--x4ocsy0)",
          "bgColorDisabled": "var(--x1hi3uh4)",
          "cornerRadius": "var(--x1r1ahgb)",
          "fgColor": "var(--xrbea40)",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1y709cs",
            {
              "ltr": ":root{--x4ocsy0:blue;--x1hi3uh4:grey;--x1r1ahgb:10px;--xrbea40:pink;}@media (prefers-color-scheme: dark){:root{--x4ocsy0:lightblue;--x1hi3uh4:rgba(0, 0, 0, 0.8);}}@media print{:root{--x4ocsy0:white;}}",
              "rtl": undefined,
            },
            0,
          ],
        ]
      `);
    });
  });
});
