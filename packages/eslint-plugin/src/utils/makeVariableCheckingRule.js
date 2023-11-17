/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Expression, Pattern } from 'estree';
import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';

export default function makeVariableCheckingRule(rule: RuleCheck): RuleCheck {
  return (node: Expression | Pattern, variables?: Variables): RuleResponse => {
    if (node.type === 'Identifier' && variables != null) {
      const existingVar = variables.get(node.name);
      if (existingVar != null) {
        return rule(existingVar);
      }
    }
    return rule(node);
  };
}
