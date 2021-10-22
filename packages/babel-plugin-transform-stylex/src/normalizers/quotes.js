/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Make empty strings use consistent double quotes
 *
 * @format
 */

'use strict';

module.exports = function normalizeQuotes(ast, _) {
  ast.walk(node => {
    if (node.type !== 'string') {
      return;
    }
    if (node.value === '') {
      node.quote = '"';
    }
  });
  return ast;
};
