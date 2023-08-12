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
  describe('[transform] stylex.unstable_createVars()', () => {
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
        stylex.unstable_createVars(
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
          "__themeName__": "x7fqapl",
          "bgColor": "var(--xiwovr5)",
          "bgColorDisabled": "var(--xdg0pry)",
          "cornerRadius": "var(--x1j3mert)",
          "fgColor": "var(--x1wgda7f)",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x7fqapl",
            {
              "ltr": ":root{--xiwovr5:blue;--xdg0pry:grey;--x1j3mert:10px;--x1wgda7f:pink;}@media (prefers-color-scheme: dark){:root{--xiwovr5:lightblue;--xdg0pry:rgba(0, 0, 0, 0.8);}}@media print{:root{--xiwovr5:white;}}",
              "rtl": undefined,
            },
            0,
          ],
        ]
      `);
    });
  });
});
