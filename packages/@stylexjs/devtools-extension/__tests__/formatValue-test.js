/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  formatCssValueForDisplay,
  isLongCssValue,
} from '../src/panel/declarations/formatValue';

test('leaves short values unchanged', () => {
  expect(formatCssValueForDisplay('var(--color)')).toBe('var(--color)');
  expect(isLongCssValue('var(--color)')).toBe(false);
});

test('puts long function arguments on separate lines', () => {
  const first = 'calc(var(--width) / var(--scale) * 100vw)';
  const second = 'calc(var(--height) / var(--scale) * 100vh)';
  const third = 'calc(var(--depth) / var(--scale) * 100vmin)';
  const value = `clamp(${first}, ${second}, ${third})`;

  expect(isLongCssValue(value)).toBe(true);
  expect(formatCssValueForDisplay(value)).toBe(
    `clamp(\n  ${first},\n  ${second},\n  ${third}\n)`,
  );
});

test('recursively formats long function arguments', () => {
  const expression = [
    'var(--x1ak3ttg) / var(--x1rlgl0p)',
    'var(--x1r8612k) / var(--x8971gi)',
    'var(--x1q2bivm) * 100vw',
  ].join(' + ');
  const calculation = `calc(${expression})`;
  const value = `clamp(${calculation}, ${calculation}, ${calculation})`;

  expect(formatCssValueForDisplay(value)).toBe(
    [
      'clamp(',
      '  calc(',
      `    ${expression}`,
      '  ),',
      '  calc(',
      `    ${expression}`,
      '  ),',
      '  calc(',
      `    ${expression}`,
      '  )',
      ')',
    ].join('\n'),
  );
});

test('does not split commas inside strings or nested functions', () => {
  const fallback = 'color-mix(in oklab, rgb(0, 0, 0) 20%, rgb(255, 255, 255))';
  const value = `var(--a-very-long-custom-property-name, ${fallback})`;
  const formatted = formatCssValueForDisplay(value);

  expect(formatted).toContain(
    '  --a-very-long-custom-property-name,\n  color-mix(',
  );
  expect(formatted).toContain(
    'color-mix(in oklab, rgb(0, 0, 0) 20%, rgb(255, 255, 255))',
  );
});
