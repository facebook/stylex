/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';

import * as t from '@babel/types';
import { attrs } from '@stylexjs/stylex';
import { convertObjectToAST } from '../utils/js-to-ast';
import {
  transformStylexPropsLike,
  skipStylexPropsLikeChildren,
} from './stylex-props-utils';
import StateManager from '../utils/state-manager';

export function skipStylexAttrsChildren(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  skipStylexPropsLikeChildren(path, state, {
    importSet: state.stylexAttrsImport,
    memberName: 'attrs',
  });
}

// If a `stylex()` call uses styles that are all locally defined,
// This function is able to pre-compute that into a single string or
// a single expression of strings and ternary expressions.
export default function transformStylexAttrs(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  transformStylexPropsLike(path, state, {
    importSet: state.stylexAttrsImport,
    memberName: 'attrs',
    buildResult: (values) => {
      console.log('values', values);
      const result = attrs(values as $FlowFixMe);
      console.log('result', result);
      return convertObjectToAST(result);
    },
  });
}
