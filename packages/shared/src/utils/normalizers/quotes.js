/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 *
 */

'use strict';

/**
 * Make empty strings use consistent double quotes
 */

export default function normalizeQuotes(
  ast: PostCSSValueAST,
  _: mixed
): PostCSSValueAST {
  ast.walk((node) => {
    if (node.type !== 'string') {
      return;
    }
    if (node.value === '') {
      node.quote = '"';
    }
  });
  return ast;
}
