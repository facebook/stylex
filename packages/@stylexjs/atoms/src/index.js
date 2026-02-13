/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { CSSProperties, StyleXStyles } from '@stylexjs/stylex';

export type Atom = StyleXStyles<{ +[string]: mixed }>;

export type AtomProperty = {
  +[string]: Atom,
  (value: string | number): Atom,
};

export type Atoms = $ReadOnly<{
  [_Key in keyof CSSProperties]: AtomProperty,
}>;

const errorMessage = (prop: string): string =>
  '\'@stylexjs/atoms\' must be compiled away by \'@stylexjs/babel-plugin\'. ' +
  `Attempted to access '${prop}' at runtime.`;

const _proxy: any = new Proxy({} as { [string]: mixed }, {
  get(target: { [string]: mixed }, prop: string | symbol): mixed {
    if (typeof prop === 'symbol') {
      // $FlowFixMe[incompatible-type]
      return target[prop];
    }
    if (prop === 'default' || prop === '__esModule') {
      return target[prop];
    }
    throw new Error(errorMessage(prop));
  },
});
const atoms: Atoms = _proxy;

export default atoms;
