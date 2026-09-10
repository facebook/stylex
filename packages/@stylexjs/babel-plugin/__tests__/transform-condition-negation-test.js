/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transformSync } from '@babel/core';
import plugin from '../src/index';

function compile(value, enableMediaQueryOrder = true) {
  const result = transformSync(
    `import * as stylex from '@stylexjs/stylex';
    export const styles = stylex.create({root: ${value}});`,
    {
      filename: '/stylex/conditions.js',
      babelrc: false,
      plugins: [[plugin, { enableMediaQueryOrder }]],
    },
  );
  return {
    code: result.code,
    css: plugin.processStylexRules(result.metadata.stylex),
  };
}

describe('regular condition negation', () => {
  test.each([
    '{color: {default: \'black\', \':hover\': \'red\', \':active\': \'blue\'}}',
    '{color: {default: \'black\', \'@media screen and (min-width: 400px)\': \'red\', \'@media print\': \'blue\'}}',
    '{color: {\'@media (min-width: 400px)\': \'red\', \'@media (min-width: 600px)\': {\'@media (min-height: 500px)\': \'blue\'}}}',
    '{color: {\'@supports (display: grid)\': \'red\', \'@supports (display: flex)\': \'blue\'}}',
    '{color: {\'@media (min-width: 400px)\': \'red\', \'@media screen, (max-width: 300px)\': \'blue\'}}',
    '(a, b) => ({color: {\'@supports (display: grid)\': a, \'@supports (display: flex)\': b}})',
  ])('compiles %s', (value) => {
    expect(compile(value)).toMatchSnapshot();
  });

  test('the existing option still disables normal exclusions', () => {
    expect(
      compile(
        '{color: {\'@media (min-width: 400px)\': \'red\', \'@media (min-width: 600px)\': \'blue\'}}',
        false,
      ),
    ).toMatchSnapshot();
  });

  test('normalized conditions preserve dynamic null checks', () => {
    const { code } = compile(
      '(a, b) => ({color: {\'@supports (display: grid)\': a, \'@supports (display: flex)\': b}})',
    );
    expect(code).toContain('a != null');
    expect(code).toContain('b != null');
  });
});
