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
    filename: opts.filename || 'TestTheme.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    plugins: [
      [
        stylexPlugin,
        {
          stylexSheetName: '<>',
          unstable_moduleResolution: { type: 'haste' },
          ...opts,
        },
      ],
    ],
  });
}

describe('@stylexjs/babel-plugin', () => {
  /**
   * stylex.defineVars
   */

  describe('[validation] stylex.defineVars()', () => {
    test('must be bound to a named export', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const styles = stylex.defineVars({});
        `);
      }).toThrow(messages.NON_EXPORT_NAMED_DECLARATION);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          stylex.defineVars({});
        `);
      }).toThrow(messages.UNBOUND_STYLEX_CALL_VALUE);
    });

    test('its only argument must be a single object', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars(genStyles());
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars(1);
        `);
      }).toThrow(messages.NON_OBJECT_FOR_STYLEX_CALL);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars();
        `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({}, {});
        `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({});
        `);
      }).not.toThrow();
    });

    /* Properties */

    test('variable keys must be a static value', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({
              [labelColor]: 'red',
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });

    /* Values */

    test('values must be static number, string or keyframe in stylex.defineVars()', () => {
      // number
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({
              cornerRadius: 5,
          });
        `);
      }).not.toThrow();
      // string
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({
              labelColor: 'red',
          });
        `);
      }).not.toThrow();
      // keyframe
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({
            fadeIn: stylex.keyframes({
              '0%': { opacity: 0 },
              '100%': { opacity: 1}
            }),
          });
        `)
      }).not.toThrow()
      // not static
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({
              labelColor: labelColor,
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.defineVars({
              labelColor: labelColor(),
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });
  });
});
