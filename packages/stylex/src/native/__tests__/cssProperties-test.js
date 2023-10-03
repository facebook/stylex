/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { stylex } from '../stylex';

const mockOptions = {
  customProperties: {
    rawNumber: 10,
    pixelNumber: '10px',
    emNumber: '10em',
    refToRawNumber: 'var(--rawNumber)',
    refToPixelNumber: 'var(--pixelNumber)',
    refToRefToRawNumber: 'var(--refToRawNumber)',
  },
  viewportHeight: 600,
  viewportWidth: 320,
  fontScale: 1,
};

describe('styles', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('basic prop lookup', () => {
    const styles = stylex.create({
      root: {
        borderWidth: 10,
      },
      withVars: {
        borderWidth: 'var(--rawNumber)',
      },
    });
    const rootStyle = stylex.spread(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
    expect(
      stylex.spread(styles.withVars, mockOptions).style.borderWidth,
    ).toEqual(rootStyle.borderWidth);
  });

  test('pixel prop lookup', () => {
    const styles = stylex.create({
      root: {
        borderWidth: '10px',
      },
      withVars: {
        borderWidth: 'var(--pixelNumber)',
      },
    });
    const rootStyle = stylex.spread(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
    expect(
      stylex.spread(styles.withVars, mockOptions).style.borderWidth,
    ).toEqual(rootStyle.borderWidth);
  });

  test('em prop lookup', () => {
    const styles = stylex.create({
      root: {
        fontSize: '10em',
      },
      withVars: {
        fontSize: 'var(--emNumber)',
      },
    });
    const rootStyle = stylex.spread(styles.root, mockOptions).style;
    expect(rootStyle.fontSize).toEqual(160);
    expect(stylex.spread(styles.withVars, mockOptions).style.fontSize).toEqual(
      rootStyle.fontSize,
    );
  });

  test('prop lookup with ref', () => {
    const styles = stylex.create({
      root: {
        borderWidth: 'var(--refToRawNumber)',
      },
      withVars: {
        borderWidth: 'var(--refToPixelNumber)',
      },
    });
    const rootStyle = stylex.spread(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
    expect(
      stylex.spread(styles.withVars, mockOptions).style.borderWidth,
    ).toEqual(rootStyle.borderWidth);
  });

  test('prop lookup with ref to ref', () => {
    const styles = stylex.create({
      root: {
        borderWidth: 'var(--refToRefToRawNumber)',
      },
    });
    const rootStyle = stylex.spread(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
  });
});
