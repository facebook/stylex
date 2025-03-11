/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Flex } from '../flex';

describe('Flex.parse', () => {
  it('parses valid `fr` values', () => {
    expect(Flex.parser.parseToEnd('1fr')).toEqual(new Flex(1));
    expect(Flex.parser.parseToEnd('2.5fr')).toEqual(new Flex(2.5));
    expect(Flex.parser.parseToEnd('0fr')).toEqual(new Flex(0));
  });

  it('rejects invalid `fr` values', () => {
    expect(() => Flex.parser.parseToEnd('-1fr')).toThrow();
    expect(() => Flex.parser.parseToEnd('1 fr')).toThrow();
    expect(() => Flex.parser.parseToEnd('1px')).toThrow();
  });
});
