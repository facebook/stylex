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
  describe('[transform] stylex.unstable_overrideVars()', () => {
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
        stylex.unstable_overrideVars(
          {
            __themeName__: 'TestTheme.stylex.js//buttonTheme',
            bgColor: 'var(--xiwovr5)',
            bgColorDisabled: 'var(--xdg0pry)',
            cornerRadius: 'var(--x1j3mert)',
          },
          {
            bgColor: 'green',
            cornerRadius: '6px',
          }
        )
      ).toMatchInlineSnapshot(`
         {
           "$$css": true,
           "TestTheme.stylex.js//buttonTheme": "xuvtb6u",
         }
       `);
      expect(metadata).toMatchInlineSnapshot(`
         [
           [
             "xuvtb6u",
             {
               "ltr": ".xuvtb6u{--xiwovr5:green;--x1j3mert:6px;}",
               "rtl": undefined,
             },
             0.99,
           ],
         ]
       `);
    });
  });
});
