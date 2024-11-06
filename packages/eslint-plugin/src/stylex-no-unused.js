/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

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
} from 'estree';

type PropertyValue =
  | Property
  | SpreadElement
  | AssignmentProperty
  | RestElement;
function isStylexCallee(node: Node) {
  return (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'stylex' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'create'
  );
}

function isStylexDeclaration(node: Node) {
  return (
    node &&
    node.type === 'CallExpression' &&
    isStylexCallee(node.callee) &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'ObjectExpression'
  );
}

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

    return {
      Program(node: Program) {
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

      // detect stylex usage "stylex.__" or "styles[__]"
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

      ExportDefaultDeclaration(node: ExportDefaultDeclaration) {
        const exportName = node.declaration.name;
        if (exportName == null || !stylexProperties.has(exportName)) {
          return;
        }
        stylexProperties.delete(exportName);
      },

      'Program:exit'() {
        // Fallback to legacy `getSourceCode()` for compatibility with older ESLint versions
        const sourceCode =
          context.sourceCode ||
          (typeof context.getSourceCode === 'function'
            ? context.getSourceCode()
            : null);

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
