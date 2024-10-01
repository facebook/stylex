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
        'Ensure that files exporting StyleX Vars using `stylex.defineVars` end with a specified extension (default `.stylex.jsx` or `.stylex.tsx`), and that files exporting other values must not use that extension. Mixed exports are not allowed. Users can define a custom extension using the `themeFileExtension` option.',
      category: 'Possible Errors',
      recommended: false,
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
    let hasStyleXVarsExports = false;
    let hasOtherExports = false;
    const fileName = context.getFilename();
    const options = context.options[0] || {};
    const themeFileExtension = options.themeFileExtension || '.stylex.jsx';
    const themeTsxExtension = themeFileExtension.replace('.jsx', '.tsx');

    function isStyleXVarsExport(node: Node): boolean {
      const callee =
        node.type === 'VariableDeclarator'
          ? (node.init as any)?.callee
          : node.type === 'CallExpression'
            ? node.callee
            : null;

      return (
        callee?.type === 'MemberExpression' &&
        callee.object?.type === 'Identifier' &&
        callee.object.name === 'stylex' &&
        callee.property?.type === 'Identifier' &&
        callee.property.name === 'defineVars'
      );
    }

    function checkExports(node: Node): void {
      const declaration = (node as any).declaration;

      if (!declaration) return;

      const declarations = Array.isArray(declaration.declarations)
        ? declaration.declarations
        : [declaration];

      declarations.forEach((decl: Node) => {
        if (isStyleXVarsExport(decl)) {
          hasStyleXVarsExports = true;
        } else {
          hasOtherExports = true;
        }
      });
    }

    function reportErrors(node: Node): void {
      const isStylexFile =
        fileName.endsWith(themeFileExtension) ||
        fileName.endsWith(themeTsxExtension);

      if (hasStyleXVarsExports && hasOtherExports) {
        context.report({
          node,
          message:
            'Files that export `stylex.defineVars()` must not export anything else.',
        });
      }

      if (hasStyleXVarsExports && !isStylexFile) {
        context.report({
          node,
          message: `Files that export StyleX variables defined with \`stylex.defineVars()\` must end with the \`${themeFileExtension}\` or \`${themeTsxExtension}\` extension.`,
        });
      }

      if (!hasStyleXVarsExports && isStylexFile) {
        context.report({
          node,
          message: `Only StyleX variables defined with \`stylex.defineVars()\` can be exported from a file with the \`${themeFileExtension}\` or \`${themeTsxExtension}\` extension.`,
        });
      }
    }

    return {
      'ExportNamedDeclaration, ExportDefaultDeclaration'(node: Node): void {
        checkExports(node);
        reportErrors(node);
      },
    };
  },
};

export default stylexEnforceExtension;
