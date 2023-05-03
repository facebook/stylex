/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const LENGTH_REGEX = /^([0-9]*[.]?[0-9]+)(em|px|rem|vh|vmax|vmin|vw)$/;

type CSSLengthUnitType = 'em' | 'px' | 'rem' | 'vh' | 'vmax' | 'vmin' | 'vw';

// TODO: this only works on simple values
export class CSSLengthUnitValue {
  static parse(inp: string): CSSLengthUnitValue | null {
    const match = inp.match(LENGTH_REGEX);
    if (match == null) {
      return null;
    }
    const [, value, unit] = match;
    const parsedValue = parseFloat(value);
    // $FlowFixMe
    return new CSSLengthUnitValue(parsedValue, unit);
  }

  value: number;
  unit: CSSLengthUnitType;

  constructor(value: number, unit: CSSLengthUnitType) {
    this.value = value;
    this.unit = unit;
  }

  resolvePixelValue(
    viewportWidth: number,
    viewportHeight: number,
    fontScale: number,
    inheritedFontSize: ?number
  ): number {
    const unit = this.unit;
    const value = this.value;
    const valuePercent = value / 100;
    switch (unit) {
      case 'em': {
        if (inheritedFontSize == null) {
          return fontScale * 16 * value;
        } else {
          return inheritedFontSize * value;
        }
      }
      case 'px': {
        return value;
      }
      case 'rem': {
        return fontScale * 16 * value;
      }
      case 'vh': {
        return viewportHeight * valuePercent;
      }
      case 'vmin': {
        return Math.min(viewportWidth, viewportHeight) * valuePercent;
      }
      case 'vmax': {
        return Math.max(viewportWidth, viewportHeight) * valuePercent;
      }
      case 'vw': {
        return viewportWidth * valuePercent;
      }
      default: {
        console.error(`[stylex]: Unsupported unit of "${unit}"`);
        return 0;
      }
    }
  }
}
