/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { SourceCode } from 'eslint/eslint-rule';
/*:: import { Rule } from 'eslint'; */

// Fallback to legacy `getSourceCode()` for compatibility with older ESLint versions
export default function getSourceCode(context: Rule.RuleContext): SourceCode {
  const sourceCode =
    context.sourceCode ||
    (typeof context.getSourceCode === 'function'
      ? context.getSourceCode()
      : null);
  if (!sourceCode) {
    throw new Error(
      'ESLint context does not provide source code access. Please update ESLint to v>=8.40.0. See: https://eslint.org/blog/2023/09/preparing-custom-rules-eslint-v9/',
    );
  }
  return sourceCode;
}
