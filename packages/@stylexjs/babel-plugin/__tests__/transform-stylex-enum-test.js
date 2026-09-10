/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, options = {}) {
  const { code, metadata } = transformSync(source, {
    filename: '/stylex/tokens.stylex.js',
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: { type: 'haste' },
          ...options,
        },
      ],
    ],
  });
  return { code, css: stylexPlugin.processStylexRules(metadata.stylex) };
}

const definition = `
  import * as stylex from '@stylexjs/stylex';
  export const density = stylex.defineEnum(['compact', 'comfortable'], 'comfortable');
`;

describe('CSS enums', () => {
  test('definition emits only a variable map, reset class, and root default', () => {
    expect(transform(definition)).toMatchSnapshot();
  });

  test('initial at-rules and optional nested defaults', () => {
    expect(
      transform(`
      import {defineEnum} from '@stylexjs/stylex';
      export const dark = defineEnum([true, false], {
        default: false,
        '@media (prefers-color-scheme: dark)': true,
        '@supports (display: grid)': { '@media print': false },
      });
    `),
    ).toMatchSnapshot();
  });

  test('scalar assignments compose under one key', () => {
    expect(
      transform(`${definition}
      export const props = stylex.props(density('compact'), density('comfortable'));
    `),
    ).toMatchSnapshot();
  });

  test('imports compile without accessing the defining module', () => {
    expect(
      transform(`
      import * as stylex from '@stylexjs/stylex';
      import {density as mode} from './missing.stylex';
      export const props = stylex.props(mode('compact'));
      export const styles = stylex.create({root: {
        padding: stylex.match(mode, {compact: 8, comfortable: 16}),
        opacity: stylex.match(mode, {compact: 0.5, comfortable: 1}),
      }});
    `),
    ).toMatchSnapshot();
  });

  test.each(['property-specificity', 'legacy-expand-shorthands'])(
    'property normalization and nested matches: %s',
    (styleResolution) => {
      expect(
        transform(
          `${definition}
      export const styles = stylex.create({root: {
        padding: stylex.match(density, {compact: '8px 12px', comfortable: 16}),
        color: {default: stylex.match(density, {compact: 'red', comfortable: 'blue'}), ':hover': 'green'},
      }});
    `,
          { styleResolution },
        ),
      ).toMatchSnapshot();
    },
  );

  test.each([
    ['stylex.defineEnum(["one"], "one")', 'at least two'],
    ['stylex.defineEnum(["one", "one"], "one")', 'distinct'],
    ['stylex.defineEnum(["one", "two"], "three")', 'Unknown enum state'],
    [
      'stylex.defineEnum(["one", "two"], {"@media print": "one"})',
      'top-level default',
    ],
    [
      'stylex.defineEnum(["one", "two"], {default: "one", ":hover": "two"})',
      'only support',
    ],
  ])('rejects invalid definition %s', (expression, error) => {
    expect(() =>
      transform(
        `import * as stylex from '@stylexjs/stylex'; export const e = ${expression};`,
      ),
    ).toThrow(error);
  });

  test('rejects conditional overrides until supported', () => {
    expect(() =>
      transform(
        `${definition} export const p = stylex.props(density({default: 'compact', ':hover': 'comfortable'}));`,
      ),
    ).toThrow('static string or boolean');
  });

  test('rejects overrides in create', () => {
    expect(() =>
      transform(
        `${definition} export const s = stylex.create({root: {...density('compact')}});`,
      ),
    ).toThrow('within stylex.create');
  });

  test('rejects incomplete local matches', () => {
    expect(() =>
      transform(
        `${definition} export const s = stylex.create({root: {color: stylex.match(density, {compact: 'red', extra: 'blue'})}});`,
      ),
    ).toThrow('exactly every enum state');
  });
});
