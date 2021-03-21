/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @format
 */

'use strict';

jest.autoMockOff();

const normalizeValue = require('../src/normalize-value');

const testData = {
  'Normalize whitespace in functions': {
    input: {value: 'rgba( 1, 222,  33 , 0.5)', key: 'color'},
    output: 'rgba(1,222,33,.5)',
  },
  'Normalize whitespace in shorthands': {
    input: {value: ' 1px solid  blue'},
    output: '1px solid blue',
  },
  'Trim-right whitespace': {
    input: {value: '1px solid  blue '},
    output: '1px solid blue',
  },
  'No space before !important': {
    input: {value: '1px solid  blue !important'},
    output: '1px solid blue!important',
  },
  'No dimensions for 0 values': {
    input: {value: '0px 1px 0.5rem -1pt !important'},
    output: '0 1px .5rem -1pt!important',
  },
  '0 timings are all 0s': {
    input: {value: 'color 500ms cubic-bezier(0.08, 0.52, 0.52, 1) 0ms 0s'},
    output: 'color .5s cubic-bezier(.08,.52,.52,1) 0s 0s',
  },
  '0 angles are all 0deg': {
    input: {value: '0deg 0rad 0turn 0grad'},
    output: '0deg 0deg 0deg 0deg',
  },
  'calc() keeps spaces aroung + and -': {
    input: {value: 'calc((100% + 3% -   100px) / 7)'},
    output: 'calc((100% + 3% - 100px)/7)',
  },
  'strip leading zeros': {
    input: {value: 'cubic-bezier(0.08, 0.52, .52, 1) 50.01s 0.01s'},
    output: 'cubic-bezier(.08,.52,.52,1) 50.01s .01s',
  },
  'Convert timing values to seconds unless < 10ms': {
    input: {value: '1s 1234ms 500ms 100ms 10ms 1ms 90deg 0ms'},
    output: '1s 1.234s .5s .1s .01s 1ms 90deg 0s',
  },
  'Use double quotes in empty strings': {
    input: {value: "''"},
    output: '""',
  },
};

describe('stylex-normalize', () => {
  Object.keys(testData).forEach(name => {
    const data = testData[name];
    test(name, () => {
      expect(normalizeValue(data.input.value, data.input.key)).toBe(
        data.output,
      );
    });
  });
});
