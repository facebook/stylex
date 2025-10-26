/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Expression, Pattern, Property } from 'estree';
import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';
/*:: import { Rule } from 'eslint'; */

export default function makeVariableCheckingRule(rule: RuleCheck): RuleCheck {
  const varCheckingRule = (
    node: Expression | Pattern,
    variables?: Variables,
    prop?: $ReadOnly<Property>,
    context?: Rule.RuleContext,
  ): RuleResponse => {
    if (
      // $FlowFixMe[invalid-compare]
      node.type === 'TSSatisfiesExpression' ||
      // $FlowFixMe[invalid-compare]
      node.type === 'TSAsExpression'
    ) {
      return varCheckingRule(node.expression, variables, prop, context);
    }
    if (node.type === 'Identifier' && variables != null) {
      const existingVar = variables.get(node.name);
      if (existingVar === 'ARG') {
        return undefined;
      }
      if (existingVar != null) {
        return varCheckingRule(existingVar, variables, prop, context);
      }
    }
    return rule(node, variables, prop, context);
  };

  return varCheckingRule;
}
