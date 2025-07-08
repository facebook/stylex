/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableConstStyle, StyleXOptions } from './common-types';
import type { ConstsConfig } from './stylex-consts-utils';

import { defaultOptions } from './utils/default-options';
import * as messages from './messages';

import createHash from './hash';

export default function styleXDefineConsts<Vars: ConstsConfig>(
  constants: Vars,
  options: $ReadOnly<{ ...Partial<StyleXOptions>, exportId: string, ... }>,
): [
  { [string]: string | number }, // jsOutput JS output
  { [string]: InjectableConstStyle }, // metadata for registerinjectableStyles
] {
  const { classNamePrefix, exportId, debug, enableDebugClassNames } = {
    ...defaultOptions,
    ...options,
  };

  const jsOutput: { [string]: string | number } = {};
  const injectableStyles: { [string]: InjectableConstStyle } = {};

  for (const [key, value] of Object.entries(constants)) {
    if (key.startsWith('--')) {
      throw new Error(messages.INVALID_CONST_KEY);
    }

    const varSafeKey = (
      key[0] >= '0' && key[0] <= '9' ? `_${key}` : key
    ).replace(/[^a-zA-Z0-9]/g, '_');

    const constKey =
      debug && enableDebugClassNames
        ? `${varSafeKey}-${classNamePrefix}${createHash(`${exportId}.${key}`)}`
        : `${classNamePrefix}${createHash(`${exportId}.${key}`)}`;

    jsOutput[key] = value;
    injectableStyles[constKey] = {
      constKey,
      constVal: value,
      priority: 0,
      ltr: '',
      rtl: null,
    };
  }

  return [jsOutput, injectableStyles];
}
