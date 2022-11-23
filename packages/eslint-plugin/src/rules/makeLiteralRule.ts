/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
import type {
  RuleResponse,
  Variables,
  RuleCheck,
} from '../stylex-valid-styles';
import type { Rule } from 'eslint';
import getDistance from '../utils/getDistance';
import * as ESTree from 'estree';
import makeVariableCheckingRule from '../utils/makeVariableCheckingRule';

// Helper functions to check for stylex values.
// All these helper functions receive a list of locally defined variables
// as well. This lets them recursively resolve values that are defined locally.
const MAX_DISTANCE = 4;
export default function makeLiteralRule(value: number | string): RuleCheck {
  function literalChecker(
    node: ESTree.Node,
    variables?: Variables
  ): RuleResponse {
    const defaultFailure = {
      message: `${value}`,
    };
    if (node.type === 'Literal') {
      if (node.value === value) {
        return undefined;
      }
      const distance =
        typeof node.value === 'string' && typeof value === 'string'
          ? getDistance(value, node.value, MAX_DISTANCE)
          : Infinity;
      const suggest =
        distance < MAX_DISTANCE
          ? {
              desc: `Did you mean "${value}"? Replace "${node.value}" with "${value}"`,
              fix: (fixer: Rule.RuleFixer): Rule.Fix | null => {
                const raw = node.raw;
                if (raw != null) {
                  const quoteType = raw.substr(0, 1);
                  return fixer.replaceText(
                    node as ESTree.SimpleLiteral,
                    `${quoteType}${value}${quoteType}`
                  );
                }
                return null;
              },
            }
          : undefined;
      return {
        ...defaultFailure,
        distance: distance,
        suggest,
      };
    }
    return defaultFailure;
  }
  return makeVariableCheckingRule(literalChecker);
}
