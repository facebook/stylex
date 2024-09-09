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
import {
  collectVarsByAtRule,
  getDefaultValue,
  priorityForAtRule,
  wrapWithAtRules,
} from './stylex-vars-utils';
import { type CSSType, isCSSType } from './types';

type VarsKeysWithStringValues<Vars: VarsConfig> = $ReadOnly<{
  [$Keys<Vars>]: string,
}>;

type VarsObject<Vars: VarsConfig> = $ReadOnly<{
  ...VarsKeysWithStringValues<Vars>,
  __themeName__: string,
}>;

// Similar to `stylex.create` it takes an object of variables with their values
// and returns a string after hashing it.
export default function styleXDefineVars<Vars: VarsConfig>(
  variables: Vars,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, themeName: string, ... }>,
): [VarsObject<Vars>, { [string]: InjectableStyle }] {
  const { classNamePrefix, themeName, themeOverride } = {
    ...defaultOptions,
    ...options,
  };

  const themeNameHash = classNamePrefix + createHash(themeName);

  const typedVariables: {
    [string]: $ReadOnly<{
      initialValue: ?string,
      syntax: string,
    }>,
  } = {};

  const variablesMap: {
    +[string]: { +nameHash: string, +value: VarsConfigValue },
  } = objMap(variables, (value, key) => {
    // Created hashed variable names with fileName//themeName//key
    const nameHash = key.startsWith('--')
      ? key.slice(2)
      : classNamePrefix + createHash(`${themeName}.${key}`);
    if (isCSSType(value)) {
      const v: CSSType<> = value;
      typedVariables[nameHash] = {
        initialValue: getDefaultValue(v.value),
        syntax: v.syntax,
      };
      return { nameHash, value: v.value };
    }
    return { nameHash, value: value as $FlowFixMe };
  });

  const themeVariablesObject = objMap(
    variablesMap,
    ({ nameHash }) => `var(--${nameHash})`,
  );

  const injectableStyles = constructCssVariablesString(
    variablesMap,
    themeNameHash,
    themeOverride,
  );

  const injectableTypes: { +[string]: InjectableStyle } = objMap(
    typedVariables,
    ({ initialValue: iv, syntax }, nameHash) => ({
      ltr: `@property --${nameHash} { syntax: "${syntax}"; inherits: true;${iv != null ? ` initial-value: ${iv}` : ''} }`,
      rtl: null,
      priority: 0,
    }),
  );

  return [
    { ...themeVariablesObject, __themeName__: themeNameHash },
    { ...injectableTypes, ...injectableStyles },
  ];
}

function constructCssVariablesString(
  variables: { +[string]: { +nameHash: string, +value: VarsConfigValue } },
  themeNameHash: string,
  themeOverride: StyleXOptions['themeOverride'],
): { [string]: InjectableStyle } {
  const rulesByAtRule: { [string]: Array<string> } = {};

  for (const [key, { nameHash, value }] of Object.entries(variables)) {
    collectVarsByAtRule(key, { nameHash, value }, rulesByAtRule);
  }

  const result: { [string]: InjectableStyle } = {};
  for (const [atRule, value] of Object.entries(rulesByAtRule)) {
    const suffix = atRule === 'default' ? '' : `-${createHash(atRule)}`;

    let selector = ':root';
    if (themeOverride === 'group') {
      selector = `:root, .${themeNameHash}`;
    }
    if (themeOverride === 'global') {
      selector = ':root, .__stylex-base-theme__';
    }

    let ltr = `${selector}{${value.join('')}}`;
    if (atRule !== 'default') {
      ltr = wrapWithAtRules(ltr, atRule);
    }

    result[themeNameHash + suffix] = {
      ltr,
      rtl: null,
      priority: priorityForAtRule(atRule) * 0.1,
    };
  }

  return result;
}
