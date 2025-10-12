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
  Node,
  Property,
  SpreadElement,
  ObjectExpression,
  Comment,
} from 'estree';
import getSourceCode from './utils/getSourceCode';
import getPropertyName from './utils/getPropertyName';
import getPropertyPriorityAndType from './utils/getPropertyPriorityAndType';
import createImportTracker from './utils/createImportTracker';
/*:: import { Rule } from 'eslint'; */

type Schema = {
  validImports: Array<
    | string
    | {
        from: string,
        as: string,
      },
  >,
  order: 'asc' | 'clean-order' | 'recess-order',
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

function isValidOrder(
  prevName: string,
  currName: string,
  order: Schema['order'],
): boolean {
  const prev = getPropertyPriorityAndType(prevName, order);
  const curr = getPropertyPriorityAndType(currName, order);

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
          order: {
            enum: ['asc', 'clean-order', 'recess-order'],
            default: 'asc',
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
      order = 'asc',
      minKeys = 2,
      allowLineSeparatedGroups = false,
    }: Schema = context.options[0] || {};

    const importTracker = createImportTracker(importsToLookFor);

    function isStylexCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          importTracker.isStylexDefaultImport(node.object.name) &&
          node.property.type === 'Identifier' &&
          (node.property.name === 'create' ||
            node.property.name === 'keyframes')) ||
        (node.type === 'Identifier' &&
          (importTracker.isStylexNamedImport('create', node.name) ||
            importTracker.isStylexNamedImport('keyframes', node.name)))
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
      ImportDeclaration: importTracker.ImportDeclaration,
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
          (node.parent.type as $FlowFixMe) === 'ObjectExpression' &&
          stack
        ) {
          stack.prevName = null;
        }
      },
      Property(node: $ReadOnly<{ ...Property, ...Rule.NodeParentExtension }>) {
        if (
          !isInsideStyleXCreateCall ||
          objectExpressionNestingLevel < 1 ||
          (node.parent.type as $FlowFixMe) === 'ObjectPattern' ||
          stack === null
        ) {
          return;
        }

        const prevName = stack.prevName;
        const prevNode = stack?.prevNode;
        const numKeys = stack.numKeys;
        const currName = getPropertyName(node);
        let isBlankLineBetweenNodes = stack?.prevBlankLine;

        const sourceCode = getSourceCode(context);

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

        if (!isValidOrder(prevName, currName, order)) {
          context.report({
            // $FlowFixMe
            node,
            loc: node.key.loc,
            message: `StyleX property key "${currName}" should be above "${prevName}"`,
            // $FlowFixMe
            fix: createFix({ prevNode, currNode: node, sourceCode }),
          });
        }
      },
      'CallExpression:exit'(
        node: $ReadOnly<{ ...CallExpression, ...Rule.NodeParentExtension }>,
      ) {
        if (isInsideStyleXCreateCall && isStylexDeclaration(node)) {
          isInsideStyleXCreateCall = false;
        }
      },
      'Program:exit'() {
        importTracker.clear();
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
    // Need to handle the case if there is white space between node and comment above
    // This can be especially tricky if the "sort between space groups" option is turned on
    const fixes = [];

    // Retrieve comments before the previous node
    const prevNodeCommentsBefore = getPropertyCommentsBefore(prevNode);

    // Start node for the entire context with comments of prevNode
    const prevNodeContextStartNode =
      prevNodeCommentsBefore.length > 0 ? prevNodeCommentsBefore[0] : prevNode;

    const { indentation: startNodeIndentation, isTokenBeforeSameLineAsNode } =
      getNodeIndentation(prevNodeContextStartNode);

    const prevNodeSameLineComment = getPropertySameLineComment(prevNode);

    const tokenAfterPrevNode = sourceCode.getTokenAfter(prevNode, {
      includeComments: false,
    });

    const prevNodeContextEndNode =
      prevNodeSameLineComment ?? tokenAfterPrevNode;

    if (!prevNodeContextEndNode?.range || !prevNodeContextStartNode.range) {
      // Early return if range or prevNode doesn't exist
      return [];
    }

    const rangeStart =
      prevNodeContextStartNode.range[0] - startNodeIndentation.length;

    const rangeEnd = prevNodeContextEndNode.range[1];

    const textToMove = sourceCode.getText().slice(rangeStart, rangeEnd);

    fixes.push(
      fixer.removeRange([
        // If previous token is not on the same line, we remove an extra char to account for newline
        rangeStart - Number(!isTokenBeforeSameLineAsNode),
        rangeEnd,
      ]),
    );

    const currNodeSameLineComment = getPropertySameLineComment(currNode);

    const tokenAfterCurrNode = sourceCode.getTokenAfter(currNode, {
      includeComments: false,
    });

    const hasCommaAfterCurrNode =
      tokenAfterCurrNode && isCommaToken(tokenAfterCurrNode);

    if (!hasCommaAfterCurrNode) {
      fixes.push(fixer.insertTextAfter(currNode, ','));
    }

    const newLine = isSameLine(prevNode, currNode) ? '' : '\n';
    // If token after the current node is a comma then we insert after the comma
    // Otherwise we insert after the current node because there is a guaranteed fix to add comma (above)
    const fallbackNode =
      hasCommaAfterCurrNode && tokenAfterCurrNode
        ? tokenAfterCurrNode
        : currNode;

    fixes.push(
      fixer.insertTextAfter(
        currNodeSameLineComment ?? fallbackNode,
        `${newLine}${textToMove}`,
      ),
    );

    return fixes;
  };

  function getEmptyLineCountBetweenNodes(
    aNode: Property | Comment,
    bNode: Property | Comment,
  ): number {
    const [upperNode, lowerNode] = [aNode, bNode].sort(
      (a, b) => (a.loc?.start.line ?? 0) - (b.loc?.start.line ?? 0),
    );

    const upperNodeLine = upperNode.loc?.start.line;
    const lowerNodeLine = lowerNode.loc?.start.line;

    if (upperNodeLine === undefined || lowerNodeLine === undefined) {
      throw new Error('Invalid node location');
    }

    return sourceCode.lines
      .slice(upperNodeLine, lowerNodeLine - 1)
      .filter((line) => /^[ \t]*$/.test(line)).length;
  }

  function getPropertyCommentsBefore(node: Property): Comment[] {
    return sourceCode.getCommentsBefore(node).filter((comment) => {
      const tokenBefore = sourceCode.getTokenBefore(comment, {
        includeComments: false,
      });

      if (tokenBefore === null) {
        return true;
      }

      // Only comments that have no other tokens on the same line are considered
      // Also, comments that have at least one empty line between node and comment will be ignored
      // For example:
      //
      //  create({
      //    foo: { // comment above a <- this comment does not belong to property below
      //      // comment above b <- this comment does not belong to property below
      //
      //      // comment above c <- this comment belongs to property below
      //      display: 'red'
      //    }
      //  })
      //
      return (
        !isSameLine(tokenBefore, comment) &&
        getEmptyLineCountBetweenNodes(node, comment) === 0
      );
    });
  }

  function getPropertySameLineComment(node: Property): Comment | void {
    const tokenAfter = sourceCode.getTokenAfter(node, {
      includeComments: false,
    });

    const comments = sourceCode
      .getCommentsAfter(
        tokenAfter && isCommaToken(tokenAfter) ? tokenAfter : node,
      )
      .filter((comment) => isSameLine(node, comment));

    return comments[0];
  }

  function getNodeIndentation(node: Property | Comment): {
    indentation: string,
    isTokenBeforeSameLineAsNode: boolean,
  } {
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

export default stylexSortKeys as typeof stylexSortKeys;
