/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { Token } from 'eslint/eslint-ast';
import type { RuleFixer, SourceCode } from 'eslint/eslint-rule';
import type {
  CallExpression,
  ImportDeclaration,
  Node,
  Property,
  SpreadElement,
  ObjectExpression,
  Comment,
} from 'estree';
import getPropertyName from './utils/getPropertyName';
import getPropertyPriorityAndType from './utils/getPropertyPriorityAndType';
/*:: import { Rule } from 'eslint'; */

type Schema = {
  validImports: Array<string>,
  minKeys: number,
  allowLineSeparatedGroups: boolean,
};

type Stack = null | {
  upper: Stack,
  prevNode: $ReadOnly<{ ...Property, ... }> | null,
  prevName: string | null,
  prevBlankLine: boolean,
  numKeys: number,
};

function isValidOrder(prevName: string, currName: string): boolean {
  const prev = getPropertyPriorityAndType(prevName);
  const curr = getPropertyPriorityAndType(currName);

  if (prev.type !== 'string' || curr.type !== 'string') {
    return prev.priority <= curr.priority;
  }

  return prevName <= currName;
}

const stylexSortKeys = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require style properties to be sorted by key',
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
          minKeys: {
            type: 'integer',
            minimum: 2,
            default: 2,
          },
          allowLineSeparatedGroups: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: Rule.RuleContext): { ... } {
    const {
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
      minKeys = 2,
      allowLineSeparatedGroups = false,
    }: Schema = context.options[0] || {};

    const styleXDefaultImports = new Set<string>();
    const styleXCreateImports = new Set<string>();
    const styleXKeyframesImports = new Set<string>();

    function isStylexCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          styleXDefaultImports.has(node.object.name) &&
          node.property.type === 'Identifier' &&
          (node.property.name === 'create' ||
            node.property.name === 'keyframes')) ||
        (node.type === 'Identifier' &&
          (styleXCreateImports.has(node.name) ||
            styleXKeyframesImports.has(node.name)))
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

    let stack: Stack = null;
    let isInsideStyleXCreateCall = false;
    let objectExpressionNestingLevel = -1;

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

          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'keyframes'
          ) {
            styleXKeyframesImports.add(specifier.local.name);
          }
        });
      },
      CallExpression(
        node: $ReadOnly<{ ...CallExpression, ...Rule.NodeParentExtension }>,
      ) {
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

        if (objectExpressionNestingLevel > 0) {
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
        if (
          isInsideStyleXCreateCall &&
          objectExpressionNestingLevel > 0 &&
          stack
        ) {
          stack = stack.upper;
        }

        if (isInsideStyleXCreateCall) {
          objectExpressionNestingLevel--;
        }
      },
      SpreadElement(
        node: $ReadOnly<{ ...SpreadElement, ...Rule.NodeParentExtension }>,
      ) {
        if (
          isInsideStyleXCreateCall &&
          objectExpressionNestingLevel > 0 &&
          node.parent.type === 'ObjectExpression' &&
          stack
        ) {
          stack.prevName = null;
        }
      },
      Property(node: $ReadOnly<{ ...Property, ...Rule.NodeParentExtension }>) {
        if (
          !isInsideStyleXCreateCall ||
          objectExpressionNestingLevel < 1 ||
          node.parent.type === 'ObjectPattern' ||
          stack === null
        ) {
          return;
        }

        const sourceCode = context.sourceCode;
        const prevName = stack.prevName;
        const prevNode = stack?.prevNode;
        const numKeys = stack.numKeys;
        const currName = getPropertyName(node);
        let isBlankLineBetweenNodes = stack?.prevBlankLine;

        const tokens =
          stack?.prevNode &&
          sourceCode.getTokensBetween(stack.prevNode, node, {
            includeComments: true,
          });

        if (tokens && tokens.length > 0) {
          tokens.forEach((token, index) => {
            const previousToken = tokens[index - 1];

            if (
              previousToken &&
              token.loc &&
              previousToken.loc &&
              token.loc.start.line - previousToken.loc.end.line > 1
            ) {
              isBlankLineBetweenNodes = true;
            }
          });

          if (
            !isBlankLineBetweenNodes &&
            (node.loc?.start?.line ?? 0) - (tokens.at(-1)?.loc?.end.line ?? 0) >
              1
          ) {
            isBlankLineBetweenNodes = true;
          }

          if (
            !isBlankLineBetweenNodes &&
            tokens[0].loc &&
            stack?.prevNode?.loc &&
            tokens[0].loc.start.line - stack?.prevNode?.loc?.end.line > 1
          ) {
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
            // $FlowFixMe
            node,
            loc: node.key.loc,
            message: `StyleX property key "${currName}" should be above "${prevName}"`,
            // $FlowFixMe
            fix: createFix({ sourceCode, prevNode, currNode: node }),
          });
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
        styleXKeyframesImports.clear();
      },
    };
  },
};

function createFix({
  currNode,
  prevNode,
  sourceCode,
}: {
  currNode: Property,
  prevNode: Property,
  sourceCode: SourceCode,
}) {
  return function (fixer: RuleFixer) {
    const fixes = [];

    // Retrieve comments before previous node
    // Filter only comments that are on the line by themselves
    const prevNodeCommentsBefore = sourceCode
      .getCommentsBefore(prevNode)
      .filter((comment) => {
        const firstTokenBefore = sourceCode.getTokenBefore(comment, {
          includeComments: false,
        });

        if (firstTokenBefore === null) {
          return true;
        }

        return !isSameLine(firstTokenBefore, comment);
      });

    const firstNode =
      prevNodeCommentsBefore.length > 0 ? prevNodeCommentsBefore[0] : prevNode;

    const { indentation: firstLineIndentation, isTokenBeforeSameLineAsNode } =
      getNodeIndentation(sourceCode, firstNode);

    const rangeStart = firstNode.range[0] - firstLineIndentation.length;

    const prevNodeCommentsAfter = getCommentsAfterProperty(
      sourceCode,
      prevNode,
    );

    const rangeEnd =
      prevNodeCommentsAfter.length === 0
        ? sourceCode.getTokenAfter(prevNode, { includeComments: false })
            .range[1]
        : prevNodeCommentsAfter[0].range[1];

    const textToMove = sourceCode.getText().slice(rangeStart, rangeEnd);

    fixes.push(
      fixer.removeRange([
        // If previous token is not in the same line, we remove an extra char to account for newline
        rangeStart - Number(!isTokenBeforeSameLineAsNode),
        rangeEnd,
      ]),
    );

    const currNodeCommentsAfter = getCommentsAfterProperty(
      sourceCode,
      currNode,
    );

    const currNodeTokenAfter = sourceCode.getTokenAfter(currNode, {
      includeComments: false,
    });
    const hasCommaAfterCurrNode =
      currNodeTokenAfter && isCommaToken(currNodeTokenAfter);

    if (!hasCommaAfterCurrNode) {
      fixes.push(fixer.insertTextAfter(currNode, ','));
    }

    const newLine = isSameLine(prevNode, currNode) ? '' : '\n';
    const insertAfter =
      hasCommaAfterCurrNode && currNodeTokenAfter
        ? currNodeTokenAfter
        : currNode;

    fixes.push(
      fixer.insertTextAfter(
        currNodeCommentsAfter.length === 0
          ? insertAfter
          : currNodeCommentsAfter[0],
        `${newLine}${textToMove}`,
      ),
    );

    return fixes;
  };
}

function isSameLine(
  aNode: Property | Comment | Token,
  bNode: Property | Comment | Token,
): boolean {
  return Boolean(
    aNode.loc && bNode.loc && aNode.loc?.start.line === bNode.loc?.start.line,
  );
}

function isCommaToken(token: Token): boolean {
  return token.type === 'Punctuator' && token.value === ',';
}

function getCommentsAfterProperty(
  sourceCode: SourceCode,
  node: Property,
): Comment[] {
  const tokenAfter = sourceCode.getTokenAfter(node, {
    includeComments: false,
  });

  return sourceCode
    .getCommentsAfter(
      tokenAfter && isCommaToken(tokenAfter) ? tokenAfter : node,
    )
    .filter((comment) => isSameLine(node, comment));
}

function getNodeIndentation(
  sourceCode: SourceCode,
  node: Property | Comment,
): { indentation: string, isTokenBeforeSameLineAsNode: boolean } {
  const tokenBefore = sourceCode.getTokenBefore(node, {
    includeComments: false,
  });

  const isTokenBeforeSameLineAsNode =
    !!tokenBefore && isSameLine(tokenBefore, node);

  const sliceStart =
    isTokenBeforeSameLineAsNode && tokenBefore?.loc
      ? tokenBefore.loc.end.column
      : 0;

  return {
    isTokenBeforeSameLineAsNode,
    indentation: node?.loc
      ? sourceCode.lines[node.loc.start.line - 1].slice(
          sliceStart,
          node.loc.start.column,
        )
      : '',
  };
}

export default (stylexSortKeys: typeof stylexSortKeys);
