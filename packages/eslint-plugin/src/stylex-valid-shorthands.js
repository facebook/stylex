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
  createBlockInlineTransformer,
  createSpecificTransformer,
  createDirectionalTransformer,
} from './utils/splitShorthands.js';

import { CANNOT_FIX } from './utils/splitShorthands.js';

/*:: import { Rule } from 'eslint'; */

const legacyNameMapping = {
  marginStart: 'marginInlineStart',
  marginEnd: 'marginInlineEnd',
  paddingStart: 'paddingInlineStart',
  paddingEnd: 'paddingInlineEnd',
};

const shorthandAliases = {
  background: createSpecificTransformer('background'),
  font: createSpecificTransformer('font'),
  border: createSpecificTransformer('border'),
  borderColor: createSpecificTransformer('border-color'),
  borderWidth: createSpecificTransformer('border-width'),
  borderStyle: createSpecificTransformer('border-style'),
  borderTop: createSpecificTransformer('border-top'),
  borderRight: createSpecificTransformer('border-right'),
  borderBottom: createSpecificTransformer('border-bottom'),
  borderLeft: createSpecificTransformer('border-left'),
  borderRadius: createSpecificTransformer('border-radius'),
  outline: createSpecificTransformer('outline'),
  margin: createDirectionalTransformer('margin', 'Block', 'Inline'),
  padding: createDirectionalTransformer('padding', 'Block', 'Inline'),
  marginBlock: createBlockInlineTransformer('margin', 'Block'),
  marginInline: createBlockInlineTransformer('margin', 'Inline'),
  paddingBlock: createBlockInlineTransformer('padding', 'Block'),
  paddingInline: createBlockInlineTransformer('padding', 'Inline'),
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

      const isUnfixableError =
        newValues.length === 1 && newValues[0]?.[1] === CANNOT_FIX;

      if ((!newValues || newValues.length === 1) && !isUnfixableError) {
        // Single values do not need to be split
        return;
      }

      context.report({
        node: property,
        message: `Property shorthands using multiple values like "${key}: ${String(property.value.value)}" are not supported in StyleX. Separate into individual properties.`,
        data: {
          property: key,
        },
        fix: !isUnfixableError
          ? (fixer) => {
              // Fallback to legacy `getSourceCode()` for compatibility with older ESLint versions
              const sourceCode =
                context.sourceCode ||
                (typeof context.getSourceCode === 'function'
                  ? context.getSourceCode()
                  : null);

              if (!sourceCode) {
                throw new Error(
                  'ESLint context does not provide source code access. Please update ESLint to v>=8.40.0. See: https://eslint.org/blog/2023/09/preparing-custom-rules-eslint-v9/',
                );
              }

              const startNodeIndentation = getNodeIndentation(
                sourceCode,
                property,
              );
              const newLineAndIndent = `\n${startNodeIndentation}`;

              const newPropertiesText = newValues
                .map(
                  ([key, value], index) =>
                    `${index > 0 ? newLineAndIndent : ''}${key}: ${typeof value === 'string' ? `'${value}'` : value}`,
                )
                .join(',');

              return fixer.replaceText(property, newPropertiesText);
            }
          : null,
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
