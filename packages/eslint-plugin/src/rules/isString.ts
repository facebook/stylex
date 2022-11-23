/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
import type { RuleResponse, Variables } from '../stylex-valid-styles';
import * as ESTree from 'estree';
import makeVariableCheckingRule from '../utils/makeVariableCheckingRule';
import isNumber from './isNumber';
import makeUnionRule from './makeUnionRule';

function isStringImpl(node: ESTree.Node, variables?: Variables): RuleResponse {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return undefined;
  }
  if (
    node.type === 'TemplateLiteral' &&
    node.expressions.every((expression) =>
      isStringOrNumber(expression, variables)
    )
  ) {
    undefined;
  }
  return {
    message: 'a string literal',
  };
}
const isString = makeVariableCheckingRule(isStringImpl);
const isStringOrNumber = makeUnionRule(isString, isNumber);
export default isString;
