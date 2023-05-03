/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const CUSTOM_PROPERTY_REGEX: RegExp = /^var\(--(.+)\)$/;

function camelize(s: string): string {
  return s.replace(/-./g, (x) => x.toUpperCase()[1]);
}

export function isCustomPropertyValue(value: mixed): boolean {
  return typeof value === 'string' && CUSTOM_PROPERTY_REGEX.test(value);
}

export class CSSCustomPropertyValue {
  name: string;
  constructor(value: string) {
    const found = value.match(CUSTOM_PROPERTY_REGEX);
    if (found == null) {
      throw new Error(
        '[stylex]: Unable to find custom property reference in input string'
      );
    }
    const [, kebabCasePropName] = found;
    this.name = camelize(kebabCasePropName);
  }
}
