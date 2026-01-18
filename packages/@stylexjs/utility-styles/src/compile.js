/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { create, convertStyleToClassName } = require('@stylexjs/shared');

/**
 * Compiles a static utility style (e.g., x.display.flex) into a className
 * and injectable CSS rules.
 *
 * @param {string} property - The CSS property name
 * @param {string | number} value - The CSS value
 * @param {object} options - StyleX options
 * @returns {{ className: string, classKey: string, injectedStyles: object }}
 */
function compileStaticStyle(property, value, options) {
  const [compiledNamespaces, injectedStyles] = create(
    {
      __inline__: {
        [property]: value,
      },
    },
    options,
  );

  const compiled = compiledNamespaces.__inline__;
  // The compiled object has the structure { [key]: className, $$css: true }
  // We need to extract the className
  const classKey = Object.keys(compiled).find((k) => k !== '$$css');
  const className = classKey != null ? compiled[classKey] : '';

  return {
    className: typeof className === 'string' ? className : '',
    classKey: classKey ?? property,
    injectedStyles,
  };
}

/**
 * Compiles a dynamic utility style (e.g., x.color(someVar)) into a className
 * with a CSS variable, and injectable CSS rules.
 *
 * @param {string} property - The CSS property name
 * @param {object} options - StyleX options
 * @returns {{ className: string, classKey: string, varName: string, injectedStyles: object }}
 */
function compileDynamicStyle(property, options) {
  const varName = `--x-${property}`;

  const [classKey, className, styleObj] = convertStyleToClassName(
    [property, `var(${varName})`],
    [],
    [],
    [],
    options,
  );

  const { priority, ...rest } = styleObj;

  const propertyInjection = {
    ltr: `@property ${varName} { syntax: "*"; inherits: false;}`,
    rtl: null,
    priority: 0,
  };

  const injectedStyles = {
    [classKey]: { ...rest, priority },
    [`${classKey}-var`]: propertyInjection,
  };

  return {
    className,
    classKey,
    varName,
    injectedStyles,
  };
}

module.exports = {
  compileStaticStyle,
  compileDynamicStyle,
};
