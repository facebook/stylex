/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type { Condition } from '../src/core/ir';
import { conditionKey, atomCoordinate } from '../src/core/ir';

test('conditionKey covers every condition kind', () => {
  expect(conditionKey({ kind: 'pseudo-class', name: ':hover' })).toEqual(
    ':hover',
  );
  expect(conditionKey({ kind: 'pseudo-element', name: '::before' })).toEqual(
    '::before',
  );
  expect(
    conditionKey({ kind: 'at-rule', rule: '@media (min-width: 600px)' }),
  ).toEqual('@media (min-width: 600px)');
});

test('atomCoordinate is stable under condition ordering', () => {
  const hover: Condition = { kind: 'pseudo-class', name: ':hover' };
  const media: Condition = {
    kind: 'at-rule',
    rule: '@media (min-width: 600px)',
  };
  expect(atomCoordinate('color', [hover, media])).toEqual(
    atomCoordinate('color', [media, hover]),
  );
  expect(atomCoordinate('color', [])).toEqual('color');
});
