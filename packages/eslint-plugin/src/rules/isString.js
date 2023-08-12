/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';
import type { Node } from 'estree';
import makeVariableCheckingRule from '../utils/makeVariableCheckingRule';
import isNumber from './isNumber';
import makeUnionRule from './makeUnionRule';

function isStringImpl(node: Node, variables?: Variables): RuleResponse {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return undefined;
  }
  if (
    node.type === 'TemplateLiteral' &&
    node.expressions.every((expression) =>
      isStringOrNumber(expression, variables),
    )
  ) {
    undefined;
  }
  return {
    message: 'a string literal',
  };
}
const isString: RuleCheck = makeVariableCheckingRule(isStringImpl);
const isStringOrNumber = makeUnionRule(isString, isNumber);
export default (isString: RuleCheck);
