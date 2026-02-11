/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { ChainExpression, Node, Property } from 'estree';

function isNullLiteral(node: Node) {
  return (
    node.type === 'Literal' &&
    node.value === null &&
    !node.regex &&
    !node.bigint
  );
}

function getStaticStringValue(node: Node): string | null {
  switch (node.type) {
    case 'Literal':
      if (node.value === null) {
        if (isNullLiteral(node)) {
          return String(node.value); // "null"
        }
        if (node.regex) {
          return `/${node.regex.pattern}/${node.regex.flags}`;
        }
        if (node.bigint) {
          return node.bigint;
        }

        // Otherwise, this is an unknown literal. The function will return null.
      } else {
        return String(node.value);
      }
      break;
    case 'TemplateLiteral':
      if (node.expressions.length === 0 && node.quasis.length === 1) {
        return node.quasis[0].value.cooked || null;
      }
      break;

    // no default
  }

  return null;
}

function getStaticPropertyName(node: Node | ChainExpression): string | null {
  let prop;

  if (node.type === 'ChainExpression' && node.expression) {
    return getStaticPropertyName(node.expression);
  }

  switch (node && node.type) {
    case 'Property':
    case 'PropertyDefinition':
    case 'MethodDefinition':
      prop = node.key;
      break;

    case 'MemberExpression':
      prop = node.property;
      break;

    // no default
  }

  if (prop) {
    if (prop.type === 'Identifier' && !node.computed) {
      return prop.name;
    }

    if (prop.type === 'CallExpression') {
      const callee = getCalleeName(prop.callee);
      if (!callee) return null;

      if (callee.startsWith('stylex.when') || callee.startsWith('when')) {
        const relation = callee.split('.').pop();
        const arg = prop.arguments[0];
        if (!arg) return null;

        return `:when:${relation ?? ''}${getStaticStringValue(arg) ?? ''}`;
      }
    }

    return getStaticStringValue(prop);
  }

  return null;
}

function getCalleeName(node: Node): string | null {
  const parts: string[] = [];
  let current = node;

  while (current && current.type === 'MemberExpression') {
    if (current.property.type === 'Identifier') {
      parts.unshift(current.property.name);
    }

    current = current.object;
  }

  if (current && current.type === 'Identifier') {
    parts.unshift(current.name);
  }

  return parts.length > 0 ? parts.join('.') : null;
}

export default function getPropertyName(
  node: $ReadOnly<{ ...Property, ... }>,
): string | null {
  // $FlowFixMe[incompatible-type]
  const staticName = getStaticPropertyName(node);

  return staticName !== null ? staticName : node.key.name || null;
}
