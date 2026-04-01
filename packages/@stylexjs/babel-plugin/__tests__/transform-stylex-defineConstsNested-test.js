/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename || '/stylex/packages/tokens.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: '/stylex/packages/',
            type: 'commonJS',
          },
          ...opts,
        },
      ],
    ],
  });
  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.unstable_defineConstsNested()', () => {
    test('basic nested consts with original values preserved', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineConstsNested({
          spacing: {
            sm: '4px',
            md: '8px',
            lg: '16px',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          spacing: {
            sm: "4px",
            md: "8px",
            lg: "16px"
          }
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1o7hcty",
            {
              "constKey": "x1o7hcty",
              "constVal": "4px",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1a2meh5",
            {
              "constKey": "x1a2meh5",
              "constVal": "8px",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "xsuxlvu",
            {
              "constKey": "xsuxlvu",
              "constVal": "16px",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('deeply nested constants (3 levels)', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineConstsNested({
          colors: {
            slate: {
              100: '#f1f5f9',
              800: '#1e293b',
            },
            brand: {
              primary: '#3b82f6',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          colors: {
            slate: {
              "100": "#f1f5f9",
              "800": "#1e293b"
            },
            brand: {
              primary: "#3b82f6"
            }
          }
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1ea6pwh",
            {
              "constKey": "x1ea6pwh",
              "constVal": "#f1f5f9",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1y7aacf",
            {
              "constKey": "x1y7aacf",
              "constVal": "#1e293b",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1hjk04k",
            {
              "constKey": "x1hjk04k",
              "constVal": "#3b82f6",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('j-malt PR #1303 use case: three-tiered tokens with state namespaces', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineConstsNested({
          button: {
            primary: {
              background: {
                default: '#00FF00',
                hovered: '#0000FF',
              },
              borderRadius: {
                default: '8px',
              },
            },
            secondary: {
              background: {
                default: '#CCCCCC',
              },
            },
          },
          input: {
            fill: {
              default: '#FFFFFF',
            },
            border: {
              default: '#000000',
            },
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          button: {
            primary: {
              background: {
                default: "#00FF00",
                hovered: "#0000FF"
              },
              borderRadius: {
                default: "8px"
              }
            },
            secondary: {
              background: {
                default: "#CCCCCC"
              }
            }
          },
          input: {
            fill: {
              default: "#FFFFFF"
            },
            border: {
              default: "#000000"
            }
          }
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1lcj7dl",
            {
              "constKey": "x1lcj7dl",
              "constVal": "#00FF00",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x6sbfcu",
            {
              "constKey": "x6sbfcu",
              "constVal": "#0000FF",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1jssn4v",
            {
              "constKey": "x1jssn4v",
              "constVal": "8px",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x16qravu",
            {
              "constKey": "x16qravu",
              "constVal": "#CCCCCC",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1faoohz",
            {
              "constKey": "x1faoohz",
              "constVal": "#FFFFFF",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x195aq7b",
            {
              "constKey": "x195aq7b",
              "constVal": "#000000",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('handles number values', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineConstsNested({
          breakpoints: {
            mobile: 480,
            tablet: 768,
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          breakpoints: {
            mobile: 480,
            tablet: 768
          }
        };"
      `);
      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "xeaemq9",
            {
              "constKey": "xeaemq9",
              "constVal": 480,
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1egukyl",
            {
              "constKey": "x1egukyl",
              "constVal": 768,
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });

    test('works with named import', () => {
      const { code } = transform(`
        import { unstable_defineConstsNested } from '@stylexjs/stylex';
        export const tokens = unstable_defineConstsNested({
          radii: {
            sm: '0.25rem',
            xl: '1rem',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { unstable_defineConstsNested } from '@stylexjs/stylex';
        export const tokens = {
          radii: {
            sm: "0.25rem",
            xl: "1rem"
          }
        };"
      `);
    });

    test('mixed string and number values', () => {
      const { code } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineConstsNested({
          theme: {
            spacing: 8,
            unit: 'px',
          },
        });
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const tokens = {
          theme: {
            spacing: 8,
            unit: "px"
          }
        };"
      `);
    });

    // Validation tests
    test('throws: must be a named export', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        const tokens = stylex.unstable_defineConstsNested({
          spacing: { sm: '4px' },
        });
      `),
      ).toThrow();
    });

    test('throws: must have exactly 1 argument', () => {
      expect(() =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        export const tokens = stylex.unstable_defineConstsNested({}, {});
      `),
      ).toThrow();
    });
  });
});
