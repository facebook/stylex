/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function splitValue(
  borderValue: number | string
): Array<number | string | null> {
  if (typeof borderValue === 'number') {
    return [borderValue];
  }
  const values: string[] = [];
  let currentSegment = '';
  let withinQuotes = false;
  let withinFunction = false;

  for (let i = 0; i < borderValue.length; i++) {
    const char = borderValue[i];

    if (char === "'" || char === '"') {
      withinQuotes = !withinQuotes;
    } else if (char === '(' && !withinQuotes) {
      withinFunction = true;
    } else if (char === ')' && !withinQuotes) {
      withinFunction = false;
    }

    if (char === ' ' && !withinQuotes && !withinFunction) {
      if (currentSegment.length > 0) {
        values.push(currentSegment);
        currentSegment = '';
      }
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment.length > 0) {
    values.push(currentSegment);
  }

  return values;
}

const borderWidthKeywords = new Set(['thin', 'medium', 'thick']);
const borderStyleKeywords = new Set([
  'none',
  'hidden',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inside', // Non-standard
  'inset',
  'outset',
]);
const globalKeywords = new Set(['initial', 'inherit', 'unset']);

export function borderSplitter(
  value: string
): [number | string | null, string | null, string | null] {
  const borderParts: Array<number | string> = splitValue(value).filter(
    (val): val is number | string => val != null
  );

  const suffix = borderParts.some(
    (part) => typeof part === 'string' && part.endsWith('!important')
  )
    ? ' !important'
    : '';

  const parts = borderParts.map((part) =>
    typeof part === 'string' && part.endsWith('!important')
      ? part.replace('!important', '').trim()
      : part
  );

  if (
    parts.length === 1 &&
    typeof parts[0] === 'string' &&
    globalKeywords.has(parts[0])
  ) {
    return [parts[0], parts[0], parts[0]];
  }

  // Find the part that starts with a number
  // This is most likely to be the borderWidth
  let width = parts.find(
    (part) =>
      typeof part === 'number' ||
      (typeof part === 'string' &&
        (part.match(/^\.?\d+/) ||
          borderWidthKeywords.has(part) ||
          part.match(/^calc\(/)))
  );
  if (typeof width === 'number') {
    width = String(width) + 'px';
  }
  if (width != null) {
    parts.splice(parts.indexOf(width), 1);
  }
  if (parts.length === 0) {
    return [String(width) + suffix, null, null];
  }
  const style = parts.find(
    (part) => typeof part === 'string' && borderStyleKeywords.has(part)
  );
  if (style != null) {
    parts.splice(parts.indexOf(style), 1);
  }
  if (parts.length === 2 && width == null) {
    width = parts[0];
    parts.splice(0, 1);
  }
  if (width != null && parts.length > 1) {
    throw new Error('Invalid border shorthand value');
  }
  const color = parts[0];

  const withSuffix = (part: void | null | string | number) =>
    part != null ? part + suffix : null;

  return [withSuffix(width), withSuffix(style), withSuffix(color)];
}
