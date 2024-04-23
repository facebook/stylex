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
              "ltr": ":root{--x4ocsy0:blue;--x1hi3uh4:grey;--x1r1ahgb:10px;--xrbea40:pink;}",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1y709cs-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root{--x4ocsy0:lightblue;--x1hi3uh4:rgba(0, 0, 0, 0.8);}}",
              "rtl": undefined,
            },
            0.1,
          ],
          [
            "x1y709cs-bdddrq",
            {
              "ltr": "@media print{:root{--x4ocsy0:white;}}",
              "rtl": undefined,
            },
            0.1,
          ],
        ]
      `);
    });
    test('transforms typed vars', () => {
      expect(
        stylex.defineVars(
          {
            bgColor: stylex.types.color({
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
              '@media print': 'white',
            }),
            bgColorDisabled: stylex.types.color({
              default: 'grey',
              '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
            }),
            cornerRadius: stylex.types.length('10px'),
            fgColor: stylex.types.color({
              default: 'pink',
            }),
          },
          {
            themeName: 'buttonTheme',
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "__themeName__": "x1t4wu1b",
          "bgColor": "var(--xay5bfx)",
          "bgColorDisabled": "var(--xptvf7g)",
          "cornerRadius": "var(--x1byau2i)",
          "fgColor": "var(--x1ww5d7a)",
        }
      `);
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xay5bfx",
            {
              "ltr": "@property --xay5bfx { syntax: "<color>"; inherits: true; initial-value: blue }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "xptvf7g",
            {
              "ltr": "@property --xptvf7g { syntax: "<color>"; inherits: true; initial-value: grey }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1byau2i",
            {
              "ltr": "@property --x1byau2i { syntax: "<length>"; inherits: true; initial-value: 10px }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1ww5d7a",
            {
              "ltr": "@property --x1ww5d7a { syntax: "<color>"; inherits: true; initial-value: pink }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1t4wu1b",
            {
              "ltr": ":root{--xay5bfx:blue;--xptvf7g:grey;--x1byau2i:10px;--x1ww5d7a:pink;}",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1t4wu1b-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root{--xay5bfx:lightblue;--xptvf7g:rgba(0, 0, 0, 0.8);}}",
              "rtl": undefined,
            },
            0.1,
          ],
          [
            "x1t4wu1b-bdddrq",
            {
              "ltr": "@media print{:root{--xay5bfx:white;}}",
              "rtl": undefined,
            },
            0.1,
          ],
        ]
      `);
    });
  });
});
