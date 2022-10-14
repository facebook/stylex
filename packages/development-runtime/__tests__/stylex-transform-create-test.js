/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import inject from '../src';
import stylex from 'stylex';

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
      ).toEqual({
        default: {
          backgroundColor: 'xrkmrrc',
          color: 'xju2f9n',
        },
      });
    });

    test('transforms style object with custom propety', () => {
      expect(
        stylex.create({
          default: {
            '--background-color': 'red',
          },
        })
      ).toEqual({
        default: {
          '--background-color': 'xgau0yw',
        },
      });
    });

    test('transforms style object with custom propety as value', () => {
      expect(
        stylex.create({
          default: {
            '--final-color': 'var(--background-color)',
          },
        })
      ).toEqual({
        default: {
          '--final-color': 'x13tgbkp',
        },
      });
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
      ).toEqual({
        default: {
          backgroundColor: 'xrkmrrc',
        },
        default2: {
          color: 'xju2f9n',
        },
      });
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
          content: 'xd71okc',
        },
      });

      expect(metadata).toEqual([
        [
          'xd71okc',
          { ltr: '.xd71okc{content:attr(some-attribute)}', rtl: null },
          1,
        ],
      ]);
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
      ).toEqual({
        default: {
          ':hover_backgroundColor': 'x1gykpug',
          ':hover_color': 'x17z2mba',
        },
      });

      expect(metadata).toEqual([
        [
          'x1gykpug',
          { ltr: '.x1gykpug:hover{background-color:red}', rtl: null },
          8,
        ],
        ['x17z2mba', { ltr: '.x17z2mba:hover{color:blue}', rtl: null }, 8],
      ]);
    });

    test('transforms array values as fallbacks', () => {
      expect(
        stylex.create({
          default: {
            position: ['sticky', 'fixed'],
          },
        })
      ).toEqual({
        default: {
          position: 'x1ruww2u',
        },
      });

      expect(metadata).toEqual([
        [
          'x1ruww2u',
          { ltr: '.x1ruww2u{position:sticky;position:fixed}', rtl: null },
          1,
        ],
      ]);
    });

    // TODO: add more vendor-prefixed properties and values
    test('transforms properties requiring vendor prefixes', () => {
      expect(
        stylex.create({
          default: {
            userSelect: 'none',
          },
        })
      ).toEqual({
        default: {
          userSelect: 'x87ps6o',
        },
      });

      expect(metadata).toEqual([
        ['x87ps6o', { ltr: '.x87ps6o{user-select:none}', rtl: null }, 1],
      ]);
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
      ).toEqual({
        default: {
          overflowX: 'x6ikm8r',
          overflowY: 'x10wlt62',
          borderTopStyle: 'xlya59e',
          borderEndStyle: 'x157eodl',
          borderBottomStyle: 'xpvcztv',
          borderStartStyle: 'x1q04ism',
          borderTopWidth: 'x178xt8z',
          borderEndWidth: 'xm81vs4',
          borderBottomWidth: 'xso031l',
          borderStartWidth: 'xy80clv',
        },
      });

      expect(metadata).toEqual([
        ['x6ikm8r', { ltr: '.x6ikm8r{overflow-x:hidden}', rtl: null }, 1],
        ['x10wlt62', { ltr: '.x10wlt62{overflow-y:hidden}', rtl: null }, 1],
        ['xlya59e', { ltr: '.xlya59e{border-top-style:dashed}', rtl: null }, 1],
        [
          'x157eodl',
          {
            ltr: '.x157eodl{border-right-style:dashed}',
            rtl: '.x157eodl{border-left-style:dashed}',
          },
          1,
        ],
        [
          'xpvcztv',
          { ltr: '.xpvcztv{border-bottom-style:dashed}', rtl: null },
          1,
        ],
        [
          'x1q04ism',
          {
            ltr: '.x1q04ism{border-left-style:dashed}',
            rtl: '.x1q04ism{border-right-style:dashed}',
          },
          1,
        ],
        ['x178xt8z', { ltr: '.x178xt8z{border-top-width:1px}', rtl: null }, 1],
        [
          'xm81vs4',
          {
            ltr: '.xm81vs4{border-right-width:1px}',
            rtl: '.xm81vs4{border-left-width:1px}',
          },
          1,
        ],
        ['xso031l', { ltr: '.xso031l{border-bottom-width:1px}', rtl: null }, 1],
        [
          'xy80clv',
          {
            ltr: '.xy80clv{border-left-width:1px}',
            rtl: '.xy80clv{border-right-width:1px}',
          },
          1,
        ],
      ]);
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
      ).toEqual({
        foo: {
          color: 'xju2f9n',
        },
      });
    });

    test('Uses stylex.firstThatWorks correctly', () => {
      expect(stylex.firstThatWorks('sticky', 'fixed')).toEqual([
        'fixed',
        'sticky',
      ]);
    });

    test('transforms complex property values containing custom properties variables', () => {
      expect(
        stylex.create({
          default: {
            boxShadow: '0px 2px 4px var(--shadow-1)',
          },
        })
      ).toEqual({
        default: {
          boxShadow: 'xxnfx33',
        },
      });

      expect(metadata).toEqual([
        [
          'xxnfx33',
          { ltr: '.xxnfx33{box-shadow:0 2px 4px var(--shadow-1)}', rtl: null },
          1,
        ],
      ]);
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
        ).toEqual({
          default: {
            ':invalpwdijad_backgroundColor': 'x19iys6w',
            ':invalpwdijad_color': 'x5z3o4w',
          },
        });

        expect(metadata).toEqual([
          [
            'x19iys6w',
            { ltr: '.x19iys6w:invalpwdijad{background-color:red}', rtl: null },
            2,
          ],
          [
            'x5z3o4w',
            { ltr: '.x5z3o4w:invalpwdijad{color:blue}', rtl: null },
            2,
          ],
        ]);
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
        ).toEqual({
          default: {
            ':hover_color': 'x17z2mba',
            ':active_color': 'x96fq8s',
            ':focus_color': 'x1wvtd7d',
            ':nth-child(2n)_color': 'x126ychx',
          },
        });

        expect(metadata).toEqual([
          ['x17z2mba', { ltr: '.x17z2mba:hover{color:blue}', rtl: null }, 8],
          ['x96fq8s', { ltr: '.x96fq8s:active{color:red}', rtl: null }, 10],
          ['x1wvtd7d', { ltr: '.x1wvtd7d:focus{color:yellow}', rtl: null }, 9],
          [
            'x126ychx',
            { ltr: '.x126ychx:nth-child(2n){color:purple}', rtl: null },
            6,
          ],
        ]);
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
        ).toEqual({
          default: {
            ':hover_position': 'x1nxcus0',
          },
        });

        expect(metadata).toEqual([
          [
            'x1nxcus0',
            {
              ltr: '.x1nxcus0:hover{position:sticky;position:fixed}',
              rtl: null,
            },
            8,
          ],
        ]);
      });
    });
  });
});
