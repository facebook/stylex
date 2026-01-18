/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const t = require('@babel/types');
const { compileStaticStyle, compileDynamicStyle } = require('./compile');

const UTILITY_STYLES_SOURCE = '@stylexjs/utility-styles';

/**
 * Creates a visitor that transforms utility style expressions like:
 * - x.display.flex -> { display: 'className', $$css: true }
 * - x.color(myVar) -> [{ color: 'className', $$css: true }, { style: { '--x-color': myVar } }]
 *
 * This visitor should run BEFORE the stylex.props visitor.
 *
 * @param {object} state - StateManager from babel-plugin
 * @param {object} helpers - AST helper functions
 * @returns {object} Babel visitor
 */
function createUtilityStylesVisitor(state, helpers) {
  const { convertObjectToAST } = helpers;

  // Cache for compiled static styles (property|value -> styleObj)
  const staticStyleCache = new Map();
  // Cache for compiled dynamic styles (property -> { className, varName, classKey })
  const dynamicStyleCache = new Map();

  return {
    MemberExpression(path) {
      // Skip if already processed or not a utility style pattern
      if (path.node._utilityStyleProcessed) {
        return;
      }

      const staticStyle = getStaticStyleFromPath(path, state);
      if (staticStyle != null) {
        path.node._utilityStyleProcessed = true;
        transformStaticStyle(path, staticStyle, state, staticStyleCache, {
          convertObjectToAST,
        });
      }
    },

    CallExpression(path) {
      // Skip if already processed
      if (path.node._utilityStyleProcessed) {
        return;
      }

      const dynamicStyle = getDynamicStyleFromPath(path, state);
      if (dynamicStyle != null) {
        path.node._utilityStyleProcessed = true;
        transformDynamicStyle(path, dynamicStyle, state, dynamicStyleCache, {
          convertObjectToAST,
        });
      }
    },
  };
}

/**
 * Check if an identifier is a utility styles import
 */
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
    binding.path.parent.source.value === UTILITY_STYLES_SOURCE
  ) {
    return true;
  }

  if (
    binding.path.isImportNamespaceSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === UTILITY_STYLES_SOURCE
  ) {
    return true;
  }

  if (
    binding.path.isImportDefaultSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === UTILITY_STYLES_SOURCE
  ) {
    return true;
  }

  return false;
}

/**
 * Get property key from AST node
 */
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

/**
 * Normalize value (strip leading underscore for reserved words)
 */
function normalizeValue(value) {
  if (typeof value === 'string' && value.startsWith('_')) {
    return value.slice(1);
  }
  return value;
}

/**
 * Extract static style info from a MemberExpression path
 * Pattern: x.display.flex or display.flex (named import)
 */
function getStaticStyleFromPath(path, state) {
  const node = path.node;
  if (!t.isMemberExpression(node)) {
    return null;
  }

  // Skip if this is the callee of a call expression (handled by dynamic)
  if (path.parentPath?.isCallExpression() && path.parentPath.node.callee === node) {
    return null;
  }

  const valueKey = getPropKey(node.property, node.computed);
  if (valueKey == null) {
    return null;
  }

  const parent = node.object;

  // Pattern: x.display.flex (namespace import)
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

  // Pattern: display.flex (named import like `import { display } from '...'`)
  if (t.isIdentifier(parent) && isUtilityStylesIdentifier(parent, state, path)) {
    const importedName = state.inlineCSSImports?.get(parent.name) ?? 'color';
    const property = importedName === '*' ? valueKey : importedName;
    return { property, value: normalizeValue(valueKey) };
  }

  return null;
}

/**
 * Extract dynamic style info from a CallExpression path
 * Pattern: x.color(myVar) or color(myVar) (named import)
 */
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

  // Pattern: x.color(myVar) (namespace import)
  if (t.isIdentifier(parent) && isUtilityStylesIdentifier(parent, state, path)) {
    return {
      property: valueKey,
      value: argPath.node,
    };
  }

  // Pattern: x.color.dark(myVar) - property access then call
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
 * Transform a static style expression - hoist compiled object to program level
 */
function transformStaticStyle(path, styleInfo, state, cache, helpers) {
  const { property, value } = styleInfo;
  const cacheKey = `${property}|${typeof value}:${String(value)}`;

  // Check if we already compiled this exact style
  let styleObj = cache.get(cacheKey);

  if (styleObj == null) {
    // Compile the style
    const { className, classKey, injectedStyles } = compileStaticStyle(
      property,
      value,
      state.options,
    );

    // Register the CSS
    const listOfStyles = Object.entries(injectedStyles).map(
      ([key, { priority, ...rest }]) => [key, rest, priority],
    );
    state.registerStyles(listOfStyles, path);

    // Create the style object
    styleObj = {
      [classKey]: className,
      $$css: true,
    };

    cache.set(cacheKey, styleObj);
  }

  // Hoist the style object to program level and replace path with identifier
  const astExpression = helpers.convertObjectToAST(styleObj);
  path.replaceWith(astExpression);
}

/**
 * Transform a dynamic style expression
 * x.color(myVar) -> hoisted styles object + member call
 *
 * Creates: const _styles = { color: c => [{ classKey: c != null ? className : c, $$css: true }, { varName: c != null ? c : undefined }] }
 * Replaces with: _styles.color(myVar)
 */
function transformDynamicStyle(path, styleInfo, state, cache, helpers) {
  const { property, value } = styleInfo;

  // Check if we already have the hoisted styles object identifier
  let stylesIdent = cache.get('__stylesIdent__');
  let stylesObj = cache.get('__stylesObj__');

  if (stylesIdent == null) {
    // Create a new styles object identifier
    stylesIdent = path.scope.generateUidIdentifier('styles');
    cache.set('__stylesIdent__', stylesIdent);

    // Create empty styles object - properties will be added as we encounter them
    stylesObj = t.objectExpression([]);
    cache.set('__stylesObj__', stylesObj);

    // Find the program and insert at the very beginning (after imports)
    const programPath = path.findParent((p) => p.isProgram());
    const body = programPath.get('body');

    // Find the first non-import statement
    let insertIndex = 0;
    for (let i = 0; i < body.length; i++) {
      if (body[i].isImportDeclaration()) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }

    // Insert the styles object declaration right after imports
    if (insertIndex < body.length) {
      body[insertIndex].insertBefore(
        t.variableDeclaration('const', [
          t.variableDeclarator(stylesIdent, stylesObj),
        ]),
      );
    } else {
      // No non-import statements, insert at the end
      programPath.pushContainer('body',
        t.variableDeclaration('const', [
          t.variableDeclarator(stylesIdent, stylesObj),
        ]),
      );
    }
  }

  // Check if we already have this property in the styles object
  let cached = cache.get(property);

  if (cached == null) {
    // Compile the dynamic style
    const { className, classKey, varName, injectedStyles } = compileDynamicStyle(
      property,
      state.options,
    );

    // Register the CSS
    const listOfStyles = Object.entries(injectedStyles).map(
      ([key, { priority, ...rest }]) => [key, rest, priority],
    );
    state.registerStyles(listOfStyles, path);

    // Create a parameter for the arrow function
    const paramIdent = t.identifier('_v');

    // Create: [{ classKey: _v != null ? className : _v, $$css: true }, { varName: _v != null ? _v : undefined }]
    const classNameObj = t.objectExpression([
      t.objectProperty(
        t.stringLiteral(classKey),
        t.conditionalExpression(
          t.binaryExpression('!=', paramIdent, t.nullLiteral()),
          t.stringLiteral(className),
          paramIdent,
        ),
      ),
      t.objectProperty(t.stringLiteral('$$css'), t.booleanLiteral(true)),
    ]);

    const inlineStyleObj = t.objectExpression([
      t.objectProperty(
        t.stringLiteral(varName),
        t.conditionalExpression(
          t.binaryExpression('!=', paramIdent, t.nullLiteral()),
          paramIdent,
          t.identifier('undefined'),
        ),
      ),
    ]);

    // Create arrow function: _v => [classNameObj, inlineStyleObj]
    const arrayExpr = t.arrayExpression([classNameObj, inlineStyleObj]);
    const arrowFn = t.arrowFunctionExpression([paramIdent], arrayExpr);

    // Add property to the styles object
    stylesObj.properties.push(
      t.objectProperty(t.identifier(property), arrowFn),
    );

    cached = { property };
    cache.set(property, cached);
  }

  // Replace css.color(value) with _styles.color(value)
  const memberExpr = t.memberExpression(t.cloneNode(stylesIdent), t.identifier(property));
  const callExpr = t.callExpression(memberExpr, [value]);
  path.replaceWith(callExpr);
}

module.exports = {
  createUtilityStylesVisitor,
  // Export individual functions for testing
  isUtilityStylesIdentifier,
  getStaticStyleFromPath,
  getDynamicStyleFromPath,
};
