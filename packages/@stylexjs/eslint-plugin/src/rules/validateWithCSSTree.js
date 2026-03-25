/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Expression, Pattern } from 'estree';
import type { Variables, RuleResponse } from '../stylex-valid-styles';

let csstree: $FlowFixMe = null;

function getCSSTree(): $FlowFixMe {
  if (csstree == null) {
    // Lazy-load css-tree to avoid paying the import cost when the option is disabled
    csstree = require('css-tree');
  }
  return csstree;
}

/**
 * Convert a camelCase CSS property name to kebab-case.
 * e.g. "backgroundColor" -> "background-color"
 *      "MozOsxFontSmoothing" -> "-moz-osx-font-smoothing"
 *      "WebkitFontSmoothing" -> "-webkit-font-smoothing"
 */
function dashify(str: string): string {
  // Handle vendor prefixes: Moz, Webkit, ms -> -moz-, -webkit-, -ms-
  const prefixed = /^(Moz|Webkit|ms|O)[A-Z]/.test(str)
    ? str.replace(/^(Moz|Webkit|ms|O)/, '-$1-')
    : str;
  return prefixed.replace(/(^|[a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Try to resolve an AST node to a static string or number value.
 * Returns null if the value can't be statically resolved.
 */
function resolveValue(
  node: Expression | Pattern,
  variables?: Variables,
): string | number | null {
  if (
    // $FlowFixMe[invalid-compare]
    node.type === 'TSSatisfiesExpression' ||
    // $FlowFixMe[invalid-compare]
    node.type === 'TSAsExpression'
  ) {
    return resolveValue(node.expression, variables);
  }
  if (node.type === 'Literal') {
    if (typeof node.value === 'string' || typeof node.value === 'number') {
      return node.value;
    }
    if (node.value === null) {
      return null;
    }
  }
  if (node.type === 'UnaryExpression' && node.operator === '-') {
    const val = resolveValue(node.argument, variables);
    if (typeof val === 'number') {
      return -val;
    }
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value?.cooked ?? null;
  }
  if (node.type === 'Identifier' && variables != null) {
    const existingVar = variables.get(node.name);
    if (existingVar === 'ARG') {
      // Dynamic value — can't validate statically
      return null;
    }
    if (existingVar != null) {
      return resolveValue(existingVar, variables);
    }
  }
  return null;
}

// Cache for css-tree validation results to avoid re-parsing identical property-value pairs
const validationCache: Map<string, string | null> = new Map();

/**
 * Validate a CSS property-value pair using css-tree's CSS grammar.
 *
 * Returns null if valid, or an error message string if invalid.
 */
function validateWithCSSTree(
  propertyName: string,
  value: string | number,
): string | null {
  const cssProperty = dashify(propertyName);
  const cssValue = typeof value === 'number' ? String(value) : value;
  const cacheKey = `${cssProperty}:${cssValue}`;

  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey) ?? null;
  }

  try {
    const ct = getCSSTree();
    const ast = ct.parse(cssValue, { context: 'value' });
    const matchResult = ct.lexer.matchProperty(cssProperty, ast);

    if (matchResult.error) {
      const errorMessage = matchResult.error.message || 'Invalid CSS value';
      // Clean up the error message — css-tree includes internal details we don't need
      const cleanMessage = errorMessage
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      validationCache.set(cacheKey, cleanMessage);
      return cleanMessage;
    }

    validationCache.set(cacheKey, null);
    return null;
  } catch (e) {
    // If css-tree throws a SyntaxError, the value is unparsable CSS
    if (e instanceof SyntaxError) {
      const errorMessage = `Syntax error: "${cssValue}" is not valid CSS`;
      validationCache.set(cacheKey, errorMessage);
      return errorMessage;
    }
    // For other unexpected errors, fail open to avoid false positives
    validationCache.set(cacheKey, null);
    return null;
  }
}

/**
 * ESLint rule check that uses css-tree to validate CSS values.
 * This is intended as a fallback — it runs after the existing hand-rolled
 * validators pass, catching values that are syntactically valid JS but
 * invalid CSS.
 */
export default function validateStyleValueWithCSSTree(
  node: Expression | Pattern,
  propertyName: string,
  variables?: Variables,
): RuleResponse {
  const resolvedValue = resolveValue(node, variables);

  // Can't validate dynamic or unresolvable values
  if (resolvedValue === null) {
    return undefined;
  }

  // css-tree doesn't know about CSS custom properties (--*), skip them
  if (propertyName.startsWith('--')) {
    return undefined;
  }

  const error = validateWithCSSTree(propertyName, resolvedValue);
  if (error != null) {
    return {
      message: `Invalid CSS value for "${propertyName}": ${error}`,
    };
  }

  return undefined;
}

/**
 * Reset the validation cache. Useful for testing.
 */
export function resetCSSTreeValidationCache(): void {
  validationCache.clear();
}
