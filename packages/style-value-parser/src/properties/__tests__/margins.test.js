/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
import { Percentage } from '../../css-types/common-types';
import { Ch, Em, In, Px, Rem, Vh, Vw } from '../../css-types/length';
import {
  MarginDir,
  marginBlock,
  marginBlockEnd,
  marginBlockStart,
  marginBottom,
  marginInline,
  marginInlineEnd,
  marginInlineStart,
  marginLeft,
  marginRight,
  marginTop,
} from '../margins';
describe('Test CSS property: `margin`', () => {
  test('Test all margin CSS shorthand properties', () => {
    expect(marginTop.parse.parseToEnd('25px')).toEqual(
      new MarginDir(new Px(25)),
    );
    expect(marginLeft.parse.parseToEnd('5%')).toEqual(
      new MarginDir(new Percentage(5)),
    );
    expect(marginRight.parse.parseToEnd('5em')).toEqual(
      new MarginDir(new Em(5)),
    );
    expect(marginBottom.parse.parseToEnd('5vh')).toEqual(
      new MarginDir(new Vh(5)),
    );
    expect(marginBlock.parse.parseToEnd('5in')).toEqual(
      new MarginDir(new In(5)),
    );
    expect(marginBlockEnd.parse.parseToEnd('5vw')).toEqual(
      new MarginDir(new Vw(5)),
    );
    expect(marginBlockStart.parse.parseToEnd('5ch')).toEqual(
      new MarginDir(new Ch(5)),
    );
    expect(marginInline.parse.parseToEnd('5%')).toEqual(
      new MarginDir(new Percentage(5)),
    );
    expect(marginInlineEnd.parse.parseToEnd('5px')).toEqual(
      new MarginDir(new Px(5)),
    );
    expect(marginInlineStart.parse.parseToEnd('5rem')).toEqual(
      new MarginDir(new Rem(5)),
    );
  });

  test('CSS wide keyword values', () => {
    expect(marginTop.parse.parseToEnd('inherit')).toEqual(
      new MarginDir('inherit'),
    );
    expect(marginLeft.parse.parseToEnd('initial')).toEqual(
      new MarginDir('initial'),
    );
    expect(marginRight.parse.parseToEnd('revert')).toEqual(
      new MarginDir('revert'),
    );
    expect(marginBottom.parse.parseToEnd('unset')).toEqual(
      new MarginDir('unset'),
    );
  });
});
