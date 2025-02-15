/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Frequency } from '../frequency';

describe('Frequency.parse', () => {
  it('parses valid CSS frequency types strings correctly', () => {
    expect(Frequency.parser.parseToEnd('1Hz')).toEqual(new Frequency(1, 'Hz'));
    expect(Frequency.parser.parseToEnd('1000KHz')).toEqual(
      new Frequency(1000, 'KHz'),
    );
    expect(Frequency.parser.parseToEnd('0Hz')).toEqual(new Frequency(0, 'Hz'));
    expect(Frequency.parser.parseToEnd('0KHz')).toEqual(
      new Frequency(0, 'KHz'),
    );
    expect(Frequency.parser.parseToEnd('1.5Hz')).toEqual(
      new Frequency(1.5, 'Hz'),
    );
    expect(Frequency.parser.parseToEnd('1.5KHz')).toEqual(
      new Frequency(1.5, 'KHz'),
    );
  });

  it('fails to parse invalid CSS frequency types strings', () => {
    expect(() => Frequency.parser.parseToEnd('1 Hz')).toThrow();
    expect(() => Frequency.parser.parseToEnd('1KHz ')).toThrow();
    expect(() => Frequency.parser.parseToEnd('1')).toThrow();
    expect(() => Frequency.parser.parseToEnd('Hz')).toThrow();
    expect(() => Frequency.parser.parseToEnd('KHz')).toThrow();
  });
});
