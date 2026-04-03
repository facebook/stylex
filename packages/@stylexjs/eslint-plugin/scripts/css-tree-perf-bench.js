/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const {
  default: validateStyleValueWithCSSTree,
  resetCSSTreeValidationCache,
} = require('../src/rules/validateWithCSSTree');

const TEST_PAIRS = [
  ['color', 'red'],
  ['color', '#ff0000'],
  ['color', 'rgb(255, 0, 0)'],
  ['color', 'hsl(120, 100%, 50%)'],
  ['backgroundColor', 'transparent'],
  ['display', 'flex'],
  ['display', 'inline-block'],
  ['width', '100%'],
  ['width', 'calc(100% - 20px)'],
  ['width', 'auto'],
  ['height', 'min-content'],
  ['margin', '10px'],
  ['padding', '10px 20px'],
  ['fontSize', '16px'],
  ['fontSize', '1.5rem'],
  ['opacity', '0.5'],
  ['transform', 'translateX(10px)'],
  ['transform', 'rotate(45deg) scale(1.5)'],
  ['transition', 'opacity 0.3s ease'],
  ['position', 'relative'],
  ['overflow', 'hidden'],
  ['zIndex', '10'],
  ['borderRadius', '4px'],
  ['boxShadow', '0 2px 4px rgba(0,0,0,0.1)'],
  ['gridTemplateColumns', '1fr 2fr 1fr'],
];

function makeLiteralNode(value) {
  if (typeof value === 'number') {
    return { type: 'Literal', value, raw: String(value) };
  }
  return { type: 'Literal', value, raw: "'" + value + "'" };
}

// Warm up css-tree (first require is slow)
resetCSSTreeValidationCache();
validateStyleValueWithCSSTree(makeLiteralNode('red'), 'color');

// Benchmark: cold cache
resetCSSTreeValidationCache();
const coldStart = performance.now();
const COLD_ITERATIONS = 100;
for (let i = 0; i < COLD_ITERATIONS; i++) {
  resetCSSTreeValidationCache();
  for (const [prop, value] of TEST_PAIRS) {
    validateStyleValueWithCSSTree(makeLiteralNode(value), prop);
  }
}
const coldEnd = performance.now();
const coldTotal = coldEnd - coldStart;
const coldPerPair = coldTotal / (COLD_ITERATIONS * TEST_PAIRS.length);

// Benchmark: warm cache
resetCSSTreeValidationCache();
for (const [prop, value] of TEST_PAIRS) {
  validateStyleValueWithCSSTree(makeLiteralNode(value), prop);
}
const warmStart = performance.now();
const WARM_ITERATIONS = 10000;
for (let i = 0; i < WARM_ITERATIONS; i++) {
  for (const [prop, value] of TEST_PAIRS) {
    validateStyleValueWithCSSTree(makeLiteralNode(value), prop);
  }
}
const warmEnd = performance.now();
const warmTotal = warmEnd - warmStart;
const warmPerPair = warmTotal / (WARM_ITERATIONS * TEST_PAIRS.length);

console.log('=== css-tree Validation Performance ===');
console.log('Test pairs: ' + TEST_PAIRS.length);
console.log('');
console.log('Cold cache (' + COLD_ITERATIONS + ' iterations):');
console.log('  Total: ' + coldTotal.toFixed(2) + 'ms');
console.log(
  '  Per property-value pair: ' + (coldPerPair * 1000).toFixed(2) + 'µs',
);
console.log(
  '  Per stylex.create() with ' +
    TEST_PAIRS.length +
    ' props: ' +
    (coldPerPair * TEST_PAIRS.length).toFixed(2) +
    'ms',
);
console.log('');
console.log('Warm cache (' + WARM_ITERATIONS + ' iterations):');
console.log('  Total: ' + warmTotal.toFixed(2) + 'ms');
console.log(
  '  Per property-value pair: ' + (warmPerPair * 1000).toFixed(2) + 'µs',
);
console.log(
  '  Per stylex.create() with ' +
    TEST_PAIRS.length +
    ' props: ' +
    (warmPerPair * TEST_PAIRS.length).toFixed(2) +
    'ms',
);
