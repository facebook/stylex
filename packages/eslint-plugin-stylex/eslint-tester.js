/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+eslint
 * @flow strict
 * @format
 */

'use strict';

// eslint-disable-next-line fb-www/no-flowfixme-in-flow-strict
const { RuleTester: ESLintTester } = require('eslint');

ESLintTester.setDefaultConfig({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

module.exports = ESLintTester;
