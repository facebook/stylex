/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

/**
 * Remove leading zeros from numbers
 */
import dashify from '../dashify';

export default function convertCamelCasedTransitionProps(
  ast: PostCSSValueAST,
  key: string,
): PostCSSValueAST {
  if (key !== 'transitionProperty') {
    return ast;
  }
  const nodes = ast.nodes;
  if (!nodes) {
    return ast;
  }
  nodes.forEach((node) => {
    if (node.type === 'word' && !node.value.startsWith('--')) {
      node.value = dashify(node.value);
    }
  });
  return ast;
}
