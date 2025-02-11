/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { CustomIdentifier } from '../custom-ident';

describe('Test CSS Type: <custom-ident>', () => {
  test('parses valid custom identifiers', () => {
    expect(CustomIdentifier.parse.parse('myIdentifier')).toEqual(
      new CustomIdentifier('myIdentifier'),
    );
    expect(CustomIdentifier.parse.parse('custom-name')).toEqual(
      new CustomIdentifier('custom-name'),
    );
    expect(CustomIdentifier.parse.parse('_private')).toEqual(
      new CustomIdentifier('_private'),
    );
    expect(CustomIdentifier.parse.parse('identifier123')).toEqual(
      new CustomIdentifier('identifier123'),
    );
  });

  // test('rejects reserved keywords', () => {
  //   expect(() => CustomIdentifier.parse.parseToEnd('unset')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('initial')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('inherit')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('default')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('none')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('auto')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('normal')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('hidden')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('visible')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('revert')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('revert-layer')).toThrow();
  // });

  // test('rejects invalid identifiers', () => {
  //   expect(() => CustomIdentifier.parse.parseToEnd('123invalid')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('-invalid')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('invalid!')).toThrow();
  //   expect(() => CustomIdentifier.parse.parseToEnd('invalid space')).toThrow();
  // });
});
