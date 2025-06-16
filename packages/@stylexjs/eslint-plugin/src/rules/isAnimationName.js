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

export default function isAnimationName(
  styleXDefaultImports: Set<string>,
  styleXKeyframesImports: Set<string>,
): (node: Node, variables?: Variables) => RuleResponse {
  return function isAnimationNameRec(
    node: Node,
    variables?: Variables,
  ): RuleResponse {
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'keyframes' &&
      (node.callee.object.name === 'stylex' ||
        styleXDefaultImports.has(node.callee.object.name))
    ) {
      return undefined;
    }
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      (node.callee.name === 'keyframes' ||
        styleXKeyframesImports.has(node.callee.name))
    ) {
      return undefined;
    }
    if (node.type === 'Identifier' && variables && variables.has(node.name)) {
      const variable = variables.get(node.name);
      if (variable === 'ARG') {
        return undefined;
      }
      if (variable != null) {
        return isAnimationNameRec(variable, variables);
      } else {
        return {
          message:
            'All expressions in a template literal must be a `keyframes(...)` function call',
        };
      }
    }
    if (node.type === 'TemplateLiteral') {
      if (
        !node.expressions.every(
          (expr) => isAnimationNameRec(expr, variables) === undefined,
        )
      ) {
        return {
          message:
            'All expressions in a template literal must be a `keyframes(...)` function call',
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
            'animation names must be separated by a comma and a space (", ")',
        };
      }
      return undefined;
    }
    return {
      message:
        'a `keyframes(...)` function call, a reference to it or a many such valid',
    };
  };
}
