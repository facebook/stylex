/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

jest.autoMockOff();

import { transformSync } from '@babel/core';
import { messages } from '@stylexjs/shared';
import stylexPlugin from '../src/index';

function transform(source: string, opts: { [key: string]: any } = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    } as any,
    plugins: [[stylexPlugin, opts]],
  });
}

describe('babel-plugin-transform-stylex', () => {
  /**
   * stylex imports
   */

  describe('[validation] CSS custom properties', () => {
    test('disallow unclosed style value functions', () => {
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({default: {color: 'var(--foo'}})
          `,
          { definedStylexCSSVariables: { foo: 1 } }
        );
      }).toThrow(messages.LINT_UNCLOSED_FUNCTION);
    });

    test('disallow unprefixed custom properties', () => {
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({default: {color: 'var(foo'}})
          `,
          { definedStylexCSSVariables: { foo: 1 } }
        );
      }).toThrow();
    });

    test('allow defined custom properties', () => {
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({foo: { color: 'var(--foo)' }});
          `,
          { definedStylexCSSVariables: { foo: 1 } }
        );
      }).not.toThrow();
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({foo: { backgroundColor: 'var(--foo)', color: 'var(--bar)' }});
          `,
          { definedStylexCSSVariables: { foo: 1, bar: 1 } }
        );
      }).not.toThrow();
    });

    test('allow undefined custom properties', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({foo: { color: 'var(--foobar)' }});
        `);
      }).not.toThrow();
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({foo: { color: 'var(--foobar)' }});
          `,
          { definedStylexCSSVariables: null }
        );
      }).not.toThrow();
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({foo: { color: 'var(--foobar)' }});
          `,
          { definedStylexCSSVariables: undefined }
        );
      }).not.toThrow();
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({foo: { color: 'var(--foobar)' }});
          `,
          { definedStylexCSSVariables: { foo: 1 } }
        );
      }).not.toThrow();
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.create({foo: { backgroundColor: 'var(--foofoo)', color: 'var(--foobar)' }});
          `,
          { definedStylexCSSVariables: { foo: 1, bar: 1 } }
        );
      }).not.toThrow();
    });
  });
});
