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

export default function makeRegExRule(regex: RegExp, message: string) {
  function regexChecker(
    node: ESTree.Node,
    variables?: Variables
  ): RuleResponse {
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
