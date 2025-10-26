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
        'Ensure that files exporting `defineVars` or `defineConsts` variables end with a configurable extension, defaulting to `.stylex`, with an option to enforce an additional `.const` suffix for `defineConsts`. Mixed exports are not allowed unless explicitly configured for legacy support.',
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
          enforceDefineConstsExtension: {
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
    let hasDefineConstsExports = false;
    let hasDefineVarsExports = false;
    const fileName = context.getFilename();
    const options = context.options[0] || {};
    const {
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
      legacyAllowMixedExports = false,
      enforceDefineConstsExtension = false,
    } = options;

    const themeFileExtension = (
      options.themeFileExtension || '.stylex'
    ).replace(/\.(js|ts|tsx|jsx|mjs|cjs)$/, '');

    const supportedExtensions = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];
    const allThemeExtensions = supportedExtensions.map(
      (ext) => themeFileExtension + ext,
    );
    const allConstExtensions = supportedExtensions.map(
      (ext) => themeFileExtension + '.const' + ext,
    );

    const importTracker = createImportTracker(importsToLookFor);

    function isDefineVarsExport(node: Node): boolean {
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
          callee.property.name === 'defineVars') ||
        (callee?.type === 'Identifier' &&
          importTracker.isStylexNamedImport('defineVars', callee.name))
      );
    }

    function isDefineConstsExport(node: Node): boolean {
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
          callee.property.name === 'defineConsts') ||
        (callee?.type === 'Identifier' &&
          importTracker.isStylexNamedImport('defineConsts', callee.name))
      );
    }

    function checkExports(node: Node): void {
      const declaration = (node as any).declaration;

      if (!declaration) return;

      const declarations = Array.isArray(declaration.declarations)
        ? declaration.declarations
        : [declaration];

      declarations.forEach((decl: Node) => {
        if (isDefineConstsExport(decl)) {
          hasDefineConstsExports = true;
        } else if (isDefineVarsExport(decl)) {
          hasDefineVarsExports = true;
        } else {
          hasOtherExports = true;
        }
      });
      hasRestrictedExports = hasDefineConstsExports || hasDefineVarsExports;
    }

    function reportErrors(node: Node): void {
      const isStylexFile = allThemeExtensions.some((ext) =>
        fileName.endsWith(ext),
      );
      const isConstFile = allConstExtensions.some((ext) =>
        fileName.endsWith(ext),
      );

      const currentExt =
        fileName.match(/\.(js|ts|tsx|jsx|mjs|cjs)$/)?.[0] || '';
      const suggestedExtension = currentExt
        ? themeFileExtension + currentExt
        : themeFileExtension + '.js';
      const suggestedConstExtension = currentExt
        ? themeFileExtension + '.const' + currentExt
        : themeFileExtension + '.const.js';

      // Handle defineConsts extension enforcement
      if (enforceDefineConstsExtension) {
        if (hasDefineConstsExports && !isConstFile) {
          context.report({
            node,
            message: `Files that export variables from \`stylex.defineConsts()\` must end with a \`${suggestedConstExtension}\` extension.`,
          });
        }

        if (!hasDefineConstsExports && isConstFile) {
          context.report({
            node,
            message: `Only variables from \`stylex.defineConsts()\` can be exported from a file with a \`${suggestedConstExtension}\` extension.`,
          });
        }

        if (
          hasDefineConstsExports &&
          (hasOtherExports || hasDefineVarsExports)
        ) {
          context.report({
            node,
            message:
              'Files that export variables from `stylex.defineConsts()` must not export anything else.',
          });
        }
      }

      const functionsToLint = enforceDefineConstsExtension
        ? '`stylex.defineVars()`'
        : '`stylex.defineVars()` or `stylex.defineConsts()`';

      if (hasRestrictedExports && hasOtherExports && !legacyAllowMixedExports) {
        if (!enforceDefineConstsExtension || hasDefineVarsExports) {
          context.report({
            node,
            message: `Files that export variables from ${functionsToLint} must not export anything else.`,
          });
        }
      }

      if (hasRestrictedExports && !isStylexFile) {
        if (!enforceDefineConstsExtension || hasDefineVarsExports) {
          context.report({
            node,
            message: `Files that export variables from ${functionsToLint} must end with a \`${suggestedExtension}\` extension.`,
          });
        }
      }

      if (!hasRestrictedExports && isStylexFile) {
        if (!enforceDefineConstsExtension || hasDefineVarsExports) {
          context.report({
            node,
            message: `Only variables from ${functionsToLint} can be exported from a file with a \`${suggestedExtension}\` extension.`,
          });
        }
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
