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

const stylexEnforceExtension = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure that files exporting StyleX vars/consts using `defineVars` or `defineConsts` end with a specified extension (default `.stylex.jsx` or `.stylex.tsx`), and that files exporting other values must not use that extension. Mixed exports are not allowed. Users can define a custom extension using the `themeFileExtension` option.',
      category: 'Possible Errors',
      recommended: false,
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
    let hasRestrictedExports = false;
    let hasOtherExports = false;
    const fileName = context.getFilename();
    const options = context.options[0] || {};
    const { validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'] } =
      options;
    const themeFileExtension = options.themeFileExtension || '.stylex.jsx';
    const themeTsExtension = themeFileExtension.replace('.js', '.ts');

    const importTracker = createImportTracker(importsToLookFor);

    function isRestrictedExport(node: Node): boolean {
      const callee =
        node.type === 'VariableDeclarator'
          ? (node.init as any)?.callee
          : node.type === 'CallExpression'
            ? node.callee
            : null;

      return (
        (callee?.type === 'MemberExpression' &&
          callee.object?.type === 'Identifier' &&
          importTracker.isStylexDefaultImport(callee.object.name) &&
          callee.property?.type === 'Identifier' &&
          (callee.property.name === 'defineVars' ||
            callee.property.name === 'defineConsts')) ||
        (callee?.type === 'Identifier' &&
          (importTracker.isStylexNamedImport('defineVars', callee.name) ||
            importTracker.isStylexNamedImport('defineConsts', callee.name)))
      );
    }

    function checkExports(node: Node): void {
      const declaration = (node as any).declaration;

      if (!declaration) return;

      const declarations = Array.isArray(declaration.declarations)
        ? declaration.declarations
        : [declaration];

      declarations.forEach((decl: Node) => {
        if (isRestrictedExport(decl)) {
          hasRestrictedExports = true;
        } else {
          hasOtherExports = true;
        }
      });
    }

    function reportErrors(node: Node): void {
      const isStylexFile =
        fileName.endsWith(themeFileExtension) ||
        fileName.endsWith(themeTsExtension);

      if (hasRestrictedExports && hasOtherExports) {
        context.report({
          node,
          message:
            'Files that export StyleX variables/constants must not export anything else.',
        });
      }

      if (hasRestrictedExports && !isStylexFile) {
        context.report({
          node,
          message: `Files that export StyleX variables/constants must end with the ${themeFileExtension === themeTsExtension ? `\`${themeFileExtension}\`` : `\`${themeFileExtension}\` or \`${themeTsExtension}\``} extension.`,
        });
      }

      if (!hasRestrictedExports && isStylexFile) {
        context.report({
          node,
          message: `Only StyleX variables/constants can be exported from a file with the ${themeFileExtension === themeTsExtension ? `\`${themeFileExtension}\`` : `\`${themeFileExtension}\` or \`${themeTsExtension}\``} extension.`,
        });
      }
    }

    return {
      ImportDeclaration: importTracker.ImportDeclaration,
      'ExportNamedDeclaration, ExportDefaultDeclaration'(node: Node): void {
        checkExports(node);
        reportErrors(node);
      },
      'Program:exit'() {
        importTracker.clear();
      },
    };
  },
};

export default stylexEnforceExtension;
