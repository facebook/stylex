/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow strict
 */

import normalizeValue from './utils/normalize-value';

/**
 * Convert a CSS value in JS to the final CSS string value
 */
export default function transformValue(
  key: string,
  rawValue: string | number
): string {
  const value =
    typeof rawValue === 'number'
      ? String(Math.round(rawValue * 10000) / 10000) + getNumberSuffix(key)
      : rawValue;

  // content is one of the values that needs to wrapped in quotes.
  // Users may write `''` without thinking about it, so we fix that.
  if (key === 'content' && typeof value === 'string') {
    const val = value.trim();
    if (val.match(/^attr\([a-zA-Z0-9-]+\)$/)) {
      return val;
    }
    if (
      !(
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
    ) {
      return `"${val}"`;
    }
  }

  return normalizeValue(value, key);
}

function getNumberSuffix(key: string) {
  if (unitlessNumberProperties.has(key)) {
    return '';
  }

  const suffix = numberPropertySuffixes[key];
  if (suffix == null) {
    return 'px';
  } else {
    return suffix;
  }
}

const unitlessNumberProperties = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'columnCount',
  'flex', // Unsupported
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexOrder',
  'gridRow',
  'gridColumn',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
]);

// List of properties that have custom suffixes for numbers
const numberPropertySuffixes = {
  animationDelay: 'ms',
  animationDuration: 'ms',
  transitionDelay: 'ms',
  transitionDuration: 'ms',
  voiceDuration: 'ms',
};
