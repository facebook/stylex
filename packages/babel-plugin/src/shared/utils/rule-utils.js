/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { arraySort } from './object-utils';

export const sortPseudos = (
  pseudos: $ReadOnlyArray<string>,
): $ReadOnlyArray<string> => {
  if (pseudos.length < 2) {
    return pseudos;
  }

  return pseudos
    .reduce(
      (acc, pseudo) => {
        if (pseudo.startsWith('::')) {
          return [...acc, pseudo];
        }

        const lastElement = acc[acc.length - 1];
        const allButLast = acc.slice(0, acc.length - 1);
        if (Array.isArray(lastElement)) {
          return [...allButLast, [...lastElement, pseudo]];
        } else {
          return [...allButLast, lastElement, [pseudo]].filter(Boolean);
        }
      },
      [] as $ReadOnlyArray<string | $ReadOnlyArray<string>>,
    )
    .flatMap((pseudo) => {
      if (Array.isArray(pseudo)) {
        return arraySort(pseudo, stringComparator);
      }
      return [pseudo];
    });
};

export const sortAtRules = (
  atRules: $ReadOnlyArray<string>,
): $ReadOnlyArray<string> => arraySort(atRules);

// a comparator function that sorts strings alphabetically
// but where `default` always comes first
const stringComparator = (a: string, b: string): number => {
  if (a === 'default') {
    return -1;
  }
  if (b === 'default') {
    return 1;
  }
  return a.localeCompare(b);
};
