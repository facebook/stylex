/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

jest.autoMockOff();

import { transformSync } from '@babel/core';
import { messages } from '@stylexjs/shared';
import stylexPlugin from '../src/index';

function transform(source: string, opts: any = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, { ...opts }]],
  });
}

describe('@stylexjs/babel-plugin', () => {
  describe('[validation] stylex.keyframes()', () => {
    test('local variable keyframes object', () => {
      const callTransform = () =>
        transform(`
        import * as stylex from '@stylexjs/stylex';
        const keyframes = {
          from: {
            color: 'red',
          },
          to: {
            color: 'blue',
          }
        };
        export const name = stylex.keyframes(keyframes);
      `);

      expect(callTransform).toThrow();
    });

    test('only argument must be an object of objects', () => {
      // TODO: This needs a different message. It mentions stylex.create right now.
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes(null);
        `);
      }).toThrow(messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL);

      expect(() => {
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes({
            from: false
          });
        `);
      }).toThrow(messages.NON_OBJECT_KEYFRAME);

      expect(() => {
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes({
            '0%': {
              opacity: 0
            },
            '50%': {
              opacity: 0.5
            },
          });
        `);
      }).not.toThrow();

      expect(() => {
        transform(`
          import stylex from 'stylex';
          const name = stylex.keyframes({
            from: {},
            to: {},
          });
        `);
      }).not.toThrow();
    });

    // TODO: verify if we want to validate use CSS variables here.
    test('allow defined CSS variables in keyframes', () => {
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.keyframes({
              from: {
                backgroundColor: 'var(--bar)',
              },
            });
          `,
          {
            definedStylexCSSVariables: { bar: 1 },
          },
        );
      }).not.toThrow();
    });

    test('allow undefined CSS variables in keyframes', () => {
      expect(() => {
        transform(
          `
            import stylex from 'stylex';
            const styles = stylex.keyframes({
              from: {
                backgroundColor: 'var(--foobar)',
              },
            });
          `,
          {
            definedStylexCSSVariables: { bar: 1 },
          },
        );
      }).not.toThrow();
    });
  });
});
