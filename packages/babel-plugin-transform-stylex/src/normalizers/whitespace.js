/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Use single spaces and remove spaces when not needed: around functions,
 * commas. But preserve spece around + and - as they are required in calc()
 *
 * @format
 */

'use strict';

module.exports = function normalizeWhitespace(ast, _) {
  // trim
  if (ast.nodes[0].type === 'space') {
    ast.nodes.shift();
  }
  if (ast.nodes[ast.nodes.length - 1].type === 'space') {
    ast.nodes.pop();
  }

  ast.walk((node, idx) => {
    switch (node.type) {
      case 'space': {
        node.value = ' ';
        break;
      }
      case 'div':
      case 'function': {
        node.before = '';
        node.after = '';
        break;
      }
      case 'word': {
        if (node.value === '!important') {
          if (ast.nodes[idx - 1] && ast.nodes[idx - 1].type === 'space') {
            ast.nodes.splice(idx - 1, 1);
          }
        }
        break;
      }
      default: {
        break;
      }
    }
  });
  return ast;
};
