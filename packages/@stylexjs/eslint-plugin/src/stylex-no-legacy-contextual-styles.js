/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { CallExpression } from 'estree';
import type { ValidImportSource } from './utils/createImportTracker';
import createImportTracker from './utils/createImportTracker';
import isStylexCreateDeclaration from './utils/isStylexCreateDeclaration';
/*:: import { Rule } from 'eslint'; */

type Schema = {
  validImports: Array<ValidImportSource>,
  minKeys: number,
  allowLineSeparatedGroups: boolean,
};

const stylexNoLegacyContextualStyles = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow legacy media query/pseudo class syntax',
      recommended: true,
      url: 'https://github.com/facebook/stylex/tree/main/packages/@stylexjs/eslint-plugin',
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
    const {
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
    }: Schema = context.options[0] || {};

    const importTracker = createImportTracker(importsToLookFor);

    return {
      ImportDeclaration: importTracker.ImportDeclaration,

      CallExpression(node: CallExpression): void {
        const firstArg = node.arguments[0];
        if (
          isStylexCreateDeclaration(node, importTracker) &&
          firstArg.type === 'ObjectExpression'
        ) {
          // Loop through the named styles
          firstArg.properties.forEach((property) => {
            // we only care about properties with object values
            if (
              property.type !== 'Property' ||
              property.value.type !== 'ObjectExpression'
            ) {
              return;
            }

            // Loop through the properties of the named style
            property.value.properties.forEach((property) => {
              // again, we only care about properties with object values
              if (
                property.type !== 'Property' ||
                property.value.type !== 'ObjectExpression'
              ) {
                return;
              }

              // Verify that the property is not a media query
              if (
                property.key.type === 'Literal' &&
                typeof property.key.value === 'string' &&
                property.key.value.startsWith('@')
              ) {
                context.report({
                  node: property,
                  message:
                    'This media query syntax is deprecated. Use the new syntax specified here: https://stylexjs.com/docs/learn/styling-ui/defining-styles/#media-queries-and-other--rules',
                });
              }

              // Verify the property is not a pseudo selector (but pseudo elements are ok)
              if (property.key.type === 'Literal') {
                const literalValue = property.key.value;
                if (
                  typeof literalValue === 'string' &&
                  literalValue.startsWith(':') &&
                  !literalValue.startsWith('::')
                )
                  context.report({
                    node: property,
                    message:
                      'This pseudo class syntax is deprecated. Use the new syntax specified here: https://stylexjs.com/docs/learn/styling-ui/defining-styles/#pseudo-classes',
                  });
              }
            });
          });
        }
      },
      'Program:exit'() {
        importTracker.clear();
      },
    };
  },
};

export default stylexNoLegacyContextualStyles as typeof stylexNoLegacyContextualStyles;
