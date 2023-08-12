/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';
import type { Node } from 'estree';
import makeVariableCheckingRule from '../utils/makeVariableCheckingRule';

const numericOperators = new Set(['+', '-', '*', '/']);

const isNumber: RuleCheck = makeVariableCheckingRule(
  (node: Node, variables?: Variables): RuleResponse =>
    (node.type === 'Literal' && typeof node.value === 'number') ||
    (node.type === 'BinaryExpression' &&
      numericOperators.has(node.operator) &&
      isNumber(node.left, variables) &&
      isNumber(node.right, variables)) ||
    (node.type === 'UnaryExpression' &&
      node.operator === '-' &&
      isNumber(node.argument, variables)) ||
    isMathCall(node, variables)
      ? undefined
      : {
          message: 'a number literal or math expression',
        },
);

export function isMathCall(node: Node, variables?: Variables): RuleResponse {
  return node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Math' &&
    node.callee.property.type === 'Identifier' &&
    ['abs', 'ceil', 'floor', 'round'].includes(node.callee.property.name) &&
    node.arguments.every(
      (arg) =>
        (arg.type === 'Literal' ||
          arg.type === 'UnaryExpression' ||
          arg.type === 'BinaryExpression') &&
        isNumber(arg, variables),
    )
    ? undefined
    : {
        message: 'a math expression',
      };
}

export default (isNumber: RuleCheck);
