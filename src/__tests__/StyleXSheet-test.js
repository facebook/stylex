/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+comet_ui
 * @flow strict
 * @format
 */

'use strict';

import { StyleXSheet } from '../StyleXSheet';

const testOpts = {
  rootTheme: undefined,
  supportsVariables: true,
};

test('StyleXSheet.prototype.insert', () => {
  const sheet = new StyleXSheet(testOpts);

  expect(sheet.getRuleCount()).toBe(0);
  sheet.inject();
  expect(sheet.getRuleCount()).toBe(0);

  sheet.insert('.a {}', 0);
  expect(sheet.getRuleCount()).toBe(1);

  sheet.insert('.b {}', 0);
  expect(sheet.getRuleCount()).toBe(2);

  sheet.insert('.b {}', 0);
  expect(sheet.getRuleCount()).toBe(2);
});

test('StyleXSheet.prototype.insert respects priorities', () => {
  const sheet = new StyleXSheet(testOpts);

  sheet.insert('.last {}', 6);
  sheet.insert('.third {}', 3);
  sheet.insert('.first {}', 0);
  sheet.insert('.second {}', 1);

  expect(sheet.getCSS()).toMatchSnapshot();
});

test('StyleXSheet.prototype.insert respects priority floats', () => {
  const sheet = new StyleXSheet(testOpts);

  sheet.insert('.fourth {}', 6.8);
  sheet.insert('.third {}', 6.5);
  sheet.insert('.second {}', 6);
  sheet.insert('.first {}', 2);

  expect(sheet.getCSS()).toMatchSnapshot();
});

test('inlines variables for older browsers', () => {
  const sheet = new StyleXSheet({
    rootDarkTheme: { foo: 'reallydark' },
    rootTheme: { foo: 'bar' },
    supportsVariables: false,
  });

  sheet.insert('.foo {color: var(--foo)}', 1);

  expect(sheet.getCSS()).toMatchSnapshot();
});
