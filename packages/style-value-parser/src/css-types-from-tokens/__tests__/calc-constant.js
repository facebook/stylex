/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { calcConstant } from '../calc-constant';

describe('calcConstant', () => {
  it('should parse valid calc constants', () => {
    expect(calcConstant.parseToEnd('pi')).toBe('pi');
    expect(calcConstant.parseToEnd('e')).toBe('e');
    expect(calcConstant.parseToEnd('infinity')).toBe('infinity');
    expect(calcConstant.parseToEnd('-infinity')).toBe('-infinity');
    expect(calcConstant.parseToEnd('NaN')).toBe('NaN');
  });

  it('should not parse invalid calc constants', () => {
    expect(() => calcConstant.parseToEnd('invalid')).toThrow();
    expect(() => calcConstant.parseToEnd('123')).toThrow();
  });
});
