/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ESTree from 'estree';
import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';

export default function makeVariableCheckingRule(rule: RuleCheck): RuleCheck {
  return (node: ESTree.Expression, variables?: Variables): RuleResponse => {
    if (node.type === 'Identifier' && variables != null) {
      const existingVar = variables.get(node.name);
      if (existingVar != null) {
        return rule(existingVar);
      }
    }
    return rule(node);
  };
}
