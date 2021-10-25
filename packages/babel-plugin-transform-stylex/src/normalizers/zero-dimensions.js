/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Remove units in zero values, except when required: in angles and timings,
 * in which case make them consistent 0deg and 0s.
 *
 * @format
 */

'use strict';

const parser = require('postcss-value-parser');

const angles = ['deg', 'grad', 'turn', 'rad'];
const timings = ['ms', 's'];

module.exports = function normalizeZeroDimensions(ast, _) {
  ast.walk((node) => {
    if (node.type !== 'word') {
      return;
    }
    const dimension = parser.unit(node.value);
    if (!dimension || dimension.number !== '0') {
      return;
    }
    if (angles.indexOf(dimension.unit) !== -1) {
      node.value = '0deg';
    } else if (timings.indexOf(dimension.unit) !== -1) {
      node.value = '0s';
    } else {
      node.value = '0';
    }
  });
  return ast;
};
