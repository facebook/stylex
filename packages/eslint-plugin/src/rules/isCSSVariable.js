/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  RuleCheck,
  RuleResponse,
  Variables,
} from '../stylex-valid-styles';
import type { Expression, Pattern } from 'estree';
import makeVariableCheckingRule from '../utils/makeVariableCheckingRule';

function isCSSVariable(
  node: Expression | Pattern,
  _variables?: Variables,
): RuleResponse {
  if (node.type === 'Literal') {
    const val = node.value;
    if (val != null && typeof val === 'string') {
      if (
        typeof val === 'string' &&
        val.startsWith('var(') &&
        val.endsWith(')') &&
        val.substring(4, val.length - 1).match(/--\S/) !== null // too many characters are valid css variables, lets just check for --
      ) {
        return undefined;
      }
    }
  }
  return {
    message: 'a CSS Variable',
  };
}

export default (makeVariableCheckingRule(isCSSVariable): RuleCheck);
