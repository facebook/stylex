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
  describe('[transform] stylex.create()', () => {
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
        stylex.create({
          default: {
            backgroundColor: 'red',
            color: 'blue',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
            "color": "xju2f9n",
          },
        }
      `);
    });

    test('transforms style object with custom property', () => {
      expect(
        stylex.create({
          default: {
            '--background-color': 'red',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "--background-color": "xgau0yw",
          },
        }
      `);
    });

    test('transforms style object with custom property as value', () => {
      expect(
        stylex.create({
          default: {
            '--final-color': 'var(--background-color)',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "--final-color": "x13tgbkp",
          },
        }
      `);
    });

    test('transforms multiple namespaces', () => {
      expect(
        stylex.create({
          default: {
            backgroundColor: 'red',
          },
          default2: {
            color: 'blue',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
          },
          "default2": {
            "$$css": true,
            "color": "xju2f9n",
          },
        }
      `);
    });

    test('does not transform attr() value', () => {
      expect(
        stylex.create({
          default: {
            content: 'attr(some-attribute)',
          },
        }),
      ).toEqual({
        default: {
          $$css: true,
          content: 'xd71okc',
        },
      });

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xd71okc",
            {
              "ltr": ".xd71okc{content:attr(some-attribute)}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    test('transforms nested pseudo-class to CSS', () => {
      expect(
        stylex.create({
          default: {
            ':hover': {
              backgroundColor: 'red',
              color: 'blue',
            },
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x17z2mba",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1gykpug",
            {
              "ltr": ".x1gykpug:hover{background-color:red}",
              "rtl": null,
            },
            3130,
          ],
          [
            "x17z2mba",
            {
              "ltr": ".x17z2mba:hover{color:blue}",
              "rtl": null,
            },
            3130,
          ],
        ]
      `);
    });

    test('transforms array values as fallbacks', () => {
      expect(
        stylex.create({
          default: {
            position: ['sticky', 'fixed'],
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "position": "x1ruww2u",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1ruww2u",
            {
              "ltr": ".x1ruww2u{position:sticky;position:fixed}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    // TODO: add more vendor-prefixed properties and values
    test('transforms properties requiring vendor prefixes', () => {
      expect(
        stylex.create({
          default: {
            userSelect: 'none',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "userSelect": "x87ps6o",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x87ps6o",
            {
              "ltr": ".x87ps6o{user-select:none}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    // Legacy, short?
    test('transforms valid shorthands', () => {
      expect(
        stylex.create({
          default: {
            overflow: 'hidden',
            borderStyle: 'dashed',
            borderWidth: 1,
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "borderBlockStyle": null,
            "borderBlockWidth": null,
            "borderBottomStyle": null,
            "borderBottomWidth": null,
            "borderInlineEndStyle": null,
            "borderInlineEndWidth": null,
            "borderInlineStartStyle": null,
            "borderInlineStartWidth": null,
            "borderInlineStyle": null,
            "borderInlineWidth": null,
            "borderLeftStyle": null,
            "borderLeftWidth": null,
            "borderRightStyle": null,
            "borderRightWidth": null,
            "borderStyle": "xbsl7fq",
            "borderTopStyle": null,
            "borderTopWidth": null,
            "borderWidth": "xmkeg23",
            "overflow": "xb3r6kr",
            "overflowX": null,
            "overflowY": null,
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xb3r6kr",
            {
              "ltr": ".xb3r6kr{overflow:hidden}",
              "rtl": null,
            },
            2000,
          ],
          [
            "xbsl7fq",
            {
              "ltr": ".xbsl7fq{border-style:dashed}",
              "rtl": null,
            },
            2000,
          ],
          [
            "xmkeg23",
            {
              "ltr": ".xmkeg23{border-width:1px}",
              "rtl": null,
            },
            2000,
          ],
        ]
      `);
    });

    test('preserves imported object spread', () => {
      const importedStyles = stylex.create({
        foo: {
          color: 'blue',
        },
      });

      expect(
        stylex.create({
          foo: {
            ...stylex.include(importedStyles.foo),
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "foo": {
            "$$css": true,
            "color": "xju2f9n",
          },
        }
      `);
    });

    test('Uses stylex.firstThatWorks correctly', () => {
      expect(stylex.firstThatWorks('sticky', 'fixed')).toMatchInlineSnapshot(`
        [
          "fixed",
          "sticky",
        ]
      `);
    });

    test('transforms complex property values containing custom properties variables', () => {
      expect(
        stylex.create({
          default: {
            boxShadow: '0px 2px 4px var(--shadow-1)',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "boxShadow": "x8crwfo",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x8crwfo",
            {
              "ltr": ".x8crwfo{box-shadow:0px 2px 4px var(--shadow-1)}",
              "rtl": ".x8crwfo{box-shadow:-0px 2px 4px var(--shadow-1)}",
            },
            3000,
          ],
        ]
      `);
    });

    describe('pseudo-classes', () => {
      // TODO: this should either fail or guarantee an insertion order relative to valid pseudo-classes
      test('transforms invalid pseudo-class', () => {
        expect(
          stylex.create({
            default: {
              ':invalpwdijad': {
                backgroundColor: 'red',
                color: 'blue',
              },
            },
          }),
        ).toMatchInlineSnapshot(`
          {
            "default": {
              "$$css": true,
              ":invalpwdijad_backgroundColor": "x19iys6w",
              ":invalpwdijad_color": "x5z3o4w",
            },
          }
        `);

        expect(metadata).toMatchInlineSnapshot(`
          [
            [
              "x19iys6w",
              {
                "ltr": ".x19iys6w:invalpwdijad{background-color:red}",
                "rtl": null,
              },
              3040,
            ],
            [
              "x5z3o4w",
              {
                "ltr": ".x5z3o4w:invalpwdijad{color:blue}",
                "rtl": null,
              },
              3040,
            ],
          ]
        `);
      });

      test('transforms valid pseudo-classes in order', () => {
        expect(
          stylex.create({
            default: {
              ':hover': {
                color: 'blue',
              },
              ':active': {
                color: 'red',
              },
              ':focus': {
                color: 'yellow',
              },
              ':nth-child(2n)': {
                color: 'purple',
              },
            },
          }),
        ).toMatchInlineSnapshot(`
          {
            "default": {
              "$$css": true,
              ":active_color": "x96fq8s",
              ":focus_color": "x1wvtd7d",
              ":hover_color": "x17z2mba",
              ":nth-child(2n)_color": "x126ychx",
            },
          }
        `);

        expect(metadata).toMatchInlineSnapshot(`
          [
            [
              "x17z2mba",
              {
                "ltr": ".x17z2mba:hover{color:blue}",
                "rtl": null,
              },
              3130,
            ],
            [
              "x96fq8s",
              {
                "ltr": ".x96fq8s:active{color:red}",
                "rtl": null,
              },
              3170,
            ],
            [
              "x1wvtd7d",
              {
                "ltr": ".x1wvtd7d:focus{color:yellow}",
                "rtl": null,
              },
              3150,
            ],
            [
              "x126ychx",
              {
                "ltr": ".x126ychx:nth-child(2n){color:purple}",
                "rtl": null,
              },
              3060,
            ],
          ]
        `);
      });

      test('transforms pseudo-class with array value as fallbacks', () => {
        expect(
          stylex.create({
            default: {
              ':hover': {
                position: ['sticky', 'fixed'],
              },
            },
          }),
        ).toMatchInlineSnapshot(`
          {
            "default": {
              "$$css": true,
              ":hover_position": "x1nxcus0",
            },
          }
        `);

        expect(metadata).toMatchInlineSnapshot(`
          [
            [
              "x1nxcus0",
              {
                "ltr": ".x1nxcus0:hover{position:sticky;position:fixed}",
                "rtl": null,
              },
              3130,
            ],
          ]
        `);
      });
    });
  });

  describe('[transform] stylex.create() functions', () => {
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

    test('transforms style function', () => {
      const styles = stylex.create({
        default: (color) => ({
          backgroundColor: 'red',
          color: color,
        }),
      });

      expect(styles.default('blue')).toMatchInlineSnapshot(`
        [
          {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
            "color": "x19dipnz",
          },
          {
            "--color": "blue",
          },
        ]
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xrkmrrc",
            {
              "ltr": ".xrkmrrc{background-color:red}",
              "rtl": null,
            },
            3000,
          ],
          [
            "x19dipnz",
            {
              "ltr": ".x19dipnz{color:var(--color,revert)}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    test('adds unit to numbers in style function', () => {
      const styles = stylex.create({
        default: (width) => ({
          backgroundColor: 'red',
          width,
        }),
      });

      expect(styles.default(10)).toMatchInlineSnapshot(`
        [
          {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
            "width": "x17fnjtu",
          },
          {
            "--width": "10px",
          },
        ]
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xrkmrrc",
            {
              "ltr": ".xrkmrrc{background-color:red}",
              "rtl": null,
            },
            3000,
          ],
          [
            "x17fnjtu",
            {
              "ltr": ".x17fnjtu{width:var(--width,revert)}",
              "rtl": null,
            },
            4000,
          ],
        ]
      `);
    });

    test('transforms mix of style objects and functions', () => {
      const styles = stylex.create({
        default: (color) => ({
          backgroundColor: 'red',
          color: color,
        }),
        mono: {
          color: 'black',
        },
      });

      expect(Object.keys(styles)).toEqual(['default', 'mono']);

      expect(typeof styles.default).toBe('function');
      expect(typeof styles.mono).toBe('object');

      expect(styles.mono).toMatchInlineSnapshot(`
        {
          "$$css": true,
          "color": "x1mqxbix",
        }
      `);

      expect(styles.default('blue')).toMatchInlineSnapshot(`
        [
          {
            "$$css": true,
            "backgroundColor": "xrkmrrc",
            "color": "x19dipnz",
          },
          {
            "--color": "blue",
          },
        ]
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xrkmrrc",
            {
              "ltr": ".xrkmrrc{background-color:red}",
              "rtl": null,
            },
            3000,
          ],
          [
            "x19dipnz",
            {
              "ltr": ".x19dipnz{color:var(--color,revert)}",
              "rtl": null,
            },
            3000,
          ],
          [
            "x1mqxbix",
            {
              "ltr": ".x1mqxbix{color:black}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    test('transforms style object with custom property', () => {
      const styles = stylex.create({
        default: (bgColor) => ({
          '--background-color': bgColor,
        }),
      });

      expect(styles.default('red')).toMatchInlineSnapshot(`
        [
          {
            "$$css": true,
            "--background-color": "xyv4n8w",
          },
          {
            "----background-color": "red",
          },
        ]
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xyv4n8w",
            {
              "ltr": ".xyv4n8w{--background-color:var(----background-color,revert)}",
              "rtl": null,
            },
            1,
          ],
        ]
      `);
    });

    test('transforms style object with wrapped custom property', () => {
      const styles = stylex.create({
        default: (bgColor) => ({
          'var(--background-color)': bgColor,
        }),
      });

      expect(styles.default('red')).toMatchInlineSnapshot(`
        [
          {
            "$$css": true,
            "--background-color": "xyv4n8w",
          },
          {
            "----background-color": "initial",
          },
        ]
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xyv4n8w",
            {
              "ltr": ".xyv4n8w{--background-color:var(----background-color,revert)}",
              "rtl": null,
            },
            1,
          ],
        ]
      `);
    });

    test('transforms nested pseudo-class to CSS', () => {
      const styles = stylex.create({
        default: (color) => ({
          ':hover': {
            backgroundColor: 'red',
            color,
          },
        }),
      });

      expect(typeof styles.default).toBe('function');

      expect(styles.default('blue')).toMatchInlineSnapshot(`
        [
          {
            "$$css": true,
            ":hover_backgroundColor": "x1gykpug",
            ":hover_color": "x11bf1mc",
          },
          {
            "--1ijzsae": "blue",
          },
        ]
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "x1gykpug",
            {
              "ltr": ".x1gykpug:hover{background-color:red}",
              "rtl": null,
            },
            3130,
          ],
          [
            "x11bf1mc",
            {
              "ltr": ".x11bf1mc:hover{color:var(--1ijzsae,revert)}",
              "rtl": null,
            },
            3130,
          ],
        ]
      `);
    });
  });
});
