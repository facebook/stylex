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

describe('Development Plugin Transformation', () => {
  describe('[transform] stylex.createTheme()', () => {
    beforeEach(() => {
      metadata = [];
    });

    test('transforms style object', () => {
      expect(
        stylex.createTheme(
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
          "TestTheme.stylex.js//buttonTheme": "xtrlmmh TestTheme.stylex.js//buttonTheme",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xtrlmmh",
            {
              "ltr": ".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}",
              "rtl": undefined,
            },
            0.5,
          ],
          [
            "xtrlmmh-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}",
              "rtl": undefined,
            },
            0.6,
          ],
          [
            "xtrlmmh-bdddrq",
            {
              "ltr": "@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}",
              "rtl": undefined,
            },
            0.6,
          ],
        ]
      `);
    });

    test('transforms typed style object', () => {
      expect(
        stylex.createTheme(
          {
            __themeName__: 'TestTheme.stylex.js//buttonTheme',
            bgColor: 'var(--xgck17p)',
            bgColorDisabled: 'var(--xpegid5)',
            cornerRadius: 'var(--xrqfjmn)',
            fgColor: 'var(--x4y59db)',
          },
          {
            bgColor: stylex.types.color({
              default: 'green',
              '@media (prefers-color-scheme: dark)': 'lightgreen',
              '@media print': 'transparent',
            }),
            bgColorDisabled: stylex.types.color({
              default: 'antiquewhite',
              '@media (prefers-color-scheme: dark)': 'floralwhite',
            }),
            cornerRadius: stylex.types.length({ default: '6px' }),
            fgColor: stylex.types.color('coral'),
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "$$css": true,
          "TestTheme.stylex.js//buttonTheme": "xtrlmmh TestTheme.stylex.js//buttonTheme",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xtrlmmh",
            {
              "ltr": ".xtrlmmh, .xtrlmmh:root{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}",
              "rtl": undefined,
            },
            0.5,
          ],
          [
            "xtrlmmh-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){.xtrlmmh, .xtrlmmh:root{--xgck17p:lightgreen;--xpegid5:floralwhite;}}",
              "rtl": undefined,
            },
            0.6,
          ],
          [
            "xtrlmmh-bdddrq",
            {
              "ltr": "@media print{.xtrlmmh, .xtrlmmh:root{--xgck17p:transparent;}}",
              "rtl": undefined,
            },
            0.6,
          ],
        ]
      `);
    });
  });
});
