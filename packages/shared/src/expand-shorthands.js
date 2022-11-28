/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import parser from 'postcss-value-parser';

function printNode(node: PostCSSValueASTNode) {
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

// Using split(' ') Isn't enough bcause of values like calc.
function splitValue(str: string) {
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

// TODO: to be added later.
// const aliases = {
//   marginInlineStart: (rawValue) => [['marginStart', rawValue]],
//   marginInlineEnd: (rawValue) => [['marginEnd', rawValue]],
//   marginInline: (rawValue) => [
//     ['marginStart', rawValue],
//     ['marginEnd', rawValue],
//   ],
//   paddingInlineStart: (rawValue) => [['paddingStart', rawValue]],
//   paddingInlineEnd: (rawValue) => [['paddingEnd', rawValue]],
//   paddingInline: (rawValue) => [
//     ['paddingStart', rawValue],
//     ['paddingEnd', rawValue],
//   ],
//   // 'borderInlineStart': (rawValue) => [['borderStart', rawValue]],
//   // 'borderInlineEnd': (rawValue) => [['borderEnd', rawValue]],
//   // // This will need to change.
//   // 'borderInline': (rawValue) => [
//   //   ['borderStart', rawValue],
//   //   ['borderEnd', rawValue],
//   // ],
// };

/**
 * Shorthand properties:
 * - [x] all - Should be banned
 * - [ ] animation
 * - [ ] background
 * - [-] border
 * - [x] border-block-end
 * - [x] border-block-start
 * - [ ] border-bottom
 * - [x] border-color
 * - [x] border-image
 * - [x] border-inline-end
 * - [x] border-inline-start
 * - [ ] border-left
 * - [x] border-radius
 * - [ ] border-right
 * - [x] border-style
 * - [ ] border-top
 * - [x] border-width
 * - [ ] column-rule
 * - [ ] columns
 * - [ ] flex
 * - [ ] flex-flow
 * - [ ] font
 * - [ ] gap
 * - [ ] grid
 * - [ ] grid-area
 * - [ ] grid-column
 * - [ ] grid-row
 * - [ ] grid-template
 * - [ ] list-style
 * - [x] margin
 * - [ ] mask
 * - [ ] offset
 * - [ ] outline
 * - [x] overflow
 * - [x] padding
 * - [ ] place-content
 * - [ ] place-items
 * - [ ] place-self
 * - [ ] scroll-margin
 * - [ ] scroll-padding
 * - [ ] text-decoration
 * - [ ] text-emphasis
 * - [ ] transition
 */

const expansions = {
  // ...aliases,
  border: (rawValue: string) => {
    return [
      ['borderTop', rawValue],
      ['borderEnd', rawValue],
      ['borderBottom', rawValue],
      ['borderStart', rawValue],
    ];
  },
  /*
  // Add this later, as this will be a breaking change
  border: (rawValue: string) => {
    if (typeof rawValue === 'number') {
      return expansions.borderWidth(rawValue);
    }
    const [width, style, color] = splitValue(rawValue);
    return [
      ...expansions.borderWidth(width),
      ...expansions.borderStyle(style),
      ...expansions.borderColor(color),
    ];
  }
  */
  borderColor: (rawValue: string) => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopColor', top],
      ['borderEndColor', right],
      ['borderBottomColor', bottom],
      ['borderStartColor', left],
    ];
  },
  borderHorizontal: (rawValue: string) => {
    return [
      ['borderStart', rawValue],
      ['borderEnd', rawValue],
    ];
  },
  borderStyle: (rawValue: string) => {
    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['borderTopStyle', top],
      ['borderEndStyle', right],
      ['borderBottomStyle', bottom],
      ['borderStartStyle', left],
    ];
  },
  borderVertical: (rawValue: string) => {
    return [
      ['borderTop', rawValue],
      ['borderBottom', rawValue],
    ];
  },
  borderWidth: (rawValue: string) => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);

    return [
      ['borderTopWidth', top],
      ['borderEndWidth', right],
      ['borderBottomWidth', bottom],
      ['borderStartWidth', left],
    ];
  },
  borderRadius: (rawValue: string) => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'string'
        ? splitValue(rawValue)
        : typeof rawValue === 'number'
        ? [rawValue]
        : rawValue; // remove

    return [
      ['borderTopStartRadius', top],
      ['borderTopEndRadius', right],
      ['borderBottomEndRadius', bottom],
      ['borderBottomStartRadius', left],
    ];
  },
  margin: (rawValue: string) => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);

    return [
      ['marginTop', top],
      ['marginEnd', right],
      ['marginBottom', bottom],
      ['marginStart', left],
    ];
  },
  marginHorizontal: (rawValue: string) => {
    return [
      ['marginStart', rawValue],
      ['marginEnd', rawValue],
    ];
  },
  marginVertical: (rawValue: string) => {
    return [
      ['marginTop', rawValue],
      ['marginBottom', rawValue],
    ];
  },

  overflow: (rawValue: string) => {
    const [x, y = x] = splitValue(rawValue);
    return [
      ['overflowX', x],
      ['overflowY', y],
    ];
  },
  padding: (rawValue: string) => {
    const [top, right = top, bottom = top, left = right] =
      typeof rawValue === 'number' ? [rawValue] : splitValue(rawValue);

    return [
      ['paddingTop', top],
      ['paddingEnd', right],
      ['paddingBottom', bottom],
      ['paddingStart', left],
    ];
  },
  paddingHorizontal: (rawValue: string) => {
    return [
      ['paddingStart', rawValue],
      ['paddingEnd', rawValue],
    ];
  },
  paddingVertical: (rawValue: string) => {
    return [
      ['paddingTop', rawValue],
      ['paddingBottom', rawValue],
    ];
  },
};

export const expandedKeys: $ReadOnlyArray<string> = Object.keys(expansions);

export default function flatMapExpandedShorthands<T>(
  objEntry: [string, T]
): Array<[string, T]> {
  const [key, value] = objEntry;
  const expansion = expansions[key];
  if (expansion) {
    if (Array.isArray(value)) {
      throw new Error(
        'Cannot use fallbacks for shorthands. Use the expansion instead.'
      );
    }
    return expansion(value);
  }
  return [objEntry];
}
