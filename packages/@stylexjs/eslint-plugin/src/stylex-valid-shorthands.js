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
  Node,
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
import getSourceCode from './utils/getSourceCode';
import createImportTracker from './utils/createImportTracker';
/*:: import { Rule } from 'eslint'; */

const legacyNameMapping: $ReadOnly<{ [key: string]: ?string }> = {
  marginStart: 'marginInlineStart',
  marginEnd: 'marginInlineEnd',
  marginHorizontal: 'marginInline',
  marginVertical: 'marginBlock',
  paddingStart: 'paddingInlineStart',
  paddingEnd: 'paddingInlineEnd',
  paddingHorizontal: 'paddingInline',
  paddingVertical: 'paddingBlock',
};

const shorthandAliases: $ReadOnly<{
  [string]: ?ReturnType<typeof createSpecificTransformer>,
}> = {
  background: createSpecificTransformer('background'),
  font: createSpecificTransformer('font'),
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
      url: 'https://github.com/facebook/stylex/tree/main/packages/@stylexjs/eslint-plugin',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          validImports: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    as: { type: 'string' },
                  },
                },
              ],
            },
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
    const { validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'] } =
      options;
    const allowImportant = options.allowImportant || false;
    const preferInline = options.preferInline || false;

    const importTracker = createImportTracker(importsToLookFor);

    function isStylexCreateCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          importTracker.isStylexDefaultImport(node.object.name) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'create') ||
        (node.type === 'Identifier' &&
          importTracker.isStylexNamedImport('create', node.name))
      );
    }

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

      if (typeof key === 'string' && legacyNameMapping[key] != null) {
        context.report({
          node: property,
          message: `Use "${legacyNameMapping[key]}" instead of legacy formats like "${key}" to adhere to logical property naming.`,
          fix: (fixer) => {
            // $FlowFixMe[incompatible-type] - We've already checked that key is a string and in legacyNameMapping
            return fixer.replaceText(property.key, legacyNameMapping[key]);
          },
        });
      }
      if (typeof key !== 'string') {
        return;
      }

      const shorthandAliasesForKey = shorthandAliases[key];

      if (
        typeof key !== 'string' ||
        property.value.value === null ||
        shorthandAliasesForKey == null
      ) {
        return;
      }

      const v = property.value.value;
      if (typeof v !== 'string' && typeof v !== 'number') {
        return;
      }

      const newValues = shorthandAliasesForKey(v, allowImportant, preferInline);

      const isUnfixableError =
        newValues.length === 1 && newValues[0]?.[1] === CANNOT_FIX;

      if (
        !newValues ||
        (((newValues.length === 1 &&
          newValues[0][1] === property.value.value) ||
          newValues[0][1] === property.value?.value?.toString() ||
          newValues[0][1] === parseInt(property.value?.value, 10)) &&
          !isUnfixableError)
      ) {
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
              const sourceCode = getSourceCode(context);

              const startNodeIndentation = getNodeIndentation(
                sourceCode,
                property,
              );
              const newLineAndIndent = `\n${startNodeIndentation}`;

              const newPropertiesText = newValues
                .map(
                  ([key, value], index) =>
                    `${index > 0 ? newLineAndIndent : ''}${key as $FlowFixMe}: ${typeof value === 'string' ? `'${value}'` : value}`,
                )
                .join(',');

              return fixer.replaceText(property, newPropertiesText);
            }
          : null,
      });
    }

    return {
      ImportDeclaration: importTracker.ImportDeclaration,
      CallExpression(
        node: $ReadOnly<{ ...CallExpression, ...Rule.NodeParentExtension }>,
      ) {
        const isStyleXCall = isStylexCreateCallee(node.callee);

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
      'Program:exit'() {
        importTracker.clear();
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
