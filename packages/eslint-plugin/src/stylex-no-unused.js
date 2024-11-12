/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import getSourceCode from './utils/getSourceCode';
/*:: import { Rule } from 'eslint'; */
import type {
  CallExpression,
  Expression,
  Node,
  Program,
  Property,
  SpreadElement,
  RestElement,
  MemberExpression,
  AssignmentProperty,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ReturnStatement,
} from 'estree';

type PropertyValue =
  | Property
  | SpreadElement
  | AssignmentProperty
  | RestElement;

function getPropertiesByName(node: Node | null) {
  const properties = new Map<any, PropertyValue>();
  if (node == null) {
    return properties;
  }
  node.properties
    ?.filter((property) => !property.computed && !property.method)
    .forEach((property) => {
      const { key } = property;
      if (key?.type === 'Identifier') {
        properties.set(key.name, property);
      } else if (key?.type === 'Literal') {
        properties.set(key.value, property);
      }
    });
  return properties;
}

const stylexNoUnused = {
  meta: {
    fixable: 'code',
  },
  create(context: Rule.RuleContext): { ... } {
    const stylexProperties = new Map<string, Map<any, PropertyValue>>();
    let stylexImportObject = 'stylex';
    let stylexImportProperty = 'create';

    function isStylexCreate(node: Node) {
      return (
        // const styles = s.create({...})   OR    const styles = stylex.create({...})
        (stylexImportObject !== '' &&
          node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          node.object.name === stylexImportObject &&
          node.property.type === 'Identifier' &&
          node.property.name === stylexImportProperty) ||
        // const styles = c({...})   OR   const styles = create({...})
        (stylexImportObject === '' &&
          node.type === 'Identifier' &&
          node.name === stylexImportProperty)
      );
    }

    function isStylexDeclaration(node: Node) {
      return (
        node &&
        node.type === 'CallExpression' &&
        isStylexCreate(node.callee) &&
        node.arguments.length === 1 &&
        node.arguments[0].type === 'ObjectExpression'
      );
    }

    function saveStylexCalls(node: Node) {
      const id = node.id;
      const init = node.init;
      if (id && id.type === 'Identifier' && init && isStylexDeclaration(init)) {
        stylexProperties.set(
          id.name,
          getPropertiesByName(
            init.arguments && init.arguments?.length > 0
              ? init.arguments[0]
              : null,
          ),
        );
      }
    }
    function checkArguments(
      namespaces: Map<any, PropertyValue>,
    ): (argument: Expression | SpreadElement | null) => void {
      return function (argument: Expression | SpreadElement | null): void {
        if (argument) {
          if (argument.type === 'Literal') {
            namespaces.delete(argument.value);
          } else if (argument.type === 'ObjectExpression') {
            argument.properties.forEach((property) => {
              if (property.key) {
                namespaces.delete(property.key.name);
              }
            });
          } else if (argument.type === 'ArrayExpression') {
            argument.elements.forEach((element) => {
              namespaces.delete(element?.value);
            });
          } else if (argument.type === 'ConditionalExpression') {
            const { consequent, alternate } = argument;
            // check for nested expressions
            checkArguments(namespaces)(consequent);
            checkArguments(namespaces)(alternate);
          } else if (
            argument.type === 'LogicalExpression' &&
            argument.operator === '&&'
          ) {
            // check for nested expressions but only on the right
            checkArguments(namespaces)(argument.right);
          }
        }
      };
    }

    function parseStylexImportStyle(node: Node) {
      // identify stylex import
      if (
        node.source?.value === '@stylexjs/stylex' &&
        // $FlowFixMe[prop-missing]
        node.importKind === 'value' &&
        node.specifiers &&
        node.specifiers.length > 0
      ) {
        // extract stylex import pattern
        node.specifiers.forEach((specifier) => {
          const specifierType = specifier.type;
          if (specifierType === 'ImportNamespaceSpecifier') {
            // import * as stylex from '@stylexjs/stylex';
            stylexImportObject = specifier.local.name;
            stylexImportProperty = 'create';
          } else if (specifierType === 'ImportDefaultSpecifier') {
            if (specifier.local.name === 'stylex') {
              // import stylex from '@stylexjs/stylex';
              stylexImportObject = 'stylex';
              stylexImportProperty = 'create';
            }
          } else if (specifierType === 'ImportSpecifier') {
            if (specifier.imported?.name === 'create') {
              // import {create} from '@stylexjs/stylex'  OR   import {create as c} from '@stylexjs/stylex'
              stylexImportObject = '';
              stylexImportProperty = specifier.local.name;
            }
          }
        });
      }
    }

    return {
      Program(node: Program) {
        // detect stylex import style, which then decides which variables are stylex styles
        node.body
          .map((node) => (node.type === 'ImportDeclaration' ? node : null))
          .filter(Boolean)
          .forEach(parseStylexImportStyle);
        // stylex.create can only be singular variable declarations at the root
        // of the file so we can look directly on Program and populate our set.
        node.body
          .filter(({ type }) => type === 'VariableDeclaration')
          .map(({ declarations }) =>
            declarations && declarations.length === 1 ? declarations[0] : null,
          )
          .filter(Boolean)
          .filter(({ init }) => init && isStylexDeclaration(init))
          .forEach(saveStylexCalls);
      },

      // Exempt used styles: "stylex.__" or "styles[__]"
      MemberExpression(node: MemberExpression) {
        if (
          node.object.type === 'Identifier' &&
          stylexProperties.has(node.object.name)
        ) {
          if (node.computed && node.property.type !== 'Literal') {
            stylexProperties.delete(node.object.name);
          } else if (node.property.type === 'Identifier') {
            stylexProperties.get(node.object.name)?.delete(node.property.name);
          } else if (node.property.type === 'Literal') {
            stylexProperties.get(node.object.name)?.delete(node.property.value);
          }
        }
      },
      // catch function call "functionName(param)"
      CallExpression(node: CallExpression) {
        const functionName = node.callee?.name;
        if (functionName == null || !stylexProperties.has(functionName)) {
          return;
        }
        const namespaces = stylexProperties.get(functionName);
        if (namespaces == null) {
          return;
        }
        node.arguments?.forEach(checkArguments(namespaces));
      },

      // Exempt used styles: export const exportStyles = stylex.create({});
      ExportNamedDeclaration(node: ExportNamedDeclaration) {
        const declarations = node.declaration?.declarations;
        if (declarations?.length !== 1) {
          return;
        }
        const exportName = declarations[0].id.name;
        if (exportName == null || !stylexProperties.has(exportName)) {
          return;
        }
        stylexProperties.delete(exportName);
      },

      // Exempt used styles: export default exportStyles;
      ExportDefaultDeclaration(node: ExportDefaultDeclaration) {
        const exportName = node.declaration.name;
        if (exportName == null || !stylexProperties.has(exportName)) {
          return;
        }
        stylexProperties.delete(exportName);
      },

      // Exempt used styles: used as return
      ReturnStatement(node: ReturnStatement) {
        if (node.argument?.type === 'Identifier') {
          const returnName = node.argument.name;
          if (stylexProperties.has(node.argument.name)) {
            stylexProperties.delete(returnName);
          }
        }
      },

      'Program:exit'() {
        const sourceCode = getSourceCode(context);

        stylexProperties.forEach((namespaces, varName) => {
          namespaces.forEach((node, namespaceName) => {
            context.report({
              node,
              message: `Unused style detected: ${varName}.${namespaceName}`,
              fix(fixer) {
                const commaOffset =
                  sourceCode.getTokenAfter(node, {
                    includeComments: false,
                  })?.value === ','
                    ? 1
                    : 0;
                const left = sourceCode.getTokenBefore(node, {
                  includeComments: false,
                });
                if (node.range == null || left?.range == null) {
                  return null;
                }
                return fixer.removeRange([
                  left.range[1],
                  node.range[1] + commaOffset,
                ]);
              },
            });
          });
        });

        stylexProperties.clear();
      },
    };
  },
};

export default stylexNoUnused as typeof stylexNoUnused;
