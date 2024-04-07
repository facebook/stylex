/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BABEL_ENV = process.env['BABEL_ENV'];

function extensionsForESM() {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.get('source').isStringLiteral()) {
          const node = path.get('source').node;
          const source = node.value;
          if (!source.startsWith('.') || source.endsWith('.mjs')) {
            return;
          }
          if (source.endsWith('.js')) {
            node.value = source.slice(0, -3) + '.mjs';
            return;
          }
          node.value = source + '.mjs';
        }
      },
    },
  };
}

module.exports = {
  presets: ['@babel/preset-flow'],
  plugins: BABEL_ENV === 'esm' ? [extensionsForESM] : [],
};
