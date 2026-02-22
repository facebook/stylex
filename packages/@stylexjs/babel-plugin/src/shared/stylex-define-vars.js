/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type {
  VarsConfig,
  ResolvedVarsConfigValue,
} from './stylex-vars-utils';
import type { NamedVarSpec } from './stylex-named-var';
import { type CSSType, isCSSType } from './types';

import createHash from './hash';
import * as messages from './messages';
import { objMap } from './utils/object-utils';
import { defaultOptions } from './utils/default-options';
import { isNamedVarSpec, isValidCustomPropertyName } from './stylex-named-var';
import {
  collectVarsByAtRule,
  getDefaultValue,
  priorityForAtRule,
  wrapWithAtRules,
} from './stylex-vars-utils';

type VarsKeysWithStringValues<Vars: VarsConfig> = $ReadOnly<{
  [$Keys<Vars>]: string,
}>;

type VarsObject<Vars: VarsConfig> = $ReadOnly<{
  ...VarsKeysWithStringValues<Vars>,
  __varGroupHash__: string,
}>;

// Similar to `stylex.create` it takes an object of variables with their values
// and returns a string after hashing it.
export default function styleXDefineVars<Vars: VarsConfig>(
  variables: Vars,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): [VarsObject<Vars>, { [string]: InjectableStyle }] {
  const { classNamePrefix, exportId, debug, enableDebugClassNames } = {
    ...defaultOptions,
    ...options,
  };

  const varGroupHash = classNamePrefix + createHash(exportId);

  const typedVariables: {
    [string]: $ReadOnly<{
      initialValue: ?string,
      syntax: string,
    }>,
  } = {};
  const customPropertyKeysByName: Map<string, string> = new Map();

  const variablesMap: {
    +[string]: { +nameHash: string, +value: ResolvedVarsConfigValue },
  } = objMap(variables, (value, key) => {
    let resolvedValue: any = value;
    let explicitCustomPropertyName: null | string = null;
    if (isNamedVarSpec(value)) {
      const namedVarSpec: NamedVarSpec<mixed> = value as any;
      const customPropertyName = namedVarSpec.name;
      if (!customPropertyName.startsWith('--')) {
        throw new Error(
          messages.namedVarNameMustStartWithDashes(key, customPropertyName),
        );
      }
      if (!isValidCustomPropertyName(customPropertyName)) {
        throw new Error(
          messages.namedVarInvalidCustomPropertyName(key, customPropertyName),
        );
      }
      explicitCustomPropertyName = customPropertyName;
      resolvedValue = namedVarSpec.value;
    }

    const varSafeKey = (
      key[0] >= '0' && key[0] <= '9' ? `_${key}` : key
    ).replace(/[^a-zA-Z0-9]/g, '_');
    const nameHash =
      explicitCustomPropertyName != null
        ? explicitCustomPropertyName.slice(2)
        : key.startsWith('--')
          ? key.slice(2)
          : debug && enableDebugClassNames
            ? varSafeKey + '-' + classNamePrefix + createHash(`${exportId}.${key}`)
            : classNamePrefix + createHash(`${exportId}.${key}`);

    const existingKey = customPropertyKeysByName.get(nameHash);
    if (existingKey != null && existingKey !== key) {
      throw new Error(
        messages.duplicateCustomPropertyName(`--${nameHash}`, existingKey, key),
      );
    }
    customPropertyKeysByName.set(nameHash, key);

    if (isCSSType(resolvedValue)) {
      const v: CSSType<> = resolvedValue;
      typedVariables[nameHash] = {
        initialValue: getDefaultValue(v.value),
        syntax: v.syntax,
      };
      return { nameHash, value: v.value };
    }
    return { nameHash, value: resolvedValue as $FlowFixMe };
  });

  const themeVariablesObject = objMap(
    variablesMap,
    ({ nameHash }) => `var(--${nameHash})`,
  );

  const injectableStyles = constructCssVariablesString(
    variablesMap,
    varGroupHash,
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
    {
      ...themeVariablesObject,
      __varGroupHash__: varGroupHash,
    },
    { ...injectableTypes, ...injectableStyles },
  ];
}

function constructCssVariablesString(
  variables: {
    +[string]: { +nameHash: string, +value: ResolvedVarsConfigValue },
  },
  varGroupHash: string,
): { [string]: InjectableStyle } {
  const rulesByAtRule: { [string]: Array<string> } = {};

  for (const [key, { nameHash, value }] of Object.entries(variables)) {
    collectVarsByAtRule(key, { nameHash, value }, rulesByAtRule);
  }

  const result: { [string]: InjectableStyle } = {};
  for (const [atRule, value] of Object.entries(rulesByAtRule)) {
    const suffix = atRule === 'default' ? '' : `-${createHash(atRule)}`;

    const selector = `:root, .${varGroupHash}`;

    let ltr = `${selector}{${value.join('')}}`;
    if (atRule !== 'default') {
      ltr = wrapWithAtRules(ltr, atRule);
    }

    result[varGroupHash + suffix] = {
      ltr,
      rtl: null,
      priority: priorityForAtRule(atRule) / 10,
    };
  }

  return result;
}
