/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const {
  default: validateStyleValueWithCSSTree,
  resetCSSTreeValidationCache,
} = require('../src/rules/validateWithCSSTree');

describe('validateStyleValueWithCSSTree', () => {
  beforeEach(() => {
    resetCSSTreeValidationCache();
  });

  describe('valid values', () => {
    test.each([
      ['color', 'red'],
      ['color', 'rgb(255, 0, 0)'],
      ['color', 'rgba(255, 0, 0, 0.5)'],
      ['color', 'hsl(120, 100%, 50%)'],
      ['color', '#ff0000'],
      ['color', '#f00'],
      ['color', 'transparent'],
      ['color', 'currentColor'],
      ['color', 'inherit'],
      ['color', 'initial'],
      ['color', 'unset'],
      ['display', 'block'],
      ['display', 'flex'],
      ['display', 'inline-flex'],
      ['display', 'grid'],
      ['display', 'none'],
      ['fontSize', '16px'],
      ['fontSize', '1.5rem'],
      ['fontSize', '1.2em'],
      ['opacity', '0.5'],
      ['opacity', '1'],
      ['width', '100%'],
      ['width', 'calc(100% - 20px)'],
      ['width', 'auto'],
      ['width', 'min-content'],
      ['width', 'max-content'],
      ['width', 'fit-content'],
      ['transform', 'translateX(10px)'],
      ['transform', 'rotate(45deg)'],
      ['transform', 'scale(1.5)'],
      ['transform', 'none'],
      ['transition', 'opacity 0.3s ease'],
      ['zIndex', '10'],
      ['margin', '0'],
      ['margin', '10px'],
      ['padding', '10px 20px'],
      ['backgroundColor', 'rgb(0, 0, 0)'],
      ['borderRadius', '4px'],
      ['position', 'relative'],
      ['position', 'absolute'],
      ['position', 'fixed'],
      ['position', 'sticky'],
      ['overflow', 'hidden'],
      ['overflow', 'scroll'],
      ['overflow', 'auto'],
    ])('%s: "%s" should be valid', (property, value) => {
      // Create a mock Literal node
      const node = {
        type: 'Literal',
        value: value,
        raw: `'${value}'`,
      };
      const result = validateStyleValueWithCSSTree(node, property);
      expect(result).toBeUndefined();
    });

    test('numeric values should be valid', () => {
      const node = { type: 'Literal', value: 0.5, raw: '0.5' };
      const result = validateStyleValueWithCSSTree(node, 'opacity');
      expect(result).toBeUndefined();
    });

    test('numeric 0 for margin should be valid', () => {
      const node = { type: 'Literal', value: 0, raw: '0' };
      const result = validateStyleValueWithCSSTree(node, 'margin');
      expect(result).toBeUndefined();
    });
  });

  describe('invalid values', () => {
    test('invalid display value', () => {
      const node = {
        type: 'Literal',
        value: 'notadisplay',
        raw: "'notadisplay'",
      };
      const result = validateStyleValueWithCSSTree(node, 'display');
      expect(result).toBeDefined();
      expect(result.message).toContain('Invalid CSS value');
    });
  });

  describe('edge cases', () => {
    test('CSS custom properties (--*) should be skipped', () => {
      const node = {
        type: 'Literal',
        value: 'anything',
        raw: "'anything'",
      };
      const result = validateStyleValueWithCSSTree(node, '--myColor');
      expect(result).toBeUndefined();
    });

    test('dynamic values (Identifier with ARG) should be skipped', () => {
      const node = {
        type: 'Identifier',
        name: 'color',
      };
      const variables = new Map([['color', 'ARG']]);
      const result = validateStyleValueWithCSSTree(node, 'color', variables);
      expect(result).toBeUndefined();
    });

    test('unresolvable expressions should be skipped', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getColor' },
        arguments: [],
      };
      const result = validateStyleValueWithCSSTree(node, 'color');
      expect(result).toBeUndefined();
    });

    test('null literal should be skipped', () => {
      const node = {
        type: 'Literal',
        value: null,
        raw: 'null',
      };
      const result = validateStyleValueWithCSSTree(node, 'color');
      expect(result).toBeUndefined();
    });

    test('results should be cached', () => {
      const node = {
        type: 'Literal',
        value: 'red',
        raw: "'red'",
      };
      // Call twice with same property-value
      const result1 = validateStyleValueWithCSSTree(node, 'color');
      const result2 = validateStyleValueWithCSSTree(node, 'color');
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });
  });

  describe('variable resolution', () => {
    test('resolves local variable to literal', () => {
      const node = {
        type: 'Identifier',
        name: 'myColor',
      };
      const variables = new Map([
        ['myColor', { type: 'Literal', value: 'red', raw: "'red'" }],
      ]);
      const result = validateStyleValueWithCSSTree(node, 'color', variables);
      expect(result).toBeUndefined();
    });

    test('resolves local variable to invalid literal', () => {
      const node = {
        type: 'Identifier',
        name: 'myDisplay',
      };
      const variables = new Map([
        [
          'myDisplay',
          { type: 'Literal', value: 'notadisplay', raw: "'notadisplay'" },
        ],
      ]);
      const result = validateStyleValueWithCSSTree(node, 'display', variables);
      expect(result).toBeDefined();
      expect(result.message).toContain('Invalid CSS value');
    });
  });
});
