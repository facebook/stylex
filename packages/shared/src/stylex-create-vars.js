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

type VarsObject<
  Vars: { +[string]: string | { default: string, +[string]: string } },
> = {
  ...$ObjMapConst<Vars, string>,
  __themeName__: string,
};

// Similar to `stylex.create` it takes an object of variables with their values
// and returns a string after hashing it.
export default function styleXCreateVars<
  +Vars: {
    +[string]: string | { default: string, +[string]: string },
  },
>(
  variables: Vars,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, themeName: string, ... }>,
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
  +[string]: {
    nameHash: string,
    value: string | { default: string, +[string]: string },
  },
}): string {
  const atRules: any = {};

  const varsString = objEntries(variables)
    .map(([key, { nameHash, value }]) => {
      if (value !== null && typeof value === 'object') {
        if (value.default === undefined) {
          throw new Error(
            'Default value is not defined for ' + key + ' variable.',
          );
        }
        const definedVarString = `--${nameHash}:${value.default};`;
        Object.keys(value).forEach((key) => {
          if (key.startsWith('@')) {
            const definedVarStringForAtRule = `--${nameHash}:${value[key]};`;
            if (atRules[key] == null) {
              atRules[key] = [definedVarStringForAtRule];
            } else {
              atRules[key].push(definedVarStringForAtRule);
            }
          }
        });
        return definedVarString;
      }
      return `--${nameHash}:${value};`;
    })
    .join('');
  const atRulesString = objEntries(atRules)
    .map(([atRule, varsArr]) => {
      return `${atRule}{:root{${varsArr.join('')}}}`;
    })
    .join('');
  return `:root{${varsString}}${atRulesString || ''}`;
}
