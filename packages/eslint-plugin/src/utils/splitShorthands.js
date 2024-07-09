/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import parser from 'postcss-value-parser';
import cssExpand from 'css-shorthand-expand';

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

const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

const stripImportant = (cssProperty: string | number) =>
  cssProperty
    .toString()
    .replace(/\s*!important\s*$/, '')
    .trim();

export function splitSpecificShorthands(
  property: string,
  value: string,
  allowImportant: boolean = false,
): $ReadOnlyArray<$ReadOnlyArray<mixed>> {
  const longform = cssExpand(property, value);
  const longformJsx: {
    [key: string]: number | string,
  } = {};

  Object.entries(longform).forEach(([key, val]) => {
    longformJsx[toCamelCase(key)] = allowImportant ? val : stripImportant(val);
  });

  return Object.entries(longformJsx);
}

export function splitDirectionalShorthands(
  str: number | string,
  allowImportant: boolean = false,
): $ReadOnlyArray<number | string> {
  let processedStr = str;

  if (str == null || (typeof str !== 'string' && typeof str !== 'number')) {
    return [str];
  }

  if (typeof str === 'number') {
    processedStr = String(str);
  }

  if (Array.isArray(processedStr)) {
    return processedStr;
  }

  if (typeof processedStr !== 'string') {
    return [processedStr];
  }

  const parsed = parser(processedStr.trim());

  const nodes = parsed.nodes
    .filter((node) => node.type !== 'space' && node.type !== 'div')
    .map(printNode);

  if (typeof str === 'number') {
    // if originally a number, let's preserve that here
    const processedNodes = nodes.map(parseFloat);
    return processedNodes;
  }

  if (
    nodes.length > 1 &&
    nodes[nodes.length - 1].toLowerCase() === '!important' &&
    allowImportant
  ) {
    return nodes.slice(0, nodes.length - 1).map((node) => node + ' !important');
  }

  return nodes;
}
