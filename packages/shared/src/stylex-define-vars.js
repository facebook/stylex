/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { VarsConfig, VarsConfigValue } from './stylex-vars-utils';

import createHash from './hash';
import { objMap } from './utils/object-utils';
import { defaultOptions } from './utils/default-options';
import { collectVarsByAtRule, wrapWithAtRules } from './stylex-vars-utils';

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

  const themeVariablesObject = objMap(
    variablesMap,
    ({ nameHash }) => `var(--${nameHash})`,
  );

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
  variables: { +[string]: { +nameHash: string, +value: VarsConfigValue } },
  themeNameHash: string,
): { [string]: InjectableStyle } {
  const rulesByAtRule: { [string]: Array<string> } = {};

  for (const [key, { nameHash, value }] of Object.entries(variables)) {
    collectVarsByAtRule(key, { nameHash, value }, rulesByAtRule);
  }

  const result: { [string]: InjectableStyle } = {};
  for (const [atRule, value] of Object.entries(rulesByAtRule)) {
    const suffix = atRule === 'default' ? '' : `-${createHash(atRule)}`;

    let ltr = `:root{${value.join('')}}`;
    if (atRule !== 'default') {
      ltr = wrapWithAtRules(ltr, atRule);
    }

    result[themeNameHash + suffix] = {
      ltr,
      rtl: null,
      priority: atRule === 'default' ? 0 : 0.1,
    };
  }

  return result;
}
