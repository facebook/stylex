#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {
  processStylexRules,
} = require('./packages/@stylexjs/babel-plugin/lib/index.js');

// Test case 1: Rules with float properties
const rulesWithFloat = [
  ['rule1', { ltr: '.test { float: start; }' }, 1000],
  ['rule2', { ltr: '.test2 { background: red; }' }, 1000],
];

// Test case 2: Rules without float properties
const rulesWithoutFloat = [
  ['rule1', { ltr: '.test { background: red; }' }, 1000],
  ['rule2', { ltr: '.test2 { color: blue; }' }, 1000],
];

// Test case 3: Rules with clear properties
const rulesWithClear = [['rule1', { ltr: '.test { clear: start; }' }, 1000]];

console.log('Test 1 - Rules with float properties:');
console.log(processStylexRules(rulesWithFloat));
console.log('\n' + '='.repeat(50) + '\n');

console.log('Test 2 - Rules without float properties:');
console.log(processStylexRules(rulesWithoutFloat));
console.log('\n' + '='.repeat(50) + '\n');

console.log('Test 3 - Rules with clear properties:');
console.log(processStylexRules(rulesWithClear));
