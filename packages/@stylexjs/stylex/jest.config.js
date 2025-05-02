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
    '!<rootDir>/src/**/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 83,
      functions: 97,
      lines: 97,
      statements: 97,
    },
  },
  prettierPath: null,
  snapshotFormat: {
    printBasicPrototype: false,
  },
  testEnvironment: 'jsdom',
  verbose: true,
};
