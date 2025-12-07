/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { Node } from 'estree';
import createImportTracker from './utils/createImportTracker';
/*:: import { Rule } from 'eslint'; */

type JSXIdentifier = {
  +type: 'JSXIdentifier',
  +name: string,
};

type JSXAttribute = {
  +type: 'JSXAttribute',
  +name: JSXIdentifier | { +type: string },
};

type JSXSpreadAttribute = {
  +type: 'JSXSpreadAttribute',
  +argument: Node,
};

type JSXOpeningElement = {
  +type: 'JSXOpeningElement',
  +attributes: $ReadOnlyArray<JSXAttribute | JSXSpreadAttribute>,
};

const stylexNoConflictingProps = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow using `className` or `style` props on elements that use `stylex.props()`',
      category: 'Best Practices',
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

    function isStylexPropsCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          importTracker.isStylexDefaultImport(node.object.name) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'props') ||
        (node.type === 'Identifier' &&
          importTracker.isStylexNamedImport('props', node.name))
      );
    }

    return {
      ImportDeclaration: importTracker.ImportDeclaration,

      JSXOpeningElement(node: JSXOpeningElement) {
        const hasStylexPropsSpread = node.attributes.some(
          (attr) =>
            attr.type === 'JSXSpreadAttribute' &&
            attr.argument.type === 'CallExpression' &&
            isStylexPropsCallee(attr.argument.callee),
        );

        if (!hasStylexPropsSpread) {
          return;
        }

        for (const attr of node.attributes) {
          if (
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            (attr.name.name === 'className' || attr.name.name === 'style')
          ) {
            context.report({
              // $FlowFixMe[incompatible-type]
              node: attr,
              message: `The \`${attr.name.name}\` prop should not be used when spreading \`stylex.props()\` to avoid conflicts.`,
            });
          }
        }
      },

      'Program:exit'() {
        importTracker.clear();
      },
    };
  },
};

export default stylexNoConflictingProps;
