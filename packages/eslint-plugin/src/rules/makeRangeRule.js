/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Node } from 'estree';
import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';
import makeVariableCheckingRule from '../utils/makeVariableCheckingRule';

export default function makeRangeRule(
  min: number,
  max: number,
  message: string,
): RuleCheck {
  function rangeChecker(node: Node, _variables?: Variables): RuleResponse {
    if (
      node.type === 'Literal' &&
      typeof node.value === 'number' &&
      node.value >= min &&
      node.value <= max
    ) {
      return undefined;
    }
    return {
      message,
    };
  }
  return makeVariableCheckingRule(rangeChecker);
}
