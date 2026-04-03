/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import {
  flattenNestedVarsConfig,
  flattenNestedConstsConfig,
  unflattenObject,
} from '../src/shared/stylex-nested-utils';

describe('stylex-nested-utils', () => {
  describe('flattenNestedVarsConfig', () => {
    test('flattens a simple one-level nested object', () => {
      const input = {
        button: { background: '#00FF00', color: 'blue' },
      };
      const result = flattenNestedVarsConfig(input);
      expect(result).toEqual({
        'button.background': '#00FF00',
        'button.color': 'blue',
      });
    });

    test('flattens a deeply nested object (3+ levels)', () => {
      const input = {
        button: {
          primary: {
            background: '#00FF00',
          },
          secondary: {
            background: '#CCCCCC',
          },
        },
      };
      const result = flattenNestedVarsConfig(input);
      expect(result).toEqual({
        'button.primary.background': '#00FF00',
        'button.secondary.background': '#CCCCCC',
      });
    });

    test('flattens 4 levels deep', () => {
      const result = flattenNestedVarsConfig({
        a: { b: { c: { d: 'value' } } },
      });
      expect(result).toEqual({
        'a.b.c.d': 'value',
      });
    });

    test('keeps top-level string values as-is', () => {
      const result = flattenNestedVarsConfig({
        shallow: 'red',
        deep: { nested: 'blue' },
      });
      expect(result).toEqual({
        shallow: 'red',
        'deep.nested': 'blue',
      });
    });

    test('stops at objects with a "default" key (conditional @-rule values)', () => {
      const conditionalValue = {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'lightblue',
      };
      const result = flattenNestedVarsConfig({
        button: { color: conditionalValue },
      });
      expect(result).toEqual({
        'button.color': conditionalValue,
      });
    });

    test('stops at deeply nested conditional @-rule values', () => {
      const conditionalValue = {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': {
          default: 'lightblue',
          '@supports (color: oklch(0 0 0))': 'oklch(0.7 -0.3 -0.4)',
        },
      };
      const result = flattenNestedVarsConfig({
        button: { primary: { color: conditionalValue } },
      });
      expect(result).toEqual({
        'button.primary.color': conditionalValue,
      });
    });

    test('handles mixed namespaces and conditional values at the same level', () => {
      const result = flattenNestedVarsConfig({
        button: {
          primary: {
            background: '#00FF00',
            color: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
            },
          },
        },
      });
      expect(result).toEqual({
        'button.primary.background': '#00FF00',
        'button.primary.color': {
          default: 'blue',
          '@media (prefers-color-scheme: dark)': 'lightblue',
        },
      });
    });

    test('handles multiple branches at the same level', () => {
      const result = flattenNestedVarsConfig({
        button: {
          primary: { bg: 'red' },
          secondary: { bg: 'blue' },
        },
        input: { fill: 'white' },
      });
      expect(result).toEqual({
        'button.primary.bg': 'red',
        'button.secondary.bg': 'blue',
        'input.fill': 'white',
      });
    });

    test('returns empty object for empty input', () => {
      expect(flattenNestedVarsConfig({})).toEqual({});
    });

    test('handles object with only top-level leaves (no nesting)', () => {
      const result = flattenNestedVarsConfig({
        color: 'red',
        fontSize: '16px',
        lineHeight: '1.5',
      });
      expect(result).toEqual({
        color: 'red',
        fontSize: '16px',
        lineHeight: '1.5',
      });
    });

    test('preserves conditional value objects', () => {
      const condObj = { default: 'red', '@media print': 'black' };
      const result = flattenNestedVarsConfig({ button: { color: condObj } });
      expect(result['button.color']).toEqual(condObj);
    });

    test('object with default key set to a nested conditional is still a leaf', () => {
      const value = {
        default: {
          default: 'blue',
          '@media print': 'black',
        },
        '@media (prefers-color-scheme: dark)': 'lightblue',
      };
      const result = flattenNestedVarsConfig({ color: value });
      expect(result).toEqual({ color: value });
    });
  });

  describe('flattenNestedConstsConfig', () => {
    test('treats objects with "default" key as namespaces (NOT conditional leaves)', () => {
      const result = flattenNestedConstsConfig({
        button: {
          background: {
            default: '#00FF00',
            hovered: '#0000FF',
          },
        },
      });
      expect(result).toEqual({
        'button.background.default': '#00FF00',
        'button.background.hovered': '#0000FF',
      });
    });

    test('still treats strings and numbers as leaves', () => {
      const result = flattenNestedConstsConfig({
        spacing: { sm: '4px', md: 8 },
      });
      expect(result).toEqual({
        'spacing.sm': '4px',
        'spacing.md': 8,
      });
    });

    test('flattens the full j-malt PR #1303 three-tiered structure', () => {
      const result = flattenNestedConstsConfig({
        button: {
          primary: {
            background: { default: '#00FF00', hovered: '#0000FF' },
            borderRadius: { default: '8px' },
          },
        },
      });
      expect(result).toEqual({
        'button.primary.background.default': '#00FF00',
        'button.primary.background.hovered': '#0000FF',
        'button.primary.borderRadius.default': '8px',
      });
    });

    test('differs from flattenNestedVarsConfig for objects with "default" key', () => {
      // With the tightened heuristic, { default: 'blue', hovered: 'darkblue' }
      // is treated as a NAMESPACE by both vars and consts flatteners because
      // 'hovered' doesn't start with '@'. Only objects where ALL non-default
      // keys start with '@' are treated as conditional leaves by vars.
      const inputWithNonAtKeys = {
        color: { default: 'blue', hovered: 'darkblue' },
      };

      // Both treat this as a namespace (hovered is not an @-rule key)
      const varsResult = flattenNestedVarsConfig(inputWithNonAtKeys);
      expect(varsResult).toEqual({
        'color.default': 'blue',
        'color.hovered': 'darkblue',
      });

      const constsResult = flattenNestedConstsConfig(inputWithNonAtKeys);
      expect(constsResult).toEqual({
        'color.default': 'blue',
        'color.hovered': 'darkblue',
      });

      // WHERE THEY DIFFER: objects with @-rule keys
      const inputWithAtRuleKeys = {
        color: {
          default: 'blue',
          '@media (prefers-color-scheme: dark)': 'darkblue',
        },
      };

      // Vars flattener treats this as a LEAF (conditional @-rule value)
      const varsResult2 = flattenNestedVarsConfig(inputWithAtRuleKeys);
      expect(varsResult2).toEqual({
        color: {
          default: 'blue',
          '@media (prefers-color-scheme: dark)': 'darkblue',
        },
      });

      // Consts flattener treats this as a NAMESPACE (consts don't support @-rules)
      const constsResult2 = flattenNestedConstsConfig(inputWithAtRuleKeys);
      expect(constsResult2).toEqual({
        'color.default': 'blue',
        'color.@media (prefers-color-scheme: dark)': 'darkblue',
      });
    });

    test('handles empty object', () => {
      expect(flattenNestedConstsConfig({})).toEqual({});
    });
  });

  describe('unflattenObject', () => {
    test('unflattens a single dot-separated key', () => {
      const result = unflattenObject({
        'button.primary.background': 'var(--xHash)',
      });
      expect(result).toEqual({
        button: { primary: { background: 'var(--xHash)' } },
      });
    });

    test('merges multiple keys into the same branch', () => {
      const result = unflattenObject({
        'button.primary.bg': 'var(--x1)',
        'button.primary.color': 'var(--x2)',
        'button.secondary.bg': 'var(--x3)',
      });
      expect(result).toEqual({
        button: {
          primary: { bg: 'var(--x1)', color: 'var(--x2)' },
          secondary: { bg: 'var(--x3)' },
        },
      });
    });

    test('preserves __varGroupHash__ at top level without splitting', () => {
      const result = unflattenObject({
        'button.bg': 'var(--xHash1)',
        __varGroupHash__: 'xGroupHash',
      });
      expect(result).toEqual({
        button: { bg: 'var(--xHash1)' },
        __varGroupHash__: 'xGroupHash',
      });
    });

    test('preserves $$css at top level without splitting', () => {
      const result = unflattenObject({
        $$css: true,
        'a.b': 'value',
      });
      expect(result).toEqual({
        $$css: true,
        a: { b: 'value' },
      });
    });

    test('preserves non-dotted keys at top level', () => {
      const result = unflattenObject({
        simple: 'value',
        'nested.key': 'other',
      });
      expect(result).toEqual({
        simple: 'value',
        nested: { key: 'other' },
      });
    });

    test('handles deeply nested keys (4 levels)', () => {
      const result = unflattenObject({
        'a.b.c.d': 'deep',
      });
      expect(result).toEqual({
        a: { b: { c: { d: 'deep' } } },
      });
    });

    test('returns empty object for empty input', () => {
      expect(unflattenObject({})).toEqual({});
    });

    test('handles only special keys', () => {
      const result = unflattenObject({
        __varGroupHash__: 'hash123',
        $$css: true,
      });
      expect(result).toEqual({
        __varGroupHash__: 'hash123',
        $$css: true,
      });
    });

    test('handles only non-dotted keys', () => {
      const result = unflattenObject({
        color: 'red',
        fontSize: '16px',
      });
      expect(result).toEqual({
        color: 'red',
        fontSize: '16px',
      });
    });

    test('handles keys that share a common prefix', () => {
      const result = unflattenObject({
        'color.primary': 'blue',
        'color.secondary': 'green',
        'color.accent': 'red',
      });
      expect(result).toEqual({
        color: { primary: 'blue', secondary: 'green', accent: 'red' },
      });
    });
  });

  describe('flattenNestedVarsConfig and unflattenObject round-trip', () => {
    test('round-trips a simple nested object', () => {
      const original = {
        button: {
          primary: { background: 'red', color: 'blue' },
          secondary: { background: 'gray' },
        },
      };
      const flat = flattenNestedVarsConfig(original);
      const roundTripped = unflattenObject(flat);
      expect(roundTripped).toEqual(original);
    });

    test('round-trips with conditional values preserved', () => {
      const original = {
        button: {
          color: {
            default: 'blue',
            '@media (prefers-color-scheme: dark)': 'lightblue',
          },
        },
      };
      const flat = flattenNestedVarsConfig(original);
      const roundTripped = unflattenObject(flat);
      expect(roundTripped).toEqual(original);
    });

    test('round-trips a complex multi-branch structure', () => {
      const original = {
        button: {
          primary: {
            background: '#00FF00',
            color: {
              default: 'blue',
              '@media (prefers-color-scheme: dark)': 'lightblue',
            },
          },
          secondary: {
            background: '#CCCCCC',
          },
        },
        input: {
          fill: '#FFFFFF',
          border: '#000000',
        },
      };
      const flat = flattenNestedVarsConfig(original);
      const roundTripped = unflattenObject(flat);
      expect(roundTripped).toEqual(original);
    });

    test('round-trips with string values', () => {
      const original = {
        spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
      };
      const flat = flattenNestedVarsConfig(original);
      const roundTripped = unflattenObject(flat);
      expect(roundTripped).toEqual(original);
    });

    test('round-trips a flat object unchanged', () => {
      const original = {
        color: 'red',
        fontSize: '16px',
      };
      const flat = flattenNestedVarsConfig(original);
      const roundTripped = unflattenObject(flat);
      expect(roundTripped).toEqual(original);
    });
  });
});
