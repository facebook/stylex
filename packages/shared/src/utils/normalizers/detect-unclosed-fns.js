/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import * as messages from '../../messages';

/**
 * Remove leading zeros from numbers
 */
export default function detectUnclosedFns(
  ast: PostCSSValueAST,
  _: mixed
): PostCSSValueAST {
  ast.walk((node) => {
    if (node.type === 'function' && node.unclosed) {
      throw new Error(messages.LINT_UNCLOSED_FUNCTION);
    }
  });
  return ast;
}
