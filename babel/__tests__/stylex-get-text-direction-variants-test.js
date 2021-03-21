/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @format
 */

'use strict';

const getTextDirectionVariants = require('../src/get-text-direction-variants.js');

test('simple flips', () => {
  expect(getTextDirectionVariants('start', '5px')).toEqual({
    ltr: {
      key: 'left',
      value: '5px',
    },
    rtl: {
      key: 'right',
      value: '5px',
    },
  });
});

const tests = {
  float: [['start', 'left', 'right'], ['end', 'right', 'left']],

  'border-radius': [
    ['0 1px 2px 3em', '0 1px 2px 3em', '1px 0 3em 2px'],
    ['0 1px 2px', '0 1px 2px', '1px 0 1px 2px'],
    ['0 1px', '0 1px', '1px 0'],
    ['1px', '1px', '1px'],

    [
      '0 1px 2px 3em / 4ex 5% 6pc 7pt',
      '0 1px 2px 3em / 4ex 5% 6pc 7pt',
      '1px 0 3em 2px / 5% 4ex 7pt 6pc',
    ],
    ['0 1px 2px 3em / 4ex', '0 1px 2px 3em / 4ex', '1px 0 3em 2px / 4ex'],
    [
      '0 1px 3em / 4ex 5% 6pc 7pt',
      '0 1px 3em / 4ex 5% 6pc 7pt',
      '1px 0 1px 3em / 5% 4ex 7pt 6pc',
    ],
    [
      '1px 3em / 4ex 6pc 7pt',
      '1px 3em / 4ex 6pc 7pt',
      '3em 1px / 6pc 4ex 6pc 7pt',
    ],
  ],

  cursor: [
    ['w-resize', 'w-resize', 'e-resize'],
    ['e-resize', 'e-resize', 'w-resize'],
    ['ne-resize', 'ne-resize', 'nw-resize'],
    ['nw-resize', 'nw-resize', 'ne-resize'],
    ['se-resize', 'se-resize', 'sw-resize'],
    ['sw-resize', 'sw-resize', 'se-resize'],
  ],

  // margin/padding/border-color/border-width/border-style
  padding: [
    ['5px', '5px', '5px'],
    ['1px 2px', '1px 2px', '1px 2px'],
    ['1px 2px 3px', '1px 2px 3px', '1px 2px 3px'],
    ['1px 2px 3px 4px', '1px 2px 3px 4px', '1px 4px 3px 2px'],
  ],

  // text-shadow
  'box-shadow': [
    ['none', 'none', 'none'],
    ['0 0 #000', '0 0 #000', '0 0 #000'],
    ['1px 1px #000', '1px 1px #000', '-1px 1px #000'],
    ['-1px -1px #000', '-1px -1px #000', '1px -1px #000'],
    ['0.5px 0 #000', '0.5px 0 #000', '-0.5px 0 #000'],
    ['inset 2px 0 #000', 'inset 2px 0 #000', 'inset -2px 0 #000'],
    ['inset -2px 0 #000', 'inset -2px 0 #000', 'inset 2px 0 #000'],
    ['-2px 0 0 1px #000', '-2px 0 0 1px #000', '2px 0 0 1px #000'],
    [
      '-2px 0 0 1px #000, 2px 0 0 1px #000',
      '-2px 0 0 1px #000, 2px 0 0 1px #000',
      '2px 0 0 1px #000, -2px 0 0 1px #000',
    ],
    [
      'inset -2px 0 0 1px #000, inset 2px 0 0 1px #000',
      'inset -2px 0 0 1px #000, inset 2px 0 0 1px #000',
      'inset 2px 0 0 1px #000, inset -2px 0 0 1px #000',
    ],
    [
      'inset -2px 0 0 1px rgba(255, 255, 255, 0.1)',
      'inset -2px 0 0 1px rgba(255, 255, 255, 0.1)',
      'inset 2px 0 0 1px rgba(255, 255, 255, 0.1)',
    ],
  ],

  background: [
    [
      'url(/foo/bar.png) top start',
      'url(/foo/bar.png) top left',
      'url(/foo/bar.png) top right',
    ],
    [
      'url(/foo/bar.png) top end',
      'url(/foo/bar.png) top right',
      'url(/foo/bar.png) top left',
    ],
  ],

  'background-position': [
    ['top start', 'top left', 'top right'],
    ['top end', 'top right', 'top left'],
  ],
};

for (const [key, testData] of Object.entries(tests)) {
  test(key, () => {
    for (const [input, left, right] of testData) {
      expect(getTextDirectionVariants(key, input)).toEqual({
        ltr: {
          key,
          value: left,
        },
        rtl:
          left === right
            ? null
            : {
                key,
                value: right,
              },
      });
    }
  });
}
