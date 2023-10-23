/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { stylex } from '../stylex';

const mockOptions = {
  customProperties: {
    testVar: 'red',
    testVar2: 'blue',
    boxShadowVar1: '5px 5px 5px black',
    rawNumber: 10,
    pixelNumber: '10px',
    emNumber: '10em',
    refToRawNumber: 'var(--rawNumber)',
    refToPixelNumber: 'var(--pixelNumber)',
    refToRefToRawNumber: 'var(--refToRawNumber)',
  },
  viewportHeight: 600,
  viewportWidth: 320,
};

function resolveColorValue(colorValue) {
  const styles = stylex.create({
    root: {
      color: colorValue,
    },
  });
  return stylex.props(styles.root, mockOptions).style.color;
}

describe('stylex CSSCustomProperty value test', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('parses a basic variable correctly', () => {
    expect(resolveColorValue('var(--testVar)')).toEqual('red');
  });

  test('parses kebab case to camel case', () => {
    expect(resolveColorValue('var(--test-var)')).toEqual('red');
  });

  test('parses a variable with a default value', () => {
    expect(resolveColorValue('var(--testVar, blue)')).toEqual('red');
    expect(resolveColorValue('var(--notFound, blue)')).toEqual('blue');
  });

  test('parses kebab case with a default value', () => {
    expect(resolveColorValue('var(--test-var, blue)')).toEqual('red');
    expect(resolveColorValue('var(--not-found, blue)')).toEqual('blue');
  });

  test('parses a variable with a default value with spaces', () => {
    const styles = stylex.create({
      root: {
        boxShadow: 'var(--boxShadowVar1, 0px 0px 0px black)',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('falls back to a default value with spaces', () => {
    const styles = stylex.create({
      root: {
        boxShadow: 'var(--boxShadowVarNotFound, 0px 0px 0px black)',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('parses and falls back to default value containing a variable', () => {
    const styles = stylex.create({
      root: {
        color: 'var(--colorNotFound, var(--testVar2))',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('parses and falls back to a default value containing spaces and embedded variables', () => {
    const styles = stylex.create({
      root: {
        boxShadow: 'var(--boxShadowVarNotFound, 0px 0px 0px var(--testVar2))',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('does not parse malformed vars', () => {
    expect(resolveColorValue('var(--testUnfinished')).toEqual(
      'var(--testUnfinished',
    );
    expect(resolveColorValue('var(bad--input)')).toEqual('var(bad--input)');
    expect(resolveColorValue('--testMulti')).toEqual('--testMulti');
    expect(resolveColorValue('var ( --testMulti)')).toEqual(
      'var ( --testMulti)',
    );
  });

  test('basic value lookup works', () => {
    const styles = stylex.create({
      root: {
        borderWidth: 10,
      },
      withVars: {
        borderWidth: 'var(--rawNumber)',
      },
    });
    const rootStyle = stylex.props(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
    expect(
      stylex.props(styles.withVars, mockOptions).style.borderWidth,
    ).toEqual(rootStyle.borderWidth);
  });

  test('value lookup with pixel prop conversion', () => {
    const styles = stylex.create({
      root: {
        borderWidth: '10px',
      },
      withVars: {
        borderWidth: 'var(--pixelNumber)',
      },
    });
    const rootStyle = stylex.props(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
    expect(
      stylex.props(styles.withVars, mockOptions).style.borderWidth,
    ).toEqual(rootStyle.borderWidth);
  });

  test('value lookup with em prop conversion', () => {
    const styles = stylex.create({
      root: {
        fontSize: '10em',
      },
      withVars: {
        fontSize: 'var(--emNumber)',
      },
    });
    const rootStyle = stylex.props(styles.root, mockOptions).style;
    expect(rootStyle.fontSize).toEqual(160);
    expect(stylex.props(styles.withVars, mockOptions).style.fontSize).toEqual(
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
    const rootStyle = stylex.props(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
    expect(
      stylex.props(styles.withVars, mockOptions).style.borderWidth,
    ).toEqual(rootStyle.borderWidth);
  });

  test('prop lookup with ref to ref', () => {
    const styles = stylex.create({
      root: {
        borderWidth: 'var(--refToRefToRawNumber)',
      },
    });
    const rootStyle = stylex.props(styles.root, mockOptions).style;
    expect(rootStyle.borderWidth).toEqual(10);
  });
});
