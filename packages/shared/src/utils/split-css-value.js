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
  switch (node.type) {
    case 'word':
    case 'string':
      return `${node.value}`;
    case 'function':
      return `${node.value}(${node.nodes.map(printNode).join('')})`;
    default:
      return node.value;
  }
}

// Merges slash-separated values within nodes into single nodes.
function combineNodesWithSlash(nodes: PostCSSValueASTNode[]) {
  const result = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type !== 'div' || node.value !== '/') {
      result.push(node);
      continue;
    }

    if (i === 0 || i === nodes.length - 1) {
      result.push(node);
      continue;
    }

    const prev = result.at(-1);
    const next = nodes[i + 1];

    if (!prev || !next || prev.type !== 'word' || next.type !== 'word') {
      result.push(node);
      continue;
    }

    result.pop();
    const combinedNode = {
      ...prev,
      value: prev.value + node.value + next.value,
      sourceEndIndex: next.sourceEndIndex,
    };
    result.push(combinedNode);
    i++;
  }

  return result;
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

  const nodes = combineNodesWithSlash(
    parsed.nodes.filter((node) => node.type !== 'space'),
  )
    .filter((node) => node.type !== 'div')
    .map(printNode);

  if (
    nodes.length > 1 &&
    nodes[nodes.length - 1].toLowerCase() === '!important'
  ) {
    return nodes.slice(0, nodes.length - 1).map((node) => node + ' !important');
  }
  return nodes;
}
