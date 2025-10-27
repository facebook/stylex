/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { CallExpression, Node, Property, ObjectExpression } from 'estree';
import createImportTracker from './utils/createImportTracker';
/*:: import { Rule } from 'eslint'; */

let lastMediaQueryWinsTransform = null;
try {
  // $FlowFixMe Dynamic import for style-value-parser since it might not be available in all environments
  const styleValueParser = require('style-value-parser');
  lastMediaQueryWinsTransform = styleValueParser.lastMediaQueryWinsTransform;
} catch (e) {}

const stylexValidateMediaQueries = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Warn when media query syntax may not be correctly ordered due to parser limitations',
      recommended: false,
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
    if (!lastMediaQueryWinsTransform) {
      return {};
    }

    const options = context.options[0] || {};
    const { validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'] } =
      options;

    const importTracker = createImportTracker(importsToLookFor);

    function isStylexCreateCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          importTracker.isStylexDefaultImport(node.object.name) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'create') ||
        (node.type === 'Identifier' &&
          importTracker.isStylexNamedImport('create', node.name))
      );
    }

    function findMediaQueries(
      obj: ObjectExpression,
      path: string[] = [],
    ): Property[] {
      const mediaQueryProps: Property[] = [];

      for (const prop of obj.properties) {
        if (prop.type === 'SpreadElement') {
          continue;
        }

        if (prop.computed) {
          continue;
        }

        let key;
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else if (prop.key.type === 'Literal') {
          key = String(prop.key.value);
        } else {
          continue;
        }

        if (key.startsWith('@media')) {
          mediaQueryProps.push(prop);
        }

        if (prop.value.type === 'ObjectExpression') {
          mediaQueryProps.push(...findMediaQueries(prop.value, [...path, key]));
        }
      }

      return mediaQueryProps;
    }

    function validateStyleObject(obj: ObjectExpression) {
      const styleObj: { [string]: mixed } = {};

      for (const prop of obj.properties) {
        if (prop.type === 'SpreadElement') {
          continue;
        }

        if (prop.computed) {
          continue;
        }

        let key;
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else if (prop.key.type === 'Literal') {
          key = String(prop.key.value);
        } else {
          continue;
        }

        if (prop.value.type === 'ObjectExpression') {
          const nestedObj = extractObjectForValidation(prop.value);
          if (nestedObj) {
            styleObj[key] = nestedObj;
          }
        } else if (prop.value.type === 'Literal') {
          styleObj[key] = prop.value.value;
        }
      }

      try {
        if (lastMediaQueryWinsTransform) {
          lastMediaQueryWinsTransform(styleObj);
        }
      } catch (error) {
        const mediaQueryProps = findMediaQueries(obj);

        for (const prop of mediaQueryProps) {
          context.report({
            node: prop,
            message:
              'Media query order may not be respected. ' +
              'Invalid media query syntax or unsupported edge cases in style-value-parser. ' +
              `Error: ${error.message || error}`,
          });
        }
      }
    }

    function extractObjectForValidation(obj: ObjectExpression): mixed {
      const result: { [string]: mixed } = {};

      for (const prop of obj.properties) {
        if (prop.type === 'SpreadElement') {
          continue;
        }

        if (prop.computed) {
          continue;
        }

        let key;
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else if (prop.key.type === 'Literal') {
          key = String(prop.key.value);
        } else {
          continue;
        }

        if (prop.value.type === 'ObjectExpression') {
          result[key] = extractObjectForValidation(prop.value);
        } else if (prop.value.type === 'Literal') {
          result[key] = prop.value.value;
        } else if (prop.value.type === 'ArrayExpression') {
          const arr: Array<mixed> = [];
          for (const elem of prop.value.elements) {
            if (elem && elem.type === 'Literal') {
              arr.push(elem.value);
            }
          }
          result[key] = arr;
        }
      }

      return result;
    }

    function validateCallExpression(node: CallExpression) {
      if (node.arguments.length === 0) {
        return;
      }

      const firstArg = node.arguments[0];
      if (firstArg.type !== 'ObjectExpression') {
        return;
      }

      for (const prop of firstArg.properties) {
        if (prop.type === 'SpreadElement') {
          continue;
        }

        if (prop.value.type === 'ObjectExpression') {
          validateStyleObject(prop.value);
        }
      }
    }

    return {
      ImportDeclaration: importTracker.ImportDeclaration,
      CallExpression(node: CallExpression) {
        if (!isStylexCreateCallee(node.callee)) {
          return;
        }

        validateCallExpression(node);
      },
    };
  },
};

export default stylexValidateMediaQueries;
