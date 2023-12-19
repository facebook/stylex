/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BABEL_ENV = process.env['BABEL_ENV'];

function makeHaste() {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.get('source').isStringLiteral()) {
          const oldValue = path.get('source').node.value;
          path.get('source').node.value = oldValue.slice(
            oldValue.lastIndexOf('/') + 1,
          );
        }
      },
      ExportDefaultDeclaration(path) {
        path.remove();
      },
    },
  };
}

const presets = process.env['HASTE']
  ? []
  : [
      [
        '@babel/preset-env',
        {
          exclude: ['@babel/plugin-transform-typeof-symbol'],
          targets: 'defaults',
          modules: BABEL_ENV === 'esm' ? false : 'cjs',
        },
      ],
      '@babel/preset-flow',
      '@babel/preset-react',
    ];

const plugins = process.env['HASTE']
  ? [
      makeHaste,
      // '@babel/plugin-syntax-flow',
      // '@babel/plugin-syntax-jsx',
      ['babel-plugin-syntax-hermes-parser', { flow: 'detect' }],
    ]
  : [['babel-plugin-syntax-hermes-parser', { flow: 'detect' }]];

module.exports = {
  assumptions: {
    iterableIsArray: true,
  },
  presets,
  plugins,
};
