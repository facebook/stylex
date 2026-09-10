/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transformSync } from '@babel/core';
import { transform } from 'lightningcss';
import stylexPlugin from '@stylexjs/babel-plugin';
import { createConditionVisitor, simplifyConditions } from '../src/index';

function css(source, options = {}) {
  return simplifyConditions({
    filename: 'stylex.css',
    code: Buffer.from(source),
    ...options,
  }).code.toString();
}

function compile(filename, source, enabled = true) {
  return transformSync(source, {
    filename,
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: { type: 'haste' },
          enableMediaQueryOrder: enabled,
        },
      ],
    ],
  }).metadata.stylex;
}

describe('Lightning CSS condition simplifier', () => {
  test.each([
    '@media (min-width: 400px) and (not (min-width: 900px)){.a{color:red}}',
    '@media (min-width: 400px){@media (max-width: 300px){.a{color:red}}}',
    '@media screen{ @media print {.a{color:red}} }',
    '@media (min-width: 400px){@media (min-width: 600px){.a{color:red}}}',
    '@supports (display: grid) and (not (display: grid)){.a{color:red}}',
    '@supports (display: grid) or ((display: grid) and (display: flex)){.a{color:red}}',
    '@supports (--value: "{, and or }"){.a{color:red}}',
    '@container card (min-width: 300px){@container card (max-height: 500px){.a{color:red}}}',
    '@media (min-width: 40em) and (not (min-width: 900px)){.a{color:red}}',
    '@media (future-feature) or (not (future-feature)){.a{color:red}}',
    '@layer base{@media (min-width: 400px) and (not (min-width: 900px)){.a:hover{--state: ;padding:8px}}}',
  ])('simplifies %s', (source) => {
    const result = css(source);
    expect(result).toMatchSnapshot();
    expect(css(result)).toBe(result);
  });

  test('integrates as a visitor and preserves source maps', () => {
    const result = transform({
      filename: 'stylex.css',
      code: Buffer.from(
        '@media (min-width: 400px) and (not (min-width: 900px)){.a{color:red}}',
      ),
      visitor: createConditionVisitor(),
      sourceMap: true,
    });
    expect(result.map).toBeDefined();
    expect(result.code.toString()).toContain('899.99px');
  });

  test('composes a caller visitor', () => {
    const result = css('@media (min-width: 400px){.a{color:red}}', {
      visitor: {
        Declaration: {
          color() {
            return { property: 'color', raw: 'blue' };
          },
        },
      },
    });
    expect(result).toContain('color: #00f');
  });

  test('resolves whole defineConsts at-rule keys before simplification', () => {
    const definitions = compile(
      '/stylex/queries.stylex.js',
      `import * as stylex from '@stylexjs/stylex';
      export const queries = stylex.defineConsts({medium:'@media (min-width: 400px)', large:'@media (min-width: 900px)'});`,
    );
    const consumer = compile(
      '/stylex/button.js',
      `import * as stylex from '@stylexjs/stylex';
      import {queries} from 'queries.stylex.js';
      export const styles=stylex.create({root:{color:{default:'black',[queries.medium]:'red',[queries.large]:'blue'}}});`,
    );
    const generated = stylexPlugin.processStylexRules([
      ...definitions,
      ...consumer,
    ]);
    const result = css(generated);
    expect({ generated, result }).toMatchSnapshot();
    expect(result).toContain('899.99px');
    expect(result).not.toContain('stylex-order');
    expect(result).not.toContain('var(--');
  });

  test('deferred supports constants preserve quoted braces and mixed at-rule priorities', () => {
    const definitions = compile(
      '/stylex/queries.stylex.js',
      `import * as stylex from '@stylexjs/stylex';
      export const queries = stylex.defineConsts({supports:'@supports (--value: "{, and }")', media:'@media (min-width: 400px)'});`,
    );
    const consumer = compile(
      '/stylex/button.js',
      `import * as stylex from '@stylexjs/stylex';
      import {queries} from 'queries.stylex.js';
      export const styles=stylex.create({root:{color:{default:'black',[queries.supports]:'red',[queries.media]:'blue'}}});`,
    );
    expect(
      css(stylexPlugin.processStylexRules([...definitions, ...consumer])),
    ).toMatchSnapshot();
  });

  test('ordering disabled leaves constants as ordinary conditions', () => {
    const consumer = compile(
      '/stylex/button.js',
      `import * as stylex from '@stylexjs/stylex';
      import {queries} from 'queries.stylex.js';
      export const styles=stylex.create({root:{color:{[queries.medium]:'red',[queries.large]:'blue'}}});`,
      false,
    );
    expect(JSON.stringify(consumer)).not.toContain('stylex-order');
  });
});
