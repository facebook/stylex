/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * catch the css variable with an optional default parameter. breakdown:
 *   ^var\(--       start of sequence at start of input)
 *   ([\w-\+)       capture group 1: the variable name
 *   *              optional whitespace
 *   (?:            start of non-capturing group, used to group | clauses
 *     \)           (option1) end of sequence at end of input
 *     , *([^),]+)  (option2) capture group 2: the default parameter
 */
const CUSTOM_PROPERTY_REGEX: RegExp = /^var\(--([\w-]+) *(?:\)|, *(.+)\))$/;

function camelize(s: string): string {
  return s.replace(/-./g, (x) => x.toUpperCase()[1]);
}

/**
 * Either create a custom property value or return null if the input is not a string
 * containing a 'var(--name)' or 'var(--name, default)' sequence.
 *
 * Made this a single function to test and create to avoid parsing the RegExp twice.
 */
export function createCSSCustomPropertyValue(
  value: string,
): CSSCustomPropertyValue | null {
  if (typeof value === 'string') {
    const match = CUSTOM_PROPERTY_REGEX.exec(value);
    if (match) {
      return new CSSCustomPropertyValue(match[1], match[2]);
    }
  }
  return null;
}

/**
 * Class representing a custom property value with an optional fallback.
 */
export class CSSCustomPropertyValue {
  name: string;
  defaultValue: mixed;
  constructor(kebabCasePropName: string, fallback: mixed) {
    this.name = camelize(kebabCasePropName);
    this.defaultValue = fallback ?? null;
  }
}
