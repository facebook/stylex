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

const themeName = 'TestTheme.stylex.js//buttonTheme';
const classNamePrefix = 'x';

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
      [classNamePrefix + createHash(`${themeName}.sm`)]: {
        constKey: 'sm',
        constVal: '(min-width: 768px)',
        key: classNamePrefix + createHash(`${themeName}.sm`),
        rtl: null,
        ltr: '',
        priority: 0,
      },
      [classNamePrefix + createHash(`${themeName}.md`)]: {
        constKey: 'md',
        constVal: '(min-width: 1024px)',
        key: classNamePrefix + createHash(`${themeName}.md`),
        rtl: null,
        ltr: '',
        priority: 0,
      },
    });

    expect(
      injectableStyles[classNamePrefix + createHash(`${themeName}.sm`)].key,
    ).not.toBe(
      injectableStyles[classNamePrefix + createHash(`${themeName}.md`)].key,
    );
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
      [classNamePrefix + createHash(`${themeName}.max-width`)]: {
        constKey: 'max-width',
        constVal: '1200px',
        key: classNamePrefix + createHash(`${themeName}.max-width`),
        rtl: null,
        ltr: '',
        priority: 0,
      },
      [classNamePrefix + createHash(`${themeName}.font-size*large`)]: {
        constKey: 'font-size*large',
        constVal: '18px',
        key: classNamePrefix + createHash(`${themeName}.font-size*large`),
        rtl: null,
        ltr: '',
        priority: 0,
      },
    });

    expect(
      injectableStyles[classNamePrefix + createHash(`${themeName}.max-width`)]
        .key,
    ).not.toBe(
      injectableStyles[
        classNamePrefix + createHash(`${themeName}.font-size*large`)
      ].key,
    );
  });

  test('handles numeric keys by prefixing with underscore', () => {
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
      [classNamePrefix + createHash(`${themeName}.1`)]: {
        constKey: '1',
        constVal: 'one',
        key: classNamePrefix + createHash(`${themeName}.1`),
        rtl: null,
        ltr: '',
        priority: 0,
      },
      [classNamePrefix + createHash(`${themeName}.2`)]: {
        constKey: '2',
        constVal: 'two',
        key: classNamePrefix + createHash(`${themeName}.2`),
        rtl: null,
        ltr: '',
        priority: 0,
      },
    });

    expect(
      injectableStyles[classNamePrefix + createHash(`${themeName}.1`)].key,
    ).not.toBe(
      injectableStyles[classNamePrefix + createHash(`${themeName}.2`)].key,
    );
  });

  test('generates consistent hashes for identical constants', () => {
    const constants = { padding: '10px' };

    const [jsOutput1, styles1] = styleXDefineConsts(constants, { themeName });
    const [jsOutput2, styles2] = styleXDefineConsts(constants, { themeName });

    const keyHash = classNamePrefix + createHash(`${themeName}.padding`);

    expect(jsOutput1).toEqual(jsOutput2);
    expect(styles1[keyHash].key).toBe(styles2[keyHash].key);
  });

  test('generates different hashes for different constants', () => {
    const constants1 = { padding: '10px' };
    const constants2 = { margin: '10px' };

    const [_, styles1] = styleXDefineConsts(constants1, { themeName });
    const [__, styles2] = styleXDefineConsts(constants2, { themeName });

    const paddingKey = classNamePrefix + createHash(`${themeName}.padding`);
    const marginKey = classNamePrefix + createHash(`${themeName}.margin`);

    expect(styles1[paddingKey].key).not.toBe(styles2[marginKey].key);
  });

  test('preserves object keys', () => {
    const constants = {
      borderRadius: '8px',
      colorPrimary: '#ff0000',
    };

    const [jsOutput, _] = styleXDefineConsts(constants, { themeName });

    expect(Object.keys(jsOutput)).toEqual(['borderRadius', 'colorPrimary']);
  });
});
