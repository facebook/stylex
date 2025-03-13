/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { ConstsConfig, ConstsConfigValue } from './stylex-consts-utils';

import createHash from './hash';
import { objMap } from './utils/object-utils';
import { defaultOptions } from './utils/default-options';
import {
  priorityForAtRule,
  wrapWithAtRules,
} from './stylex-vars-utils';
import { type CSSType, isCSSType } from './types';

type ConstsKeysWithStringValues<Vars: ConstsConfig> = $ReadOnly<{
  [$Keys<Vars>]: string,
}>;

type ConstsObject<Vars: ConstsConfig> = $ReadOnly<{ ...ConstsKeysWithStringValues<Vars> }>;

// `defineConsts` is like `defineVars`, but values are static and cannot be themed.
function sanitizeKey(key) {
  const kebabKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

  return (kebabKey[0] >= '0' && kebabKey[0] <= '9' ? `_${kebabKey}` : kebabKey)
    .replace(/[^a-zA-Z0-9-]/g, '_');
}


export default function styleXDefineConsts<Vars: ConstsConfig>(
  constants: Vars,
  options?: $ReadOnly<Partial<StyleXOptions>>,
): [ConstsObject<Vars>, { [string]: InjectableStyle }] {
  const { classNamePrefix, debug, enableDebugClassNames } = {
    ...defaultOptions,
    ...options,
  };

  const constsNameHash = classNamePrefix + createHash('defineConsts');

  const constsMap: {
    +[string]: { +nameHash: string, +value: ConstsConfigValue },
  } = objMap(constants, (value, key) => {
    const safeKey = sanitizeKey(key);

    const nameHash = `xconst_${safeKey}`;

    return { nameHash, value };
  });

  const constsObject = objMap(constsMap, ({ value }) =>
    typeof value === 'object' && value !== null && 'default' in value
      ? value.default
      : value
  );

  const injectableStyles = constructStaticConstsString(constsMap, constsNameHash);

  return [
    {
      ...constsObject,
    },
    { ...injectableStyles },
  ];
}

function constructStaticConstsString(
  constants: { +[string]: { +nameHash: string, +value: ConstsConfigValue } },
  constsNameHash: string,
): { [string]: InjectableStyle } {
  const rulesByAtRule: { [string]: Array<string> } = {};

  for (const [key, { nameHash, value }] of Object.entries(constants)) {
    const cssKey = sanitizeKey(key);

    if (typeof value === 'object' && value !== null) {
      for (const [atRule, atValue] of Object.entries(value)) {
        if (atRule === 'default') continue;

        if (!rulesByAtRule[atRule]) {
          rulesByAtRule[atRule] = [];
        }
        rulesByAtRule[atRule].push(`${cssKey}:${atValue};`);
      }
    } else {
      if (!rulesByAtRule["default"]) {
        rulesByAtRule["default"] = [];
      }
      rulesByAtRule["default"].push(`${cssKey}:${value};`);
    }
  }

  const result: { [string]: InjectableStyle } = {};
  for (const [atRule, values] of Object.entries(rulesByAtRule)) {
    const suffix = atRule === 'default' ? '' : `-${createHash(atRule)}`;

    const selector = `:root`;

    let ltr = `${selector}{${values.join('')}}`;
    if (atRule !== 'default') {
      ltr = wrapWithAtRules(ltr, atRule);
    }

    result[constsNameHash + suffix] = {
      ltr,
      rtl: null,
      priority: priorityForAtRule(atRule) * 0.1,
    };
  }

  return result;
}
