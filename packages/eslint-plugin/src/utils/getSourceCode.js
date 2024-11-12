/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

/*:: import { Rule } from 'eslint'; */
import type { SourceCode } from 'eslint/eslint-rule';

// Fallback to legacy `getSourceCode()` for compatibility with older ESLint versions
export default function getSourceCode(
  context: Rule.RuleContext,
): SourceCode | null {
  return (
    context.sourceCode ||
    (typeof context.getSourceCode === 'function'
      ? context.getSourceCode()
      : null)
  );
}
