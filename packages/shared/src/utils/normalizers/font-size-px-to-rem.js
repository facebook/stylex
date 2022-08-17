/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

const parser = require('postcss-value-parser');

const ROOT_FONT_SIZE = 16;

/**
 * Convert font sizes from absolute unit `px` to relative unit `rem`.
 * This will allow developers to continue thinking and using what's familiar
 * while we output font sizes that are adjustable
 */
module.exports = function convertFontSizeToRem(
  ast: PostCSSValueAST,
  key: string
): PostCSSValueAST {
  if (key !== 'fontSize') {
    return ast;
  }
  ast.walk((node) => {
    if (node.type !== 'word') {
      return;
    }
    const dimension = parser.unit(node.value);
    if (dimension && dimension.unit === 'px') {
      node.value = `${parseFloat(dimension.number) / ROOT_FONT_SIZE}rem`;
    }
  });
  return ast;
};
