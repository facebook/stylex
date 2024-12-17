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

export const CANNOT_FIX = 'CANNOT_FIX';

export const createSpecificTransformer = (
  property: string,
): ((
  rawValue: number | string,
  allowImportant?: boolean,
  _preferInline?: boolean,
) => $ReadOnlyArray<$ReadOnly<[string, number | string]>>) => {
  return (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    return splitSpecificShorthands(
      property,
      rawValue.toString(),
      allowImportant,
      typeof rawValue === 'number',
    );
  };
};

export const createDirectionalTransformer = (
  baseProperty: string,
  blockSuffix: string,
  inlineSuffix: string,
  basePropertySuffix: string = '',
): ((
  rawValue: number | string,
  allowImportant?: boolean,
  preferInline?: boolean,
) => [string, string | number][]) => {
  return (
    rawValue: number | string,
    allowImportant: boolean = false,
    preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    const [top, right = top, bottom = top, left = right] = splitValues;

    if (splitValues.length === 1) {
      return [[`${baseProperty}`, top]];
    }

    if (splitValues.length === 2 && baseProperty === "margin" || baseProperty === "padding" ) {
      return [
        [`${baseProperty}${blockSuffix}`, top],
        [`${baseProperty}${inlineSuffix}`, right],
      ];
    }

    return preferInline
      ? [
          [`${baseProperty}Top${basePropertySuffix}`, top],
          [`${baseProperty}${inlineSuffix}End${basePropertySuffix}`, right],
          [`${baseProperty}Bottom${basePropertySuffix}`, bottom],
          [`${baseProperty}${inlineSuffix}Start${basePropertySuffix}`, left],
        ]
      : [
          [`${baseProperty}Top${basePropertySuffix}`, top],
          [`${baseProperty}Right${basePropertySuffix}`, right],
          [`${baseProperty}Bottom${basePropertySuffix}`, bottom],
          [`${baseProperty}Left${basePropertySuffix}`, left],
        ];
  };
};

export const createBlockInlineTransformer = (
  baseProperty: string,
  suffix: string,
): ((
  rawValue: number | string,
  allowImportant?: boolean,
) => [string, string | number][]) => {
  return (rawValue: number | string, allowImportant: boolean = false) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    const [start, end = start] = splitValues;

    if (splitValues.length === 1) {
      return [[`${baseProperty}${suffix}`, start]];
    }
    return [
      [`${baseProperty}${suffix}Start`, start],
      [`${baseProperty}${suffix}End`, end],
    ];
  };
};

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

/* The css-shorthands-expand library does not handle spaces within variables like `rgb(0, 0, 0) or var(-test-var, 0) properly.
In cases with simple spaces between comma-separated parameters, we can preprocess the values by stripping the spaces.
If there are still spaces remaining, such as in edge cases involving `calc()` or gradient values, we won't provide an auto-fix. */
function processWhitespacesinFunctions(str: string) {
  // Strip spaces after commas within parentheses
  const strippedValue = str.replace(/\(\s*([^)]+?)\s*\)/g, (match, p1) => {
    const strippedContent = p1.replace(/,\s+/g, ',');
    return `(${strippedContent})`;
  });

  // If there are remaining spaces within the parentheses, we won't auto-fix
  const canFix = !/\([^()]*\s+[^()]*\)/.test(strippedValue);

  // Strip all spaces within the parentheses to determine if multivalue shorthand
  const fullyStripped = strippedValue.replace(
    /\(\s*([^)]+?)\s*\)/g,
    (match, p1) => {
      const strippedContent = p1.replace(/\s+/g, '');
      return `(${strippedContent})`;
    },
  );

  const isInvalidShorthand = /\s/.test(fullyStripped);

  return {
    strippedValue,
    canFix,
    isInvalidShorthand,
  };
}

/* The css-shorthands-expand library does not handle spaces within variables like `rgb(0, 0, 0) or var(-test-var, 0) properly.
After stripping the spaces, let's post-process the values to add back the missing whitespaces between parentheses after a comma */
function addSpacesAfterCommasInParentheses(str: string) {
  return str.replace(/\(([^)]+)\)/g, (match, p1) => {
    const correctedContent = p1.replace(/,\s*/g, ', ');
    return `(${correctedContent})`;
  });
}

const stripImportant = (cssProperty: string | number) =>
  cssProperty
    .toString()
    .replace(/\s*!important\s*$/, '')
    .trim();

export function splitSpecificShorthands(
  property: string,
  value: string,
  allowImportant: boolean = false,
  isNumber: boolean = false,
): $ReadOnlyArray<$ReadOnly<[string, number | string]>> {
  const { strippedValue, canFix, isInvalidShorthand } =
    processWhitespacesinFunctions(value);

  if (!canFix && isInvalidShorthand) {
    return [[toCamelCase(property), CANNOT_FIX]];
  }

  const longform = cssExpand(property, strippedValue);

  if (!longform) {
    // If css shorthand expand fails, we won't auto-fix
    return [[toCamelCase(property), CANNOT_FIX]];
  }

  // If the longform is empty or all values are the same, no need to expand
  // Relevant for properties like `borderColor` or `borderStyle`
  if (
    Object.values(longform).length === 0 ||
    Object.values(longform).every((val) => val === Object.values(longform)[0])
  ) {
    return [[toCamelCase(property), isNumber ? Number(value) : value]];
  }

  const longformStyle: {
    [key: string]: number | string,
  } = {};

  Object.entries(longform).forEach(([key, val]) => {
    const correctedVal = addSpacesAfterCommasInParentheses(val);
    longformStyle[toCamelCase(key)] = allowImportant
      ? correctedVal
      : stripImportant(correctedVal);
  });

  return Object.entries(longformStyle);
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

  if (nodes.length > 1 && new Set(nodes).size === 1) {
    // If all values are the same, no need to expand
    return [nodes[0]];
  }

  return nodes;
}
