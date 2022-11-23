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

const isHexColor = makeVariableCheckingRule(
  (node: ESTree.Node, variables?: Variables): RuleResponse => {
    return node.type === 'Literal' &&
      typeof node.value === 'string' &&
      /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(node.value)
      ? undefined
      : { message: 'a valid hex color (#FFAADD or #FFAADDFF)' };
  }
);

export default isHexColor;
