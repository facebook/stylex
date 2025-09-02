/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';
import type { RuleResponse, Variables } from '../stylex-valid-styles';
import type { Node } from 'estree';

export default function isPositionTryFallbacks(
  styleXDefaultImports: Set<string>,
  styleXPositionTryImports: Set<string>,
): (node: Node, variables?: Variables) => RuleResponse {
  return function isPositionTryFallbacksRec(
    node: Node,
    variables?: Variables,
  ): RuleResponse {
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'positionTry' &&
      (node.callee.object.name === 'stylex' ||
        styleXDefaultImports.has(node.callee.object.name))
    ) {
      return undefined;
    }
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      (node.callee.name === 'positionTry' ||
        styleXPositionTryImports.has(node.callee.name))
    ) {
      return undefined;
    }
    if (node.type === 'Identifier' && variables && variables.has(node.name)) {
      const variable = variables.get(node.name);
      if (variable === 'ARG') {
        return undefined;
      }
      if (variable != null) {
        return isPositionTryFallbacksRec(variable, variables);
      } else {
        return {
          message:
            'All expressions in a template literal must be a `positionTry(...)` function call',
        };
      }
    }
    if (node.type === 'TemplateLiteral') {
      if (
        !node.expressions.every(
          (expr) => isPositionTryFallbacksRec(expr, variables) === undefined,
        )
      ) {
        return {
          message:
            'All expressions in a template literal must be a `positionTry(...)` function call',
        };
      }
      if (
        !node.quasis.every((quasi, index, { length }) =>
          index === 0 || index === length - 1
            ? quasi.value.raw === ''
            : quasi.value.raw === ', ',
        )
      ) {
        return {
          message:
            'position try fallbacks must be separated by a comma and a space (", ")',
        };
      }
      return undefined;
    }
    return {
      message:
        'a `positionTry(...)` function call, a reference to it or a many such valid',
    };
  };
}
