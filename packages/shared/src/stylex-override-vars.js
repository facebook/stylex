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
export default function styleXOverrideVars(
  themeVars: { __themeName__: string, +[string]: string },
  variables: { +[string]: string },
  options?: StyleXOptions
): [{ $$css: true, +[string]: string }, { [string]: InjectableStyle }] {
  if (typeof themeVars.__themeName__ !== 'string') {
    throw new Error(
      'Can only override variables theme created with stylex.unstable_createVars().'
    );
  }

  const { classNamePrefix } = {
    ...defaultOptions,
    ...options,
  };

  const sortedKeys = Object.keys(variables).sort();

  const cssVariablesOverrideString = sortedKeys
    .map((key) => {
      const varNameHash = themeVars[key].slice(4, -1);
      return varNameHash != null ? `${varNameHash}:${variables[key]};` : '';
    })
    .join('');

  const overrideClassName =
    classNamePrefix + createHash(cssVariablesOverrideString);

  return [
    { $$css: true, [themeVars.__themeName__]: overrideClassName },
    {
      [overrideClassName]: {
        ltr: `.${overrideClassName}{${cssVariablesOverrideString}}`,
        priority: 0.99,
        rtl: undefined,
      },
    },
  ];
}
