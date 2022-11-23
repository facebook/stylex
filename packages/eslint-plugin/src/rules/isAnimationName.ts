/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
import type { RuleResponse, Variables } from '../stylex-valid-styles';
import * as ESTree from 'estree';

const isAnimationName = (
  node: ESTree.Node,
  variables?: Variables
): RuleResponse => {
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'stylex' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'keyframes'
  ) {
    return undefined;
  }
  if (node.type === 'Identifier' && variables && variables.has(node.name)) {
    const variable = variables.get(node.name);
    if (variable != null) {
      return isAnimationName(variable, variables);
    } else {
      return {
        message:
          'All expressions in a template literal must be a `stylex.keyframes(...)` function call',
      };
    }
  }
  if (node.type === 'TemplateLiteral') {
    if (
      !node.expressions.every(
        (expr) => isAnimationName(expr, variables) === undefined
      )
    ) {
      return {
        message:
          'All expressions in a template literal must be a `stylex.keyframes(...)` function call',
      };
    }
    if (
      !node.quasis.every((quasi, index, { length }) =>
        index === 0 || index === length - 1
          ? quasi.value.raw === ''
          : quasi.value.raw === ', '
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
      'a `stylex.keyframes(...)` function call, a reference to it or a many such valid',
  };
};
export default isAnimationName;
