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

type ASTNode = {
  +type: string,
  +name?: string,
  +object?: ASTNode,
  ...
};

/**
 * Walks a MemberExpression chain to find the root Identifier.
 * e.g., tokens.badge.info.bg → tokens
 *       colors.accent → colors
 */
function getRootIdentifierName(node: ASTNode): string | null {
  if (node.type === 'Identifier' && typeof node.name === 'string') {
    return node.name;
  }
  if (
    node.type === 'MemberExpression' &&
    node.object != null &&
    typeof node.object === 'object'
  ) {
    return getRootIdentifierName(node.object);
  }
  return null;
}

export default function isStylexDefineVarsToken(
  node: Expression | Pattern,
  stylexResolvedVarsTokenImports: Set<string>,
): boolean {
  if (node != null) {
    // MemberExpression: tokens.color OR tokens.badge.info.bg (any depth)
    if (node.type === 'MemberExpression') {
      const rootName = getRootIdentifierName(node);
      return rootName != null && stylexResolvedVarsTokenImports.has(rootName);
    }
    // Simple identifier: tokens
    if (node.type === 'Identifier') {
      return stylexResolvedVarsTokenImports.has(node.name);
    }
    // Template literals: `${tokens.badge.info.bg}`
    if (node.type === 'TemplateLiteral' && node.expressions.length > 0) {
      return (
        node.expressions.reduce(
          (invalidTokenCounter, expression: Expression | Pattern): number => {
            if (expression.type === 'MemberExpression') {
              const rootName = getRootIdentifierName(expression);
              return rootName != null &&
                stylexResolvedVarsTokenImports.has(rootName)
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
