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

import {
  splitSpecificShorthands,
  splitDirectionalShorthands,
} from './utils/splitShorthands.js';

/*:: import { Rule } from 'eslint'; */

const legacyNameMapping = {
  marginStart: 'marginInlineStart',
  marginEnd: 'marginInlineEnd',
  paddingStart: 'paddingInlineStart',
  paddingEnd: 'paddingInlineEnd',
};

const shorthandAliases = {
  background: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    return splitSpecificShorthands(
      'background',
      rawValue.toString(),
      allowImportant,
    );
  },
  font: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    return splitSpecificShorthands('font', rawValue.toString(), allowImportant);
  },
  outline: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    return splitSpecificShorthands(
      'outline',
      rawValue.toString(),
      allowImportant,
    );
  },
  marginInline: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    if (splitValues.length === 1) {
      return [['marginInline', rawValue]];
    }
    const [top, right = top, _ = top, __ = right] = splitValues;
    return [
      ['marginInlineStart', top],
      ['marginInlineEnd', right],
    ];
  },
  marginBlock: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    if (splitValues.length === 1) {
      return [['marginBlock', rawValue]];
    }
    const [top, right = top, _ = top, __ = right] = splitValues;
    return [
      ['marginBlockStart', top],
      ['marginBlockEnd', right],
    ];
  },
  margin: (
    rawValue: number | string,
    allowImportant: boolean = false,
    preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    if (splitValues.length === 1) {
      return [['margin', rawValue]];
    }

    const [top, right = top, bottom = top, left = right] = splitValues;

    return preferInline
      ? [
          ['marginTop', top],
          ['marginInlineEnd', right],
          ['marginBottom', bottom],
          ['marginInlineStart', left],
        ]
      : [
          ['marginTop', top],
          ['marginRight', right],
          ['marginBottom', bottom],
          ['marginLeft', left],
        ];
  },
  padding: (
    rawValue: number | string,
    allowImportant: boolean = false,
    preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    if (splitValues.length === 1) {
      return [['padding', rawValue]];
    }

    const [top, right = top, bottom = top, left = right] =
      splitDirectionalShorthands(rawValue, allowImportant);

    return preferInline
      ? [
          ['paddingTop', top],
          ['paddingInlineEnd', right],
          ['paddingBottom', bottom],
          ['paddingInlineStart', left],
        ]
      : [
          ['paddingTop', top],
          ['paddingRight', right],
          ['paddingBottom', bottom],
          ['paddingLeft', left],
        ];
  },
  paddingInline: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    if (splitValues.length === 1) {
      return [['paddingInline', rawValue]];
    }
    const [top, right = top, _ = top, __ = right] = splitValues;
    return [
      ['paddingInlineStart', top],
      ['paddingInlineEnd', right],
    ];
  },
  paddingBlock: (
    rawValue: number | string,
    allowImportant: boolean = false,
    _preferInline: boolean = false,
  ) => {
    const splitValues = splitDirectionalShorthands(rawValue, allowImportant);
    if (splitValues.length === 1) {
      return [['paddingBlock', rawValue]];
    }
    const [top, right = top, _ = top, __ = right] = splitValues;
    return [
      ['paddingBlockStart', top],
      ['paddingBlockEnd', right],
    ];
  },
};

const stylexValidShorthands = {
  meta: {
    type: 'error',
    docs: {
      description:
        'Require shorthand properties to be split into individual properties',
      recommended: false,
      url: 'https://github.com/facebook/stylex/tree/main/packages/eslint-plugin',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          validImports: {
            type: 'array',
            items: { type: 'string' },
            default: ['stylex', '@stylexjs/stylex'],
          },
          allowImportant: {
            type: 'boolean',
            default: false,
          },
          preferInline: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: Rule.RuleContext): { ... } {
    const options = context.options[0] || {};
    const allowImportant = options.allowImportant || false;
    const preferInline = options.preferInline || false;

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
          message: `Use "${legacyNameMapping[key]}" instead of legacy formats like "${key}" to adhere to logical property naming.`,
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

      const newValues = shorthandAliases[key](
        property.value.value,
        allowImportant,
        preferInline,
      );

      if (newValues.length === 1) {
        // Single values do not need to be split
        return;
      }

      context.report({
        node: property,
        message: `Property shorthands using multiple values like "${key}: ${String(property.value.value)}" are not supported in StyleX. Separate into individual properties.`,
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

export default stylexValidShorthands as typeof stylexValidShorthands;
