/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from './common-types';

import createHash from './hash';
import { objEntries, objMap } from './utils/object-utils';
import { defaultOptions } from './utils/default-options';

type VarsConfig = $ReadOnly<{
  [string]: string | $ReadOnly<{ default: string, [string]: string }>,
}>;

type VarsObject<Vars: VarsConfig> = $ReadOnly<{
  ...$ObjMapConst<Vars, string>,
  __themeName__: string,
}>;

// Similar to `stylex.create` it takes an object of variables with their values
// and returns a string after hashing it.
export default function styleXDefineVars<Vars: VarsConfig>(
  variables: Vars,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, themeName: string, ... }>,
): [VarsObject<Vars>, { [string]: InjectableStyle }] {
  const { classNamePrefix, themeName } = {
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

  const injectableStyles = constructCssVariablesString(
    variablesMap,
    themeNameHash,
  );

  return [
    { ...themeVariablesObject, __themeName__: themeNameHash },
    injectableStyles,
  ];
}

function constructCssVariablesString(
  variables: { +[string]: { +nameHash: string, +value: VarsConfig[string] } },
  themeNameHash: string,
): { [string]: InjectableStyle } {
  const ruleByAtRule: { [string]: Array<string> } = {};

  for (const [key, { nameHash, value }] of objEntries(variables)) {
    if (value !== null && typeof value === 'object') {
      if (value.default === undefined) {
        throw new Error(
          'Default value is not defined for ' + key + ' variable.',
        );
      }
      const v = value;
      for (const [key, value] of objEntries(v)) {
        ruleByAtRule[key] ??= [];
        ruleByAtRule[key].push(`--${nameHash}:${value};`);
      }
    } else {
      ruleByAtRule.default ??= [];
      ruleByAtRule.default.push(`--${nameHash}:${value};`);
    }
  }

  const result: { [string]: InjectableStyle } = {};
  for (const [key, value] of objEntries(ruleByAtRule)) {
    const suffix = key === 'default' ? '' : `-${createHash(key)}`;

    let ltr = `:root{${value.join('')}}`;
    if (key !== 'default') {
      ltr = `${key}{${ltr}}`;
    }

    result[themeNameHash + suffix] = {
      ltr,
      rtl: null,
      priority: 0,
    };
  }

  return result;
}
