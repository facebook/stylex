/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  conditionsAreActive,
  formatConditions,
  getReplacementOverrideIds,
} from '../src/panel/declarations/model';

test('omits cascade layers from displayed condition labels', () => {
  const layer = { kind: 'at-rule', text: '@layer priority1', active: true };
  const media = {
    kind: 'at-rule',
    text: '@media (forced-colors: active)',
    active: false,
  };

  expect(formatConditions([])).toBe('default');
  expect(formatConditions([layer])).toBe('default');
  expect(formatConditions([layer, media])).toBe(
    '@media (forced-colors: active)',
  );
  expect(conditionsAreActive([layer, media])).toBe(false);
});

test('replaces only the rule override for the same pseudo-element property', () => {
  const declaration = {
    key: 'before-color',
    contextKey: 'before-context',
    property: 'color',
    value: 'red',
    important: false,
    conditions: [],
    pseudoElement: '::before',
    className: 'xBefore',
  };
  const makeRuleOverride = (id, pseudoElement) => ({
    id,
    kind: 'rule',
    contextKey: `${pseudoElement}-context`,
    property: 'color',
    value: 'blue',
    important: false,
    conditions: [],
    pseudoElement,
  });

  expect(
    getReplacementOverrideIds(declaration, [
      makeRuleOverride('before', '::before'),
      makeRuleOverride('after', '::after'),
    ]),
  ).toEqual(['before']);
});
