/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  CallExpression,
  Property,
  ObjectExpression,
  Comment,
} from 'estree';

import type { SourceCode } from 'eslint/eslint-rule';

import type { Token } from 'eslint/eslint-ast';

import splitValue from './utils/splitShorthands.js';

/*:: import { Rule } from 'eslint'; */

type Stack = null | {
  upper: Stack,
  prevNode: $ReadOnly<{ ...Property, ... }> | null,
  prevName: string | null,
  prevBlankLine: boolean,
  numKeys: number,
};

const legacyNameMapping = {
  marginStart: 'marginInlineStart',
  marginEnd: 'marginInlineEnd',
  paddingStart: 'paddingInlineStart',
  paddingEnd: 'paddingInlineEnd',
};

const shorthandAliases = {
  marginInline: (rawValue: number | string) => [
    ['marginInlineStart', rawValue],
    ['marginInlineEnd', rawValue],
  ],
  margin: (rawValue: number | string) => {
    const splitValues = splitValue(rawValue);
    if (splitValues.length === 1) {
      return [['margin', splitValues[0]]];
    }
    const [top, right = top, bottom = top, left = right] = splitValues;

    return [
      ['marginTop', top],
      ['marginInlineEnd', right],
      ['marginBottom', bottom],
      ['marginInlineStart', left],
    ];
  },
  padding: (rawValue: number | string) => {
    const splitValues = splitValue(rawValue);
    if (splitValues.length === 1) {
      return [['padding', splitValues[0]]];
    }

    const [top, right = top, bottom = top, left = right] = splitValue(rawValue);

    return [
      ['paddingTop', top],
      ['paddingInlineEnd', right],
      ['paddingBottom', bottom],
      ['paddingInlineStart', left],
    ];
  },
  paddingInline: (rawValue: number | string) => [
    ['paddingInlineStart', rawValue],
    ['paddingInlineEnd', rawValue],
  ],
};

const stylexMarginPaddingShorthand = {
  meta: {
    messages: {
      noMarginShorthands:
        'Property shorthands like `{{property}}: 0 0 0 0` are not supported in styleX. Separate into individual properties.',
      noLegacyFormats:
        'Use {{correctProperty}} instead of legacy formats like {{incorrectProperty}} to adhere to logical property naming.',
    },
    fixable: 'code',
  },
  create(context: Rule.RuleContext): { ... } {
    function validateObject(obj: ObjectExpression) {
      for (const prop of obj.properties) {
        if (prop.type === 'SpreadElement') {
          continue;
        }
        if (prop.value.type === 'ObjectExpression') {
          validateObject(prop.value);
        } else {
          validateProperty(prop);
        }
      }
    }

    function validateProperty(property: Property) {
      if (property.computed) {
        // can't resolve computed keys
        return;
      }

      let key;
      if (property.key.type === 'Identifier') {
        key = property.key.name;
      } else if (property.key.type === 'Literal') {
        key = property.key.value;
      }

      if (typeof key === 'string' && key in legacyNameMapping) {
        context.report({
          node: property,
          message:
            'Use {{correctProperty}} instead of legacy formats like {{incorrectProperty}} to adhere to logical property naming.',
          data: {
            correctProperty: legacyNameMapping[key],
            incorrectProperty: key,
          },
          fix: (fixer) => {
            // $FlowFixMe - We've already checked that key is a string and in legacyNameMapping
            return fixer.replaceText(property.key, legacyNameMapping[key]);
          },
        });
      }

      if (
        typeof key !== 'string' ||
        !shorthandAliases.hasOwnProperty(key) ||
        property.value.value === null
      ) {
        return;
      }

      const newValues = shorthandAliases[key](property.value.value);

      if (newValues.length === 1) {
        // Single values do not need to be split
        return;
      }

      context.report({
        node: property,
        message: `Property shorthands like ${key}: ${String(property.value.value)} are not supported in styleX. Separate into individual properties.`,
        data: {
          property: key,
        },
        fix: (fixer) => {
          const sourceCode = context.sourceCode;
          const startNodeIndentation = getNodeIndentation(sourceCode, property);
          const newLineAndIndent = `\n${startNodeIndentation}`;

          const newPropertiesText = newValues
            .map(
              ([key, value], index) =>
                `${index > 0 ? newLineAndIndent : ''}${key}: ${typeof value === 'string' ? `'${value}'` : value}`,
            )
            .join(',');

          return fixer.replaceText(property, newPropertiesText);
        },
      });
    }

    return {
      CallExpression(
        node: $ReadOnly<{ ...CallExpression, ...Rule.NodeParentExtension }>,
      ) {
        const isStyleXCall =
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'stylex' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'create';

        if (!isStyleXCall) {
          return;
        }

        const namespacesObj = node.arguments[0];
        if (namespacesObj.type !== 'ObjectExpression') {
          return;
        }

        for (const namespaceProp of namespacesObj.properties) {
          if (namespaceProp.type !== 'Property') {
            continue;
          }

          if (namespaceProp.value.type === 'ObjectExpression') {
            validateObject(namespaceProp.value);
          }
        }
      },
    };
  },
};

function isSameLine(
  aNode: Property | Comment | Token,
  bNode: Property | Comment | Token,
): boolean {
  return Boolean(
    aNode.loc && bNode.loc && aNode.loc?.start.line === bNode.loc?.start.line,
  );
}

function getNodeIndentation(
  sourceCode: SourceCode,
  node: Property | Comment,
): string {
  const tokenBefore = sourceCode.getTokenBefore(node, {
    includeComments: false,
  });

  const isTokenBeforeSameLineAsNode =
    !!tokenBefore && isSameLine(tokenBefore, node);

  const sliceStart =
    isTokenBeforeSameLineAsNode && tokenBefore?.loc
      ? tokenBefore.loc.end.column
      : 0;

  return node?.loc
    ? sourceCode.lines[node.loc.start.line - 1].slice(
        sliceStart,
        node.loc.start.column,
      )
    : '';
}

export default stylexMarginPaddingShorthand as typeof stylexMarginPaddingShorthand;
