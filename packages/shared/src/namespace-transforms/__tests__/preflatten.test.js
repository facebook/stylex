/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 *
 */

import preflatten from '../preflatten';
import { RawRule, RawRuleList } from '../../utils/Rule';

describe('preflatten', () => {
  test('flattens a simple style object', () => {
    const input = {
      color: 'red',
      backgroundColor: 'blue',
    };
    const output = {
      color: new RawRule('color', 'red', [], []),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
    };
    expect(preflatten(input)).toEqual(output);
  });

  test('flattens styles with fallback styles', () => {
    const input = {
      color: ['red', 'blue'],
      backgroundColor: 'blue',
    };
    const output = {
      color: new RawRuleList([
        new RawRule('color', 'red', [], []),
        new RawRule('color', 'blue', [], []),
      ]),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
    };
    expect(preflatten(input)).toEqual(output);
  });

  test('flattens a simple style object with a nested pseudo styles', () => {
    const input = {
      color: 'red',
      backgroundColor: 'blue',
      ':hover': {
        color: 'green',
      },
    };
    const output = {
      color: new RawRule('color', 'red', [], []),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
      ':hover_color': new RawRule('color', 'green', [':hover'], []),
    };
    expect(preflatten(input)).toEqual(output);
  });

  test('flattens a simple style object with a nested at-rule styles', () => {
    const input = {
      color: 'red',
      backgroundColor: 'blue',
      '@media (min-width: 600px)': {
        color: 'green',
      },
    };
    const output = {
      color: new RawRule('color', 'red', [], []),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
      '@media (min-width: 600px)_color': new RawRule(
        'color',
        'green',
        [],
        ['@media (min-width: 600px)']
      ),
    };
    expect(preflatten(input)).toEqual(output);
  });

  test('flattens style object with nested pseudo in property', () => {
    const input = {
      color: {
        default: 'red',
        ':hover': 'green',
        ':active': 'blue',
      },
      backgroundColor: 'blue',
    };
    const output = {
      color: new RawRuleList([
        new RawRule('color', 'red', [], []),
        new RawRule('color', 'green', [':hover'], []),
        new RawRule('color', 'blue', [':active'], []),
      ]),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
    };
    expect(preflatten(input)).toEqual(output);
  });

  test('flattens style object with nested media queries', () => {
    const input = {
      color: {
        default: 'red',
        '@media (max-width: 600px)': 'green',
        '@media (min-width: 600px and max-width: 900px)': 'blue',
      },
      backgroundColor: 'blue',
    };
    const output = {
      color: new RawRuleList([
        new RawRule('color', 'red', [], []),
        new RawRule('color', 'green', [], ['@media (max-width: 600px)']),
        new RawRule(
          'color',
          'blue',
          [],
          ['@media (min-width: 600px and max-width: 900px)']
        ),
      ]),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
    };
    expect(preflatten(input)).toEqual(output);
  });

  test('flattens style object with nested media queries and pseudo', () => {
    const input = {
      color: {
        default: 'red',
        '@media (max-width: 600px)': {
          default: 'green',
          ':hover': 'blue',
        },
        '@media (min-width: 600px and max-width: 900px)': {
          default: 'blue',
          ':hover': 'green',
        },
      },
      backgroundColor: 'blue',
    };
    const output = {
      color: new RawRuleList([
        new RawRule('color', 'red', [], []),
        new RawRule('color', 'green', [], ['@media (max-width: 600px)']),
        new RawRule('color', 'blue', [':hover'], ['@media (max-width: 600px)']),
        new RawRule(
          'color',
          'blue',
          [],
          ['@media (min-width: 600px and max-width: 900px)']
        ),
        new RawRule(
          'color',
          'green',
          [':hover'],
          ['@media (min-width: 600px and max-width: 900px)']
        ),
      ]),
      backgroundColor: new RawRule('backgroundColor', 'blue', [], []),
    };
    expect(preflatten(input)).toEqual(output);
  });
});
