/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
import { Appearance } from '../appearance';
describe('Test CSS property: `appearance`', () => {
  test('CSS Basic User Interface Module Level 4 values', () => {
    expect(Appearance.parse.parseToEnd('auto')).toEqual(new Appearance('auto'));
    expect(Appearance.parse.parseToEnd('none')).toEqual(new Appearance('none'));
    expect(Appearance.parse.parseToEnd('menulist-button')).toEqual(
      new Appearance('menulist-button'),
    );
    expect(Appearance.parse.parseToEnd('textfield')).toEqual(
      new Appearance('textfield'),
    );
  });
  test('CSS wide keyword values', () => {
    expect(Appearance.parse.parseToEnd('inherit')).toEqual(
      new Appearance('inherit'),
    );
    expect(Appearance.parse.parseToEnd('initial')).toEqual(
      new Appearance('initial'),
    );
    expect(Appearance.parse.parseToEnd('revert')).toEqual(
      new Appearance('revert'),
    );
    expect(Appearance.parse.parseToEnd('unset')).toEqual(
      new Appearance('auto'),
    );
  });
});
