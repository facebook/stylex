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

export default function makeRegExRule(
  regex: RegExp,
  message: string,
): RuleCheck {
  function regexChecker(node: Node, _variables?: Variables): RuleResponse {
    if (
      node.type === 'Literal' &&
      typeof node.value === 'string' &&
      regex.test(node.value)
    ) {
      return undefined;
    }
    return {
      message,
    };
  }
  return makeVariableCheckingRule(regexChecker);
}
