/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const t = require('@babel/types');

const ATOMS_SOURCE = '@stylexjs/atoms';

/**
 * Creates a visitor that transforms utility style expressions into raw style objects.
 * The babel-plugin will handle compilation via stylexCreate.
 *
 * - css.display.flex -> { display: 'flex' }
 * - css.color(myVar) -> { color: myVar }
 *
 * @param {object} state - StateManager from babel-plugin
 * @returns {object} Babel visitor
 */
function createUtilityStylesVisitor(state) {
  return {
    MemberExpression(path) {
      if (path.node._utilityStyleProcessed) {
        return;
      }

      const staticStyle = getStaticStyleFromPath(path, state);
      if (staticStyle != null) {
        path.node._utilityStyleProcessed = true;
        transformStaticStyle(path, staticStyle);
      }
    },

    CallExpression(path) {
      if (path.node._utilityStyleProcessed) {
        return;
      }

      const dynamicStyle = getDynamicStyleFromPath(path, state);
      if (dynamicStyle != null) {
        path.node._utilityStyleProcessed = true;
        transformDynamicStyle(path, dynamicStyle);
      }
    },
  };
}

function isUtilityStylesIdentifier(ident, state, path) {
  if (state.inlineCSSImports && state.inlineCSSImports.has(ident.name)) {
    return true;
  }

  const binding = path.scope?.getBinding(ident.name);
  if (!binding) {
    return false;
  }

  if (
    binding.path.isImportSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === ATOMS_SOURCE
  ) {
    return true;
  }

  if (
    binding.path.isImportNamespaceSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === ATOMS_SOURCE
  ) {
    return true;
  }

  if (
    binding.path.isImportDefaultSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === ATOMS_SOURCE
  ) {
    return true;
  }

  return false;
}

function getPropKey(prop, computed) {
  if (!computed && t.isIdentifier(prop)) {
    return prop.name;
  }
  if (computed && t.isStringLiteral(prop)) {
    return prop.value;
  }
  if (computed && t.isNumericLiteral(prop)) {
    return String(prop.value);
  }
  return null;
}

function normalizeValue(value) {
  if (typeof value === 'string' && value.startsWith('_')) {
    return value.slice(1);
  }
  return value;
}

function getStaticStyleFromPath(path, state) {
  const node = path.node;
  if (!t.isMemberExpression(node)) {
    return null;
  }

  if (path.parentPath?.isCallExpression() && path.parentPath.node.callee === node) {
    return null;
  }

  const valueKey = getPropKey(node.property, node.computed);
  if (valueKey == null) {
    return null;
  }

  const parent = node.object;

  if (t.isMemberExpression(parent)) {
    const propName = getPropKey(parent.property, parent.computed);
    const base = parent.object;
    if (
      propName != null &&
      t.isIdentifier(base) &&
      isUtilityStylesIdentifier(base, state, path)
    ) {
      return { property: propName, value: normalizeValue(valueKey) };
    }
  }

  if (t.isIdentifier(parent) && isUtilityStylesIdentifier(parent, state, path)) {
    const importedName = state.inlineCSSImports?.get(parent.name) ?? 'color';
    const property = importedName === '*' ? valueKey : importedName;
    return { property, value: normalizeValue(valueKey) };
  }

  return null;
}

function getDynamicStyleFromPath(path, state) {
  const callee = path.get('callee');
  if (!callee.isMemberExpression()) {
    return null;
  }

  const valueKey = getPropKey(callee.node.property, callee.node.computed);
  if (valueKey == null) {
    return null;
  }

  if (path.node.arguments.length !== 1) {
    return null;
  }

  const argPath = path.get('arguments')[0];
  if (!argPath || !argPath.node || !argPath.isExpression()) {
    return null;
  }

  const parent = callee.node.object;

  if (t.isIdentifier(parent) && isUtilityStylesIdentifier(parent, state, path)) {
    return {
      property: valueKey,
      value: argPath.node,
    };
  }

  if (t.isMemberExpression(parent)) {
    const propName = getPropKey(parent.property, parent.computed);
    const base = parent.object;
    if (
      propName != null &&
      t.isIdentifier(base) &&
      isUtilityStylesIdentifier(base, state, path)
    ) {
      return {
        property: propName,
        value: argPath.node,
      };
    }
  }

  return null;
}

/**
 * Transform static utility style to raw style object
 * css.display.flex -> { display: 'flex' }
 */
function transformStaticStyle(path, styleInfo) {
  const { property, value } = styleInfo;

  const styleObj = t.objectExpression([
    t.objectProperty(
      t.stringLiteral(property),
      typeof value === 'number'
        ? t.numericLiteral(value)
        : t.stringLiteral(String(value)),
    ),
  ]);

  path.replaceWith(styleObj);
}

/**
 * Transform dynamic utility style to raw style object
 * css.color(myVar) -> { color: myVar }
 */
function transformDynamicStyle(path, styleInfo) {
  const { property, value } = styleInfo;

  const styleObj = t.objectExpression([
    t.objectProperty(t.stringLiteral(property), value),
  ]);

  path.replaceWith(styleObj);
}

module.exports = {
  createUtilityStylesVisitor,
  isUtilityStylesIdentifier,
  getStaticStyleFromPath,
  getDynamicStyleFromPath,
};
