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
            bgColor: 'var(--xgck17p)',
            bgColorDisabled: 'var(--xpegid5)',
            cornerRadius: 'var(--xrqfjmn)',
            fgColor: 'var(--x4y59db)',
          },
          {
            bgColor: {
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            },
            bgColorDisabled: {
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            },
            cornerRadius: { default: '6px' },
            fgColor: 'coral',
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "$$css": true,
          "TestTheme.stylex.js//buttonTheme": "xfmksyk",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xfmksyk",
            {
              "ltr": ".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}}",
              "rtl": undefined,
            },
            0.99,
          ],
        ]
      `);
    });
  });
});
