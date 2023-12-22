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

  const { classNamePrefix } = {
    ...defaultOptions,
    ...options,
  };

  // Sort the set of variables to get a consistent unique hash value
  const sortedKeys = Object.keys(variables).sort();

  // Create a map of @-rule names and values
  const atRules: any = {};

  const cssVariablesOverrideString = sortedKeys
    .map((key) => {
      const varNameHash = themeVars[key].slice(4, -1);
      const value = variables[key];

      if (varNameHash != null && value !== null && typeof value === 'object') {
        if (value.default === undefined) {
          throw new Error(
            'Default value is not defined for ' + key + ' variable.',
          );
        }
        const definedVarString = `${varNameHash}:${value.default};`;
        Object.keys(value).forEach((key) => {
          if (key.startsWith('@')) {
            const definedVarStringForAtRule = `${varNameHash}:${value[key]};`;
            if (atRules[key] == null) {
              atRules[key] = [definedVarStringForAtRule];
            } else {
              atRules[key].push(definedVarStringForAtRule);
            }
          }
        });
        return definedVarString;
      }

      return varNameHash != null && typeof value !== 'object'
        ? `${varNameHash}:${value};`
        : '';
    })
    .join('');

  // Sort @-rules to get a consistent unique hash value
  const sortedAtRules = Object.keys(atRules).sort();

  const atRulesStringForHash = sortedAtRules
    .map((atRule) => {
      // Sort variables defined inside the @-rules to get a consistent unique hash value
      return `${atRule}{${atRules[atRule].sort().join('')}}`;
    })
    .join('');

  // Create a class name hash
  const overrideClassName =
    classNamePrefix +
    createHash(cssVariablesOverrideString + atRulesStringForHash);

  // Create a class name hash
  const atRulesCss = sortedAtRules
    .map((atRule) => {
      return `${atRule}{.${overrideClassName}{${atRules[atRule].join('')}}}`;
    })
    .join('');

  return [
    { $$css: true, [themeVars.__themeName__]: overrideClassName },
    {
      [overrideClassName]: {
        ltr: [
          `.${overrideClassName}{${cssVariablesOverrideString}}`,
          atRulesCss,
        ],
        priority: 0.99,
        rtl: undefined,
      },
    },
  ];
}
