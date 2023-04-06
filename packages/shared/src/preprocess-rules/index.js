/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions, TStyleValue } from '../common-types';

import applicationOrder from './application-order';
import legacyExpandShorthands from './legacy-expand-shorthands';
import propertySpecificity from './property-specificity';

const expansions = {
  'application-order': applicationOrder,
  'property-specificity': propertySpecificity,
  'legacy-expand-shorthands': legacyExpandShorthands,
};

export function getExpandedKeys(
  options: StyleXOptions
): $ReadOnlyArray<string> {
  return Object.keys(
    expansions[options.styleResolution ?? 'application-order']
  );
}

export default function flatMapExpandedShorthands(
  objEntry: [string, TStyleValue],
  options: StyleXOptions
): $ReadOnlyArray<[string, TStyleValue]> {
  const [key, value] = objEntry;
  const expansion: (
    string | number | null
  ) => $ReadOnlyArray<[string, TStyleValue]> =
    expansions[options.styleResolution ?? 'application-order'][key];
  if (expansion) {
    if (Array.isArray(value)) {
      throw new Error(
        'Cannot use fallbacks for shorthands. Use the expansion instead.'
      );
    }
    return expansion(value);
  }
  return [[key, value]];
}
