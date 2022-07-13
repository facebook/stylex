/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const parser = require('postcss-value-parser');

/**
 * Convert font sizes from absolute unit `px` to relative unit `rem`.
 * This will allow developers to continue thinking and using what's familiar
 * while we output font sizes that are adjustable
 */
module.exports = function convertFontSizeToRem(ast, key) {
  if (key !== 'font-size') {
    return ast;
  }
  ast.walk((node) => {
    if (node.type !== 'word') {
      return;
    }
    const dimension = parser.unit(node.value);
    if (dimension && dimension.unit === 'px') {
      node.value = `${parseFloat(dimension.number) / 16}rem`;
    }
  });
  return ast;
};
