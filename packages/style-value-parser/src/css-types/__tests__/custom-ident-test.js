/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { CustomIdentifier } from '../custom-ident';
import { SubString } from '../../base-types';

describe('Test CSS Type: <custom-ident>', () => {
  test('parses CSS custom-ident types strings correctly', () => {
    expect(CustomIdentifier.parse.parse('foo')).toEqual(
      new CustomIdentifier('foo'),
    );
    expect(CustomIdentifier.parse.parse('nono79')).toEqual(
      new CustomIdentifier('nono79'),
    );
    expect(CustomIdentifier.parse.parse('ground-level')).toEqual(
      new CustomIdentifier('ground-level'),
    );
    expect(CustomIdentifier.parse.parse('-test')).toEqual(
      new CustomIdentifier('-test'),
    );
    expect(CustomIdentifier.parse.parse('_internal')).toEqual(
      new CustomIdentifier('_internal'),
    );
    expect(CustomIdentifier.parse.parse('\\22 toto')).toEqual(
      new CustomIdentifier('\\22 toto'),
    );
    expect(CustomIdentifier.parse.parse('bili\\.bob')).toEqual(
      new CustomIdentifier('bili\\.bob'),
    );
  });
  test('fails to parse invalid CSS custom-ident types strings', () => {
    /*
    34rem
    -12rad
    bili.bob
    --toto
    'bilibob'
    "bilibob"
    */
    expect(CustomIdentifier.parse.parse('34rem')).toBeInstanceOf(Error);
    expect(CustomIdentifier.parse.parse('-12rad')).toBeInstanceOf(Error);

    let subStr = new SubString('bili.bob');
    expect(CustomIdentifier.parse.run(subStr)).toEqual(
      new CustomIdentifier('bili'),
    );
    expect(subStr.toString()).toEqual('.bob');

    subStr = new SubString('--toto');
    expect(CustomIdentifier.parse.run(subStr)).toBeInstanceOf(Error);
    expect(subStr.toString()).toEqual('--toto');

    subStr = new SubString("'bilibob'");
    expect(CustomIdentifier.parse.run(subStr)).toBeInstanceOf(Error);
    expect(subStr.toString()).toEqual("'bilibob'");

    subStr = new SubString('"bilibob"');
    expect(CustomIdentifier.parse.run(subStr)).toBeInstanceOf(Error);
    expect(subStr.toString()).toEqual('"bilibob"');
  });
});
