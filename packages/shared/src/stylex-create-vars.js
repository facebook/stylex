/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from './common-types';

import createHash from './hash';
import { objEntries, objMap } from './utils/object-utils';
import { defaultOptions } from './utils/default-options';

type VarsObject<Vars: { +[string]: string | number }> = {
  ...$ObjMapConst<Vars, string>,
  __themeName__: string,
};

// Similar to `stylex.create` it takes an object of variables with their values
// and returns a string after hashing it.
export default function styleXCreateVars<+Vars: { +[string]: string }>(
  variables: Vars,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, themeName: string, ... }>
): [VarsObject<Vars>, { css: string }] {
  const {
    classNamePrefix,
    themeName,
  }: { ...StyleXOptions, themeName: string, ... } = {
    ...defaultOptions,
    ...options,
  };

  const themeNameHash = classNamePrefix + createHash(themeName);

  const variablesMap = objMap(variables, (value, key) => {
    // Created hashed variable names with fileName//themeName//key
    const nameHash = classNamePrefix + createHash(`${themeName}.${key}`);
    return { nameHash, value };
  });

  const themeVariablesObject = objMap(variablesMap, ({ nameHash }) => {
    return `var(--${nameHash})`;
  });

  const cssVariablesString = constructCssVariablesString(variablesMap);

  return [
    { ...themeVariablesObject, __themeName__: themeNameHash },
    { css: cssVariablesString },
  ];
}

function constructCssVariablesString(variables: {
  +[string]: { nameHash: string, value: string },
}): string {
  const vars = objEntries(variables)
    .map(([_, value]) => {
      return `--${value.nameHash}:${value.value};`;
    })
    .join('');
  return `:root{${vars}}`;
}
