/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Turn millisecond values to seconds (shorter), except when < 10ms
 *
 * @format
 */

'use strict';

const parser = require('postcss-value-parser');

module.exports = function normalizeTimings(ast, _) {
  ast.walk(node => {
    if (node.type !== 'word') {
      return;
    }
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return;
    }
    const dimension = parser.unit(node.value);
    if (!dimension || dimension.unit !== 'ms' || value < 10) {
      return;
    }
    node.value = value / 1000 + 's';
  });
  return ast;
};
