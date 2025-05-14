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
      branches: 74,
      functions: 59,
      lines: 78,
      statements: 78,
    },
  },
  snapshotFormat: {
    printBasicPrototype: false,
  },
  testPathIgnorePatterns: ['/__fixtures__/'],
  verbose: true,
};
