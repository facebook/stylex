/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import styleXDefineConsts from '../src/stylex-define-consts';
import createHash from '../src/hash';
import * as messages from '../src/messages';

const themeName = 'TestTheme.stylex.js//buttonTheme';
const classNamePrefix = 'x';

function getConstHash(key: string, value: string | number): string {
  return (
    classNamePrefix + createHash(`${themeName}.${key}`)
  );
}

describe('styleXDefineConsts', () => {
  test('returns correct structure for basic constants', () => {
    const constants = {
      sm: '(min-width: 768px)',
      md: '(min-width: 1024px)',
    };

    const [jsOutput, injectableStyles] = styleXDefineConsts(constants, {
      themeName,
    });

    expect(jsOutput).toEqual({
      sm: '(min-width: 768px)',
      md: '(min-width: 1024px)',
    });

    expect(injectableStyles).toMatchObject({
      [getConstHash('sm', constants.sm)]: {
        constVal: constants.sm,
        constKey: getConstHash('sm', constants.sm),
        rtl: null,
        ltr: '',
        priority: 0,
      },
      [getConstHash('md', constants.md)]: {
        constVal: constants.md,
        constKey: getConstHash('md', constants.md),
        rtl: null,
        ltr: '',
        priority: 0,
      },
    });

    expect(
      injectableStyles[getConstHash('sm', constants.sm)].constKey,
    ).not.toBe(injectableStyles[getConstHash('md', constants.md)].constKey);
  });

  test('handles special characters in keys', () => {
    const constants = {
      'max-width': '1200px',
      'font-size*large': '18px',
    };

    const [jsOutput, injectableStyles] = styleXDefineConsts(constants, {
      themeName,
    });

    expect(jsOutput).toEqual({
      'max-width': '1200px',
      'font-size*large': '18px',
    });

    expect(injectableStyles).toMatchObject({
      [getConstHash('max-width', constants['max-width'])]: {
        constVal: constants['max-width'],
        constKey: getConstHash('max-width', constants['max-width']),
        rtl: null,
        ltr: '',
        priority: 0,
      },
      [getConstHash('font-size*large', constants['font-size*large'])]: {
        constVal: constants['font-size*large'],
        constKey: getConstHash('font-size*large', constants['font-size*large']),
        rtl: null,
        ltr: '',
        priority: 0,
      },
    });

    expect(
      injectableStyles[getConstHash('max-width', constants['max-width'])]
        .constKey,
    ).not.toBe(
      injectableStyles[
        getConstHash('font-size*large', constants['font-size*large'])
      ].constKey,
    );
  });

  test('handles numeric keys', () => {
    const constants = {
      1: 'one',
      2: 'two',
    };

    const [jsOutput, injectableStyles] = styleXDefineConsts(constants, {
      themeName,
    });

    expect(jsOutput).toEqual({
      '1': 'one',
      '2': 'two',
    });

    expect(injectableStyles).toMatchObject({
      [getConstHash('1', constants[1])]: {
        constVal: constants[1],
        constKey: getConstHash('1', constants[1]),
        rtl: null,
        ltr: '',
        priority: 0,
      },
      [getConstHash('2', constants[2])]: {
        constVal: constants[2],
        constKey: getConstHash('2', constants[2]),
        rtl: null,
        ltr: '',
        priority: 0,
      },
    });

    expect(injectableStyles[getConstHash('1', constants[1])].constKey).not.toBe(
      injectableStyles[getConstHash('2', constants[2])].constKey,
    );
  });

  test('generates consistent hashes for identical constants', () => {
    const constants = { padding: '10px' };

    const [jsOutput1, styles1] = styleXDefineConsts(constants, { themeName });
    const [jsOutput2, styles2] = styleXDefineConsts(constants, { themeName });

    const keyHash = getConstHash('padding', constants.padding);

    expect(jsOutput1).toEqual(jsOutput2);
    expect(styles1[keyHash].constKey).toBe(styles2[keyHash].constKey);
  });

  test('generates different hashes for different constants', () => {
    const constants1 = { padding: '10px' };
    const constants2 = { margin: '10px' };

    const [_, styles1] = styleXDefineConsts(constants1, { themeName });
    const [__, styles2] = styleXDefineConsts(constants2, { themeName });

    const paddingKey = getConstHash('padding', constants1.padding);
    const marginKey = getConstHash('margin', constants2.margin);

    expect(styles1[paddingKey].constKey).not.toBe(styles2[marginKey].constKey);
  });

  test('preserves object keys', () => {
    const constants = {
      borderRadius: '8px',
      colorPrimary: '#ff0000',
    };

    const [jsOutput, _] = styleXDefineConsts(constants, { themeName });

    expect(Object.keys(jsOutput)).toEqual(['borderRadius', 'colorPrimary']);
  });

  test('throws an error for keys that start with --', () => {
    const constants = {
      '--custom-var': 'red',
    };

    expect(() => {
      styleXDefineConsts(constants, { themeName });
    }).toThrow(messages.INVALID_CONST_KEY);
  });
});
