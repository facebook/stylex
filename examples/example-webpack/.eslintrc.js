/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
module.exports = {
  plugins: ['@stylexjs'],
  rules: {
    '@stylexjs/valid-styles': 'error',
    '@stylexjs/no-unused': 'error',
    '@stylexjs/valid-shorthands': 'warn',
    '@stylexjs/sort-keys': 'warn',
  },
};
