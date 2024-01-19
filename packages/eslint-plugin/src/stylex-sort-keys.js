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
  ImportDeclaration,
  Node,
  Property,
  SpreadElement,
  ObjectExpression,
} from 'estree';

import getStaticPropertyName from './utils/getStaticPropertyName';
/*:: import { Rule } from 'eslint'; */

type Schema = {
  validImports: Array<string>,
  minKeys: number,
  allowLineSeparatedGroups: boolean,
}

type Stack = null | {
  upper: Stack,
  prevNode: Property | null,
  prevName: string | null,
  prevBlankLine: boolean,
  numKeys: number,
};

function isValidOrder(prevName: string, currName: string): boolean {
  return prevName > currName;
}

function getPropertyName(node: Property): string | null {
  const staticName = getStaticPropertyName(node);

  return staticName !== null ? staticName : (node.key.name || null)
}

const stylexSortKeys = {
  type: 'suggestion',
  docs: {
    description: 'Require style properties to be sorted by key',
    recommended: false,
    url: 'https://github.com/facebook/stylex/tree/main/packages/eslint-plugin',
  },
  schema: [
    {
      type: 'object',
      properties: {
        validImports: {
          type: 'array',
          items: { type: 'string' },
          default: ['stylex', '@stylexjs/stylex'],
        },
        minKeys: {
          type: 'integer',
          minimum: 2,
          default: 2,
        },
        allowLineSeparatedGroups: {
          type: 'boolean',
          default: false
        }
      },
      additionalProperties: false
    },
  ],
  create(context: Rule.RuleContext): { ... } {
    const {
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
      minKeys = 2,
      allowLineSeparatedGroups = false
    }: Schema = context.options[0] || {};

    const styleXDefaultImports = new Set<string>();
    const styleXCreateImports = new Set<string>();

    function isStylexCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          styleXDefaultImports.has(node.object.name) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'create') ||
        (node.type === 'Identifier' && styleXCreateImports.has(node.name))
      );
    }

    function isStylexDeclaration(node: $ReadOnly<{ ...Node, ... }>) {
      return (
        node &&
        node.type === 'CallExpression' &&
        isStylexCallee(node.callee) &&
        node.arguments.length === 1
      );
    }

    let isInsideStyleXCreateCall = false;
    let objectExpressionNestingLevel = -1;

    let stack: Stack = null;
    const sourceCode = context.sourceCode;

    return {
      ImportDeclaration(node: ImportDeclaration) {
        if (
          node.source.type !== 'Literal' ||
          typeof node.source.value !== 'string'
        ) {
          return;
        }

        if (!importsToLookFor.includes(node.source.value)) {
          return;
        }

        node.specifiers.forEach((specifier) => {
          if (
            specifier.type === 'ImportDefaultSpecifier' ||
            specifier.type === 'ImportNamespaceSpecifier'
          ) {
            styleXDefaultImports.add(specifier.local.name);
          }

          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'create'
          ) {
            styleXCreateImports.add(specifier.local.name);
          }
        });
      },
      CallExpression(node: { ...CallExpression, ...Rule.NodeParentExtension }) {
        if (
          !isStylexDeclaration(node) ||
          !node.arguments[0].properties ||
          node.arguments[0].properties.length === 0
        ) {
          return;
        }

        isInsideStyleXCreateCall = true;
      },
      ObjectExpression(node: ObjectExpression) {
        if (isInsideStyleXCreateCall) {
          objectExpressionNestingLevel++;
        }

        if (objectExpressionNestingLevel === 1) {
          stack = {
            upper: stack,
            prevNode: null,
            prevName: null,
            prevBlankLine: false,
            numKeys: node.properties.length,
          };
        }
      },
      'ObjectExpression:exit'() {
        if (isInsideStyleXCreateCall && objectExpressionNestingLevel > 0 && stack) {
          stack = stack.upper;
        }

        if (isInsideStyleXCreateCall) {
          objectExpressionNestingLevel--;
        }
      },
      SpreadElement(node: { ...SpreadElement, ...Rule.NodeParentExtension }) {
        if (
          isInsideStyleXCreateCall &&
          objectExpressionNestingLevel > 0 &&
          node.parent.type === 'ObjectExpression' &&
          stack
        ) {
          stack.prevName = null;
        }
      },
      Property(node: Property) {
        if (
          !isInsideStyleXCreateCall ||
          objectExpressionNestingLevel < 1 ||
          node.parent.type === 'ObjectPattern' ||
          stack === null
        ) {
          return;
        }

        const prevName = stack.prevName;
        const numKeys = stack.numKeys;
        const currName = getPropertyName(node);
        let isBlankLineBetweenNodes = stack?.prevBlankLine;

        const tokens =
          stack?.prevNode &&
          sourceCode.getTokensBetween<Property>(stack.prevNode, node, {
            includeComments: true,
          });
        
        if (tokens) {
          tokens.forEach((token, index) => {
            const previousToken = tokens[index - 1];

            if (previousToken && (token.loc.start.line - previousToken.loc.end.line > 1)) {
              isBlankLineBetweenNodes = true;
            }
          });

          if (!isBlankLineBetweenNodes && (node.loc.start.line - tokens.at(-1).loc.end.line > 1)) {
            isBlankLineBetweenNodes = true;
          }

          if (!isBlankLineBetweenNodes && (tokens[0].loc.start.line - stack?.prevNode.loc.end.line > 1)) {
            isBlankLineBetweenNodes = true;
          }
        }

        if (stack) {
          stack.prevNode = node;
        }

        if (currName !== null && stack) {
          stack.prevName = currName;
        }

        if (allowLineSeparatedGroups && isBlankLineBetweenNodes && stack) {
          stack.prevBlankLine = currName === null;
          return;
        }

        if (prevName === null || currName === null || numKeys < minKeys) {
          return;
        }

        if (!isValidOrder(prevName, currName)) {
          context.report({
            node,
            loc: node.key.loc,
            message: 'Sort the keys'
          })
        }
      },
      'CallExpression:exit'() {
        if (isInsideStyleXCreateCall) {
          isInsideStyleXCreateCall = false;
        }
      },
      'Program:exit'() {
        styleXCreateImports.clear();
        styleXDefaultImports.clear();
      },
    };
  },
};

export default (stylexSortKeys: typeof stylexSortKeys);
