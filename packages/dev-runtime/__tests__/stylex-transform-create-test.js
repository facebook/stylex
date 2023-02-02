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
        })
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

    test('transforms style object with custom propety', () => {
      expect(
        stylex.create({
          default: {
            '--background-color': 'red',
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "--background-color": "xgau0yw",
          },
        }
      `);
    });

    test('transforms style object with custom propety as value', () => {
      expect(
        stylex.create({
          default: {
            '--final-color': 'var(--background-color)',
          },
        })
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
        })
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
        })
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
            4,
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
        })
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
            17,
          ],
          [
            "x17z2mba",
            {
              "ltr": ".x17z2mba:hover{color:blue}",
              "rtl": null,
            },
            17,
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
        })
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
            4,
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
        })
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
            4,
          ],
        ]
      `);
    });

    // Legacy, short?
    test('tranforms valid shorthands', () => {
      expect(
        stylex.create({
          default: {
            overflow: 'hidden',
            borderStyle: 'dashed',
            borderWidth: 1,
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "borderBottomStyle": null,
            "borderBottomWidth": null,
            "borderInlineEndStyle": null,
            "borderInlineEndWidth": null,
            "borderInlineStartStyle": null,
            "borderInlineStartWidth": null,
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
            3,
          ],
          [
            "xbsl7fq",
            {
              "ltr": ".xbsl7fq{border-style:dashed}",
              "rtl": null,
            },
            3,
          ],
          [
            "xmkeg23",
            {
              "ltr": ".xmkeg23{border-width:1px}",
              "rtl": null,
            },
            3,
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
        })
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
        })
      ).toMatchInlineSnapshot(`
        {
          "default": {
            "$$css": true,
            "boxShadow": "xxnfx33",
          },
        }
      `);

      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xxnfx33",
            {
              "ltr": ".xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}",
              "rtl": null,
            },
            4,
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
          })
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
              8,
            ],
            [
              "x5z3o4w",
              {
                "ltr": ".x5z3o4w:invalpwdijad{color:blue}",
                "rtl": null,
              },
              8,
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
          })
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
              17,
            ],
            [
              "x96fq8s",
              {
                "ltr": ".x96fq8s:active{color:red}",
                "rtl": null,
              },
              21,
            ],
            [
              "x1wvtd7d",
              {
                "ltr": ".x1wvtd7d:focus{color:yellow}",
                "rtl": null,
              },
              20,
            ],
            [
              "x126ychx",
              {
                "ltr": ".x126ychx:nth-child(2n){color:purple}",
                "rtl": null,
              },
              10,
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
          })
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
              17,
            ],
          ]
        `);
      });
    });
  });
});
