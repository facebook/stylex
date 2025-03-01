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
    expect(CustomIdentifier.parser.parse('myIdentifier')).toEqual(
      new CustomIdentifier('myIdentifier'),
    );
    expect(CustomIdentifier.parser.parse('custom-name')).toEqual(
      new CustomIdentifier('custom-name'),
    );
    expect(CustomIdentifier.parser.parse('_private')).toEqual(
      new CustomIdentifier('_private'),
    );
    expect(CustomIdentifier.parser.parse('identifier123')).toEqual(
      new CustomIdentifier('identifier123'),
    );
  });

  test('rejects reserved keywords', () => {
    expect(() => CustomIdentifier.parser.parseToEnd('unset')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('initial')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('inherit')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('default')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('none')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('auto')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('normal')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('hidden')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('visible')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('revert')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('revert-layer')).toThrow();
  });

  test('rejects invalid identifiers', () => {
    expect(() => CustomIdentifier.parser.parseToEnd('123invalid')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('invalid!')).toThrow();
    expect(() => CustomIdentifier.parser.parseToEnd('invalid space')).toThrow();
  });
});
