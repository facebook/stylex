/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from '../common-types';

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

export default function flatMapExpandedShorthands<T>(
  objEntry: [string, T],
  options: StyleXOptions
): Array<[string, T]> {
  const [key, value] = objEntry;
  const expansion =
    expansions[options.styleResolution ?? 'application-order'][key];
  if (expansion) {
    if (Array.isArray(value)) {
      throw new Error(
        'Cannot use fallbacks for shorthands. Use the expansion instead.'
      );
    }
    return expansion(value);
  }
  return [objEntry];
}
