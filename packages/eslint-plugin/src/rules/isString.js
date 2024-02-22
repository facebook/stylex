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

function isStringImpl(node: Node, _variables?: Variables): RuleResponse {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return undefined;
  }
  if (node.type === 'TemplateLiteral') {
    return undefined;
  }
  return {
    message: 'a string literal',
  };
}
const isString: RuleCheck = makeVariableCheckingRule(isStringImpl);
export default isString as RuleCheck;
