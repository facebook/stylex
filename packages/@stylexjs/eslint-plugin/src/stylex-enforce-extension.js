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
        'Ensure that files exporting StyleX vars/consts using `defineVars` or `defineConsts` end with a specified extension (default `.stylex`), and that files exporting other values must not use that extension. Mixed exports are not allowed. Users can define a custom extension using the `themeFileExtension` option.',
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
            default: '.stylex',
          },
          // This is a legacy option that allows mixed exports in theme files. This is for internal legacy patterns and should not be used by external users.
          legacyAllowMixedExports: {
            type: 'boolean',
            default: false,
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
    const {
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
      legacyAllowMixedExports = false,
    } = options;

    const themeFileExtension = (
      options.themeFileExtension || '.stylex'
    ).replace(/\.(js|ts|tsx|jsx|mjs|cjs)$/, '');

    const supportedExtensions = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];
    const allThemeExtensions = supportedExtensions.map(
      (ext) => themeFileExtension + ext,
    );

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
      const isStylexFile = allThemeExtensions.some((ext) =>
        fileName.endsWith(ext),
      );

      if (hasRestrictedExports && hasOtherExports && !legacyAllowMixedExports) {
        context.report({
          node,
          message:
            'Files that export variables from `stylex.defineVars()` or `stylex.defineConsts()` must not export anything else.',
        });
      }

      const currentExt =
        fileName.match(/\.(js|ts|tsx|jsx|mjs|cjs)$/)?.[0] || '';
      const suggestedExtension = currentExt
        ? themeFileExtension + currentExt
        : themeFileExtension + '.js';

      if (hasRestrictedExports && !isStylexFile) {
        context.report({
          node,
          message: `Files that export variables from \`stylex.defineVars()\` or \`stylex.defineConsts()\` must end with a \`${suggestedExtension}\` extension.`,
        });
      }

      if (!hasRestrictedExports && isStylexFile) {
        context.report({
          node,
          message: `Only variables from \`stylex.defineVars()\` or \`stylex.defineConsts()\` can be exported from a file with a \`${suggestedExtension}\` extension.`,
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
