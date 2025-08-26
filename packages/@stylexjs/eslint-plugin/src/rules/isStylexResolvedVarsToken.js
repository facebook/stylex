/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';
import type { Expression, Pattern } from 'estree';

export default function isStylexDefineVarsToken(
  node: Expression | Pattern,
  stylexResolvedVarsTokenImports: Set<string>,
): boolean {
  if (node != null) {
    if (node.type === 'MemberExpression' && node.object.type === 'Identifier') {
      return stylexResolvedVarsTokenImports.has(node.object.name);
    }
    if (node.type === 'Identifier') {
      return stylexResolvedVarsTokenImports.has(node.name);
    }
    if (node.type === 'TemplateLiteral' && node.expressions.length > 0) {
      return (
        node.expressions.reduce(
          (invalidTokenCounter, expression: Expression | Pattern): number => {
            if (
              expression.type === 'MemberExpression' &&
              expression.object.type === 'Identifier'
            ) {
              return stylexResolvedVarsTokenImports.has(expression.object.name)
                ? invalidTokenCounter
                : invalidTokenCounter + 1;
            }
            return invalidTokenCounter + 1;
          },
          0,
        ) === 0
      );
    }
  }
  return false;
}
