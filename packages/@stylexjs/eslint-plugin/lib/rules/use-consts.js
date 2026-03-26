/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @fileoverview Enforce usage of shared constants defined with stylex.defineConsts
 * @author StyleX
 */
"use strict";

const {
  isStyleXCall,
  isIdentifier,
  isMemberExpression,
} = require("../utils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce usage of shared constants defined with stylex.defineConsts",
      recommended: false,
      url: "https://stylexjs.com/docs/api/stylex.defineConsts",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowInline: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useDefineConsts: "Use shared constants defined with stylex.defineConsts instead of inline values.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowInline = options.allowInline === true;

    if (allowInline) {
      return {};
    }

    // Track identifiers from stylex.defineConsts
    const definedConsts = new Set();

    return {
      // Collect all stylex.defineConsts calls
      CallExpression(node) {
        if (
          isStyleXCall(node, "defineConsts") &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "ObjectExpression"
        ) {
          const obj = node.arguments[0];
          obj.properties.forEach((prop) => {
            if (isIdentifier(prop.key)) {
              definedConsts.add(prop.key.name);
            }
          });
        }
      },

      // Check for usage of stylex.create or stylex.props
      "CallExpression > MemberExpression.callee"(node) {
        if (
          isMemberExpression(node) &&
          isIdentifier(node.object, "stylex") &&
          (isIdentifier(node.property, "create") ||
            isIdentifier(node.property, "props"))
        ) {
          const callNode = node.parent;
          if (callNode.arguments.length > 0) {
            // Traverse the styles object to find literal values
            callNode.arguments.forEach((arg) => {
              if (arg.type === "ObjectExpression") {
                checkObjectForLiterals(arg);
              }
            });
          }
        }
      },
    };

    function checkObjectForLiterals(obj) {
      for (const prop of obj.properties) {
        if (prop.type === "Property" && prop.value.type === "ObjectExpression") {
          // Recurse into nested style objects
          checkObjectForLiterals(prop.value);
        } else if (prop.type === "Property") {
          const value = prop.value;
          if (
            (value.type === "Literal" &&
              typeof value.value !== "boolean" &&
              value.value !== "" &&
              !isIdentifier(value)) ||
            value.type === "TemplateLiteral"
          ) {
            // Skip if value is a reference to a defined const
            if (
              !(
                isIdentifier(value) &&
                definedConsts.has(value.name)
              )
            ) {
              context.report({
                node: value,
                messageId: "useDefineConsts",
              });
            }
          } else if (value.type === "ArrayExpression") {
            value.elements.forEach((element) => {
              if (
                element &&
                (element.type === "Literal" ||
                  element.type === "TemplateLiteral")
              ) {
                context.report({
                  node: element,
                  messageId: "useDefineConsts",
                });
              }
            });
          }
        }
      }
    }
  },
};
