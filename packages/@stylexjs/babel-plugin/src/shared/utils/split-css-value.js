/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TStyleValue } from '../common-types';

import parser from 'postcss-value-parser';

function printNode(node: PostCSSValueASTNode): string {
  return match (node) {
    {type: 'word', const value, ...} => value,

    {type: 'string', const value, const quote, ...} =>
      `${quote}${value}${quote}`,

    {type: 'function', const value, const nodes, ...} =>
      `${value}(${nodes.map(printNode).join('')})`,

    _ => node.value,
  };
}

// Using split(' ') Isn't enough because of values like calc.
export default function splitValue(
  str: TStyleValue,
): $ReadOnlyArray<number | string | null> {
  if (str == null || typeof str === 'number') {
    return [str];
  }

  // This will never happen, but keeping here for Flow.
  if (Array.isArray(str)) {
    return str;
  }

  const parsed = parser(str.trim());

  const nodes = parsed.nodes
    .filter((node) => node.type !== 'space' && node.type !== 'div')
    .map(printNode);

  if (
    nodes.length > 1 &&
    nodes[nodes.length - 1].toLowerCase() === '!important'
  ) {
    return nodes.slice(0, nodes.length - 1).map((node) => node + ' !important');
  }
  return nodes;
}
