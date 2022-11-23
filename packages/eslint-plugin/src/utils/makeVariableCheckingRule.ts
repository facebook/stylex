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
