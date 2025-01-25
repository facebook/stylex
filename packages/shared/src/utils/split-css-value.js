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

// Splits PostCSS value nodes for border-radius into horizontal and vertical groups by slash.
function splitNodesBySlash(
  nodes: PostCSSValueASTNode[],
): PostCSSValueASTNode[][] {
  const result = [];
  let current = [];

  for (const node of nodes) {
    const isSeparator = node.type === 'div' && node.value === '/';
    if (isSeparator) {
      if (current.length > 0) {
        result.push(current);
        current = [];
      }
    } else {
      current.push(node);
    }
  }

  if (current.length > 0) {
    result.push(current);
  }

  return result;
}

// Expands a border-radius shorthand value to an array of four values.
function expandBorderRadiusShorthand(group: PostCSSValueASTNode[]) {
  if (group.length === 2) return [group[0], group[1], group[0], group[1]];
  if (group.length === 3) return [group[0], group[1], group[2], group[1]];
  if (group.length === 4) return [group[0], group[1], group[2], group[3]];
  return Array(4).fill(group[0]);
}

// Combines two arrays of border-radius values into a single formatted string.
function combineBorderRadiusValues(verticals: string[], horizontals: string[]) {
  return verticals.map((value, i) => `${value} ${horizontals[i]}`);
}

// Using split(' ') Isn't enough because of values like calc.
export default function splitValue(
  str: TStyleValue,
  propertyName: string = '',
): $ReadOnlyArray<number | string | null> {
  if (str == null || typeof str === 'number') {
    return [str];
  }

  // This will never happen, but keeping here for Flow.
  if (Array.isArray(str)) {
    return str;
  }

  const parsed = parser(str.trim());

  let nodes: string[] = [];
  if (propertyName === 'borderRadius') {
    const groups = splitNodesBySlash(
      parsed.nodes.filter((node) => node.type !== 'space'),
    );
    if (groups.length === 1) {
      nodes = parsed.nodes.filter((node) => node.type !== 'div').map(printNode);
    } else {
      // edge case
      const vertical = expandBorderRadiusShorthand(
        groups[0].filter((node) => node.type !== 'div'),
      ).map(printNode);
      const horizontal = expandBorderRadiusShorthand(
        groups[1].filter((node) => node.type !== 'div'),
      ).map(printNode);
      nodes = combineBorderRadiusValues(vertical, horizontal);
    }
  } else {
    nodes = parsed.nodes
      .filter((node) => node.type !== 'space' && node.type !== 'div')
      .map(printNode);
  }

  if (
    nodes.length > 1 &&
    nodes[nodes.length - 1].toLowerCase() === '!important'
  ) {
    return nodes.slice(0, nodes.length - 1).map((node) => node + ' !important');
  }
  return nodes;
}
