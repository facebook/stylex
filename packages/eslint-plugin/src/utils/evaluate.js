/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Expression, Pattern, Literal } from 'estree';
import type { Variables } from '../stylex-valid-styles';

export default function evaluate(
  node: Expression | Pattern,
  variables?: Variables,
): null | Literal | 'ARG' {
  if (
    // $FlowFixMe
    node.type === 'TSSatisfiesExpression' ||
    // $FlowFixMe
    node.type === 'TSAsExpression'
  ) {
    return evaluate(node.expression, variables);
  }
  if (node.type === 'Identifier' && variables != null) {
    const existingVar = variables.get(node.name);
    if (existingVar === 'ARG') {
      return 'ARG';
    }
    if (existingVar != null) {
      return evaluate(existingVar, variables);
    }
  }
  if (node.type === 'Literal') {
    return node;
  }
  return null;
}
