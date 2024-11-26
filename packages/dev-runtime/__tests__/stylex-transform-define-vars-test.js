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
  describe('[transform] stylex.defineVars()', () => {
    beforeEach(() => {
      metadata = [];
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
              "ltr": ":root, .x7fqapl{--xiwovr5:blue;--xdg0pry:grey;--x1j3mert:10px;--x1wgda7f:pink;}",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x7fqapl-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root, .x7fqapl{--xiwovr5:lightblue;--xdg0pry:rgba(0, 0, 0, 0.8);}}",
              "rtl": undefined,
            },
            0.1,
          ],
          [
            "x7fqapl-bdddrq",
            {
              "ltr": "@media print{:root, .x7fqapl{--xiwovr5:white;}}",
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
            "xiwovr5",
            {
              "ltr": "@property --xiwovr5 { syntax: "<color>"; inherits: true; initial-value: blue }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "xdg0pry",
            {
              "ltr": "@property --xdg0pry { syntax: "<color>"; inherits: true; initial-value: grey }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1j3mert",
            {
              "ltr": "@property --x1j3mert { syntax: "<length>"; inherits: true; initial-value: 10px }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x1wgda7f",
            {
              "ltr": "@property --x1wgda7f { syntax: "<color>"; inherits: true; initial-value: pink }",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x7fqapl",
            {
              "ltr": ":root, .x7fqapl{--xiwovr5:blue;--xdg0pry:grey;--x1j3mert:10px;--x1wgda7f:pink;}",
              "rtl": undefined,
            },
            0,
          ],
          [
            "x7fqapl-1lveb7",
            {
              "ltr": "@media (prefers-color-scheme: dark){:root, .x7fqapl{--xiwovr5:lightblue;--xdg0pry:rgba(0, 0, 0, 0.8);}}",
              "rtl": undefined,
            },
            0.1,
          ],
          [
            "x7fqapl-bdddrq",
            {
              "ltr": "@media print{:root, .x7fqapl{--xiwovr5:white;}}",
              "rtl": undefined,
            },
            0.1,
          ],
        ]
      `);
    });
  });
});
