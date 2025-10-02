/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { Node, Property } from 'estree';
import createImportTracker from './utils/createImportTracker';
/*:: import { Rule } from 'eslint'; */

const stylexNoLookaheadSelectors = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow usage of stylex.when.anySibling, stylex.when.descendant, and stylex.when.siblingAfter due to limited browser support',
      category: 'Possible Errors',
      recommended: true,
    },
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
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: Rule.RuleContext): { ... } {
    const { validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'] } =
      context.options[0] || {};

    const importTracker = createImportTracker(importsToLookFor);

    // These selectors rely on the CSS `has()` selector, which does not yet have widespread browser support
    // See: https://caniuse.com/css-has
    const lookaheadSelectors = ['anySibling', 'descendant', 'siblingAfter'];

    function isStylexWhenLookaheadSelector(node: Node): boolean {
      if (
        node.type !== 'CallExpression' ||
        node.callee.type !== 'MemberExpression'
      ) {
        return false;
      }

      const callee = node.callee;
      if (callee.property.type !== 'Identifier') {
        return false;
      }

      if (callee.object.type === 'Identifier') {
        return (
          importTracker.isStylexNamedImport('when', callee.object.name) &&
          lookaheadSelectors.includes(callee.property.name)
        );
      }

      if (
        callee.object.type === 'MemberExpression' &&
        callee.object.object.type === 'Identifier' &&
        callee.object.property.type === 'Identifier'
      ) {
        const whenMember = callee.object;
        if (
          whenMember.object.type === 'Identifier' &&
          whenMember.property.type === 'Identifier'
        ) {
          return (
            importTracker.isStylexDefaultImport(whenMember.object.name) &&
            whenMember.property.name === 'when' &&
            lookaheadSelectors.includes(callee.property.name)
          );
        }
      }

      return false;
    }

    return {
      ImportDeclaration: importTracker.ImportDeclaration,

      Property(node: Property) {
        if (node.computed && node.key.type === 'CallExpression') {
          if (isStylexWhenLookaheadSelector(node.key)) {
            const key = node.key;
            if (
              key.type === 'CallExpression' &&
              key.callee.type === 'MemberExpression' &&
              key.callee.property.type === 'Identifier'
            ) {
              const methodName = key.callee.property.name;
              context.report({
                node: key,
                message: `stylex.when.${methodName} has limited browser support. See https://caniuse.com/css-has for browser compatibility.`,
              });
            }
          }
        }
      },
    };
  },
};

export default stylexNoLookaheadSelectors as typeof stylexNoLookaheadSelectors;
