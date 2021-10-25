/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

'use strict';

const rules = require('./lint-rules/index.js');
const messages = require('./messages.js');
const parser = require('postcss-value-parser');

const NODE_TYPE_FUNCTION = 'function';

function lintRule(path, key, value, definedCSSVariables) {
  if (Array.isArray(value)) {
    value.forEach((v) => lintRule(path, key, v, definedCSSVariables));
    return;
  }
  // Ensure that functions are unclosed
  const ast = parser(value);
  for (const node of ast.nodes) {
    if (node.type === NODE_TYPE_FUNCTION && node.unclosed) {
      throw path.buildCodeFrameError(messages.LINT_UNCLOSED_FUNCTION);
    }
  }

  // Run rule-specific lint rule
  const lint = rules[key];
  if (lint != null) {
    const msg = lint(key, value, ast);
    if (typeof msg === 'string') {
      throw path.buildCodeFrameError(msg);
    }
  }
}

module.exports = lintRule;
