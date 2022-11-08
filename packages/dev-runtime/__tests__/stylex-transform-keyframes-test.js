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

describe('Development Runtime Transformation', () => {
  describe('[transform] CSS keyframes', () => {
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

    test('converts keyframes to CSS', () => {
      expect(
        stylex.keyframes({
          from: {
            backgroundColor: 'red',
          },

          to: {
            backgroundColor: 'blue',
          },
        })
      ).toEqual('xbopttm-B');

      expect(metadata).toEqual([
        [
          'xbopttm-B',
          {
            ltr: '@keyframes xbopttm-B{from{background-color:red;}to{background-color:blue;}}',
            rtl: null,
          },
          1,
        ],
      ]);
    });

    test('allows template literal references to keyframes', () => {
      expect(
        stylex.keyframes({
          from: {
            backgroundColor: 'blue',
          },

          to: {
            backgroundColor: 'red',
          },
        })
      ).toEqual('x3zqmp-B');
    });

    test('generates RTL-specific keyframes', () => {
      const name = stylex.keyframes({
        from: {
          start: 0,
        },

        to: {
          start: 500,
        },
      });
      expect(name).toEqual('x1lvx8r0-B');

      expect(
        stylex.create({
          root: {
            animationName: name,
          },
        })
      ).toEqual({
        root: {
          $$css: true,
          animationName: 'x1ugarde',
        },
      });

      expect(metadata).toEqual([
        [
          'x1lvx8r0-B',
          {
            ltr: '@keyframes x1lvx8r0-B{from{left:0;}to{left:500px;}}',
            rtl: '@keyframes x1lvx8r0-B{from{right:0;}to{right:500px;}}',
          },
          1,
        ],
        [
          'x1ugarde',
          { ltr: '.x1ugarde{animation-name:x1lvx8r0-B}', rtl: null },
          1,
        ],
      ]);
    });
  });
});
