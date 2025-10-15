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
      _preferInline,
    );
  };
};

export const createDirectionalTransformer = (
  baseProperty: string,
  blockSuffix: string,
  inlineSuffix: string,
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

    if (splitValues.length === 2) {
      return [
        [`${baseProperty}${blockSuffix}`, top],
        [`${baseProperty}${inlineSuffix}`, right],
      ];
    }

    return preferInline
      ? [
          [`${baseProperty}Top`, top],
          [`${baseProperty}${inlineSuffix}End`, right],
          [`${baseProperty}Bottom`, bottom],
          [`${baseProperty}${inlineSuffix}Start`, left],
        ]
      : [
          [`${baseProperty}Top`, top],
          [`${baseProperty}Right`, right],
          [`${baseProperty}Bottom`, bottom],
          [`${baseProperty}Left`, left],
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

/* Modern CSS color functions that should be treated as single values */
const MODERN_COLOR_FUNCTIONS = [
  'oklch',
  'oklab',
  'lch',
  'lab',
  'color',
  'hwb',
  'hsl',
  'hsb',
  'rgb',
];

/* Check if a value contains modern CSS color functions */
function containsModernColorFunction(str: string): boolean {
  const colorFunctionRegex = new RegExp(
    `\\b(${MODERN_COLOR_FUNCTIONS.join('|')})\\s*\\(`,
    'i',
  );
  return colorFunctionRegex.test(str);
}

/* Check if a value contains multiple CSS color functions separated by spaces,
   which would indicate an actual shorthand usage pattern */
function containsMultipleColorFunctions(str: string): boolean {
  const colorFunctionPattern = `\\b(${MODERN_COLOR_FUNCTIONS.join('|')})\\s*\\([^)]*\\)`;
  const multipleColorFunctionRegex = new RegExp(
    `${colorFunctionPattern}\\s+${colorFunctionPattern}`,
    'i',
  );
  return multipleColorFunctionRegex.test(str);
}

/* The css-shorthands-expand library does not handle spaces within variables like `rgb(0, 0, 0) or var(-test-var, 0) properly.
In cases with simple spaces between comma-separated parameters, we can preprocess the values by stripping the spaces.
If there are still spaces remaining, such as in edge cases involving `calc()` or gradient values, we won't provide an auto-fix. */
function processWhitespacesinFunctions(str: string) {
  // Check if this is a single modern CSS color function (should be allowed)
  const hasSingleColorFunction = containsModernColorFunction(str);

  // Check if this has multiple color functions separated by spaces (actual shorthand pattern)
  const hasMultipleColorFunctions = containsMultipleColorFunctions(str);

  // If the value contains modern CSS color functions that css-shorthand-expand doesn't understand,
  // treat it as a single value that shouldn't be expanded - unless it's an actual shorthand pattern
  if (hasSingleColorFunction && !hasMultipleColorFunctions) {
    return {
      strippedValue: str,
      canFix: true,
      isInvalidShorthand: false,
      isModernColorFunction: true,
    };
  }

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
    isModernColorFunction: false,
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
  _preferInline: boolean = false,
): $ReadOnlyArray<$ReadOnly<[string, number | string]>> {
  const { strippedValue, canFix, isInvalidShorthand, isModernColorFunction } =
    processWhitespacesinFunctions(value);

  if (!canFix && isInvalidShorthand) {
    return [[toCamelCase(property), CANNOT_FIX]];
  }

  // If this is a modern CSS color function, don't expand it - treat as single value
  if (isModernColorFunction) {
    return [[toCamelCase(property), value]];
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

  const directionMap = {
    left: 'inline-start',
    right: 'inline-end',
  };

  // List directional properties for later inline transform if needed
  const directionalProperties = [
    'border-width',
    'border-color',
    'border-style',
  ];

  const borderRadiusMap: { [string]: string } = {
    'border-top-left-radius': 'borderStartStartRadius',
    'border-top-right-radius': 'borderStartEndRadius',
    'border-bottom-left-radius': 'borderEndStartRadius',
    'border-bottom-right-radius': 'borderEndEndRadius',
  };

  const longformStyle: { [key: string]: number | string } = {};

  Object.entries(longform).forEach(([key, val]) => {
    const newKey =
      property === 'border-radius' && _preferInline
        ? borderRadiusMap[key] || null
        : directionalProperties.includes(property) &&
            _preferInline &&
            /-(left|right)/.test(key)
          ? key.replace(
              /-(left|right)/,
              (_, direction) => `-${directionMap[direction]}`,
            )
          : key;

    if (!newKey) {
      // If css shorthand expand fails, we won't auto-fix
      return [[toCamelCase(property), CANNOT_FIX]];
    }

    const correctedVal = addSpacesAfterCommasInParentheses(val);
    longformStyle[toCamelCase(newKey)] = allowImportant
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
