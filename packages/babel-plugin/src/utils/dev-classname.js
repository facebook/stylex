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
import path from 'path';
import StateManager from './state-manager';

// TODO: We will need to maintain the full path to the file eventually
// Perhaps this can be an option that is passed in.
export function namespaceToDevClassName(
  namespace: string,
  varName: null | string,
  filename: string,
): string {
  // Get the basename of the file without the extension
  const basename = path.basename(filename).split('.')[0];

  // Build up the class name, and sanitize it of disallowed characters
  const className = `${basename}__${varName ? `${varName}.` : ''}${namespace}`;
  return className.replace(/[^.a-zA-Z0-9_-]/g, '');
}

export function injectDevClassNames(
  obj: CompiledNamespaces,
  varName: null | string,
  state: StateManager,
): CompiledNamespaces {
  const result: MutableCompiledNamespaces = {};
  for (const [key, value] of Object.entries(obj)) {
    const devClassName = namespaceToDevClassName(
      key,
      varName,
      state.filename ?? 'UnknownFile',
    );
    // $FlowFixMe
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
    const devClassName = namespaceToDevClassName(
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
