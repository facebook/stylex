/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  plugins: ['@stylexjs'],
  rules: {
    // The Eslint rule still needs work, but you can
    // enable it to test things out.
    '@stylexjs/valid-styles': 'error',
    // '@stylexjs/no-unused': 'warn',
    // 'ft-flow/space-after-type-colon': 0,
    // 'ft-flow/no-types-missing-file-annotation': 0,
    // 'ft-flow/generic-spacing': 0,
  },
};
