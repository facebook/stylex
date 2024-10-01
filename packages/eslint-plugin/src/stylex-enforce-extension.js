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

/*:: import { Rule } from 'eslint'; */

const stylexEnforceExtension = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Ensure that files exporting `stylex.defineVars` end with a specified extension (default `.stylex.jsx` or `.stylex.tsx`), and those that don't must not.",
      category: 'Possible Errors',
      recommended: false,
    },
    messages: {
      invalidFilenameWithDefineVars:
        'Files that export `stylex.defineVars` must have a `{{ extension }}` or `{{ tsxExtension }}` extension.',
      invalidFilenameWithoutDefineVars:
        'Files that do not export `stylex.defineVars` must not have a `{{ extension }}` or `{{ tsxExtension }}` extension.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          themeFileExtension: {
            type: 'string',
            default: '.stylex.jsx',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: Rule.RuleContext): { ... } {
    let hasDefineVarsExport = false;
    const fileName = context.getFilename();
    const options = context.options[0] || {};
    const themeFileExtension = options.themeFileExtension || '.stylex.jsx';
    const themeTsxExtension = themeFileExtension.replace('.jsx', '.tsx');

    return {
      ExportNamedDeclaration(node: Node) {
        if (node.declaration && node.declaration.declarations) {
          node.declaration.declarations.forEach((declaration) => {
            const init = declaration.init;

            if (
              init &&
              init.callee &&
              init.callee.object &&
              init.callee.object.name === 'stylex' &&
              init.callee.property &&
              init.callee.property.name === 'defineVars'
            ) {
              hasDefineVarsExport = true;
            }
          });
        }
      },
      'Program:exit'(node: Node) {
        const isStylexFile =
          fileName.endsWith(themeFileExtension) ||
          fileName.endsWith(themeTsxExtension);

        if (hasDefineVarsExport && !isStylexFile) {
          context.report({
            node,
            message: `Files that export \`stylex.defineVars\` must have a \`${themeFileExtension}\` or \`${themeTsxExtension}\` extension.`,
          });
        } else if (!hasDefineVarsExport && isStylexFile) {
          context.report({
            node,
            message: `Files that do not export \`stylex.defineVars\` must not have a \`${themeFileExtension}\` or \`${themeTsxExtension}\` extension.`,
          });
        }
      },
    };
  },
};

export default stylexEnforceExtension as typeof stylexEnforceExtension;
