/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx}',
    // exclude
    '!<rootDir>/src/**/__tests__/**',
    '!<rootDir>/src/**/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 85,
      statements: 85,
    },
  },
  snapshotFormat: {
    printBasicPrototype: false,
  },
  verbose: true,
};
