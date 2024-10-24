/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  CompiledNamespaces,
  MutableCompiledNamespaces,
} from '@stylexjs/shared';
import StateManager from './state-manager';


export function injectDevClassNames(
  obj: CompiledNamespaces,
  varName: null | string,
  state: StateManager,
): CompiledNamespaces {
  const result: MutableCompiledNamespaces = {};
  for (const [key, value] of Object.entries(obj)) {
    const devClassName = state.options.namespaceToDevClassName(
      key,
      varName,
      state.filename ?? 'UnknownFile',
    );
    result[key] = {
      [devClassName]: devClassName,
      ...value,
    };
  }
  return result;
}

export function convertToTestStyles(
  obj: CompiledNamespaces,
  varName: null | string,
  state: StateManager,
): CompiledNamespaces {
  const result: MutableCompiledNamespaces = {};
  for (const [key, _value] of Object.entries(obj)) {
    const devClassName = state.options.namespaceToDevClassName(
      key,
      varName,
      state.filename ?? 'UnknownFile',
    );
    result[key] = {
      [devClassName]: devClassName,
      $$css: true,
    };
  }
  return result;
}
