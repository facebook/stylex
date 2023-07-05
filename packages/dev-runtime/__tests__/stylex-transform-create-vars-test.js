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
            bgColor: 'blue',
            bgColorDisabled: 'grey',
            cornerRadius: '10px',
          },
          {
            themeName: 'buttonTheme',
          }
        )
      ).toMatchInlineSnapshot(`
        {
          "__themeName__": "x7fqapl",
          "bgColor": "var(--xiwovr5)",
          "bgColorDisabled": "var(--xdg0pry)",
          "cornerRadius": "var(--x1j3mert)",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x7fqapl",
            {
              "ltr": ":root{--xiwovr5:blue;--xdg0pry:grey;--x1j3mert:10px;}",
              "rtl": undefined,
            },
            0,
          ],
        ]
      `);
    });
  });
});
