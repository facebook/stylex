/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Time } from '../time';

describe('Time.parse', () => {
  it('parses valid CSS <time> types strings correctly', () => {
    expect(Time.parse.parseToEnd('1s')).toEqual(new Time(1, 's'));
    expect(Time.parse.parseToEnd('1000ms')).toEqual(new Time(1000, 'ms'));
    expect(Time.parse.parseToEnd('0s')).toEqual(new Time(0, 's'));
    expect(Time.parse.parseToEnd('0ms')).toEqual(new Time(0, 'ms'));
    expect(Time.parse.parseToEnd('1.5s')).toEqual(new Time(1.5, 's'));
    expect(Time.parse.parseToEnd('1.5ms')).toEqual(new Time(1.5, 'ms'));
  });

  it('fails to parse invalid CSS <time> types strings', () => {
    expect(() => Time.parse.parseToEnd('1 s')).toThrow();
    expect(() => Time.parse.parseToEnd('1ms ')).toThrow();
    expect(() => Time.parse.parseToEnd('1')).toThrow();
    expect(() => Time.parse.parseToEnd('s')).toThrow();
    expect(() => Time.parse.parseToEnd('ms')).toThrow();
  });
});
