/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Remove leading zeros from numbers
 *
 * @format
 */

'use strict';

const parser = require('postcss-value-parser');

module.exports = function normalizeLeadingZero(ast, _) {
  ast.walk(node => {
    if (node.type !== 'word') {
      return;
    }
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return;
    }
    const dimension = parser.unit(node.value);
    if (value < 1 && value >= 0) {
      node.value =
        value.toString().replace('0.', '.') + (dimension ? dimension.unit : '');
    }
  });
  return ast;
};
