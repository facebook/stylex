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
import {
  collectVarsByAtRule,
  priorityForAtRule,
  wrapWithAtRules,
} from './stylex-vars-utils';
import { isCSSType } from './types';
import { defaultOptions } from './utils/default-options';

// It takes an object of variables with their values and the original set of variables to override
// and returns a hashed className with variables overrides.
//
export default function styleXCreateTheme(
  themeVars: { +__themeName__: string, +[string]: string },
  variables: { +[string]: string | { default: string, +[string]: string } },
  options?: StyleXOptions,
): [{ $$css: true, +[string]: string }, { [string]: InjectableStyle }] {
  if (typeof themeVars.__themeName__ !== 'string') {
    throw new Error(
      'Can only override variables theme created with stylex.defineVars().',
    );
  }

  const { classNamePrefix, themeOverride } = { ...defaultOptions, ...options };

  // Create a map of @-rule names and values
  const rulesByAtRule: { [string]: Array<string> } = {};

  // Sort the set of variables to get a consistent unique hash value
  const sortedKeys = Object.keys(variables).sort();

  for (const key of sortedKeys) {
    const value = isCSSType(variables[key])
      ? variables[key].value
      : variables[key];
    const nameHash = themeVars[key].slice(6, -1);
    collectVarsByAtRule(key, { nameHash, value }, rulesByAtRule);
  }

  // Sort @-rules to get a consistent unique hash value
  // But also put "default" first
  const sortedAtRules = Object.keys(rulesByAtRule).sort((a, b) =>
    a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b),
  );

  const atRulesStringForHash = sortedAtRules
    .map((atRule) => wrapWithAtRules(rulesByAtRule[atRule].join(''), atRule))
    .join('');

  // Create a class name hash
  const overrideClassName = classNamePrefix + createHash(atRulesStringForHash);

  const stylesToInject: { [string]: InjectableStyle } = {};

  for (const atRule of sortedAtRules) {
    const decls = rulesByAtRule[atRule].join('');
    const rule = `.${overrideClassName}, .${overrideClassName}:root{${decls}}`;

    if (atRule === 'default') {
      stylesToInject[overrideClassName] = {
        ltr: rule,
        priority: 0.5,
        rtl: null,
      };
    } else {
      stylesToInject[overrideClassName + '-' + createHash(atRule)] = {
        ltr: wrapWithAtRules(rule, atRule),
        priority: 0.5 + 0.1 * priorityForAtRule(atRule),
        rtl: null,
      };
    }
  }

  let themeClass = overrideClassName;
  if (themeOverride === 'group') {
    themeClass = `${overrideClassName} ${themeVars.__themeName__}`;
  }
  if (themeOverride === 'global') {
    themeClass = `${overrideClassName} __stylex-base-theme__`;
  }

  return [
    { $$css: true, [themeVars.__themeName__]: themeClass },
    stylesToInject,
  ];
}
