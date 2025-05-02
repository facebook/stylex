/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BABEL_ENV = process.env['BABEL_ENV'];

module.exports = {
  assumptions: {
    iterableIsArray: true,
  },
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['@babel/plugin-transform-typeof-symbol'],
        targets: 'defaults',
        // Convert files to cjs for jest testing
        modules: BABEL_ENV === 'test' ? 'cjs' : false,
      },
    ],
    '@babel/preset-flow',
    '@babel/preset-react',
  ],
  plugins: [['babel-plugin-syntax-hermes-parser', { flow: 'detect' }]],
};
