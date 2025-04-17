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
          unstable_moduleResolution: { type: 'commonJS' },
          ...opts,
        },
      ],
    ],
  });
}

describe('@stylexjs/babel-plugin', () => {
  describe('[validation] stylex.defineVars()', () => {
    test('invalid export: not bound', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.defineVars({});
        `);
      }).toThrow(messages.NON_EXPORT_NAMED_DECLARATION);

      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          stylex.defineVars({});
        `);
      }).toThrow(messages.UNBOUND_STYLEX_CALL_VALUE);
    });

    test('invalid argument: none', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars();
        `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
    });

    test('invalid argument: too many', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({}, {});
        `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
    });

    test('invalid argument: number', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars(1);
        `);
      }).toThrow(messages.NON_OBJECT_FOR_STYLEX_CALL);
    });

    test('invalid argument: string', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars('1');
        `);
      }).toThrow(messages.NON_OBJECT_FOR_STYLEX_CALL);
    });

    test('invalid argument: non-static', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars(genStyles());
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });

    test('valid argument: object', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({});
        `);
      }).not.toThrow();
    });

    /* Properties */

    test('invalid key: non-static', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            [labelColor]: 'red',
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });

    /* Values */

    test('invalid value: non-static', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            labelColor: labelColor,
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);

      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            labelColor: labelColor(),
          });
        `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });

    test('valid value: number', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            cornerRadius: 5,
          });
        `);
      }).not.toThrow();
    });

    test('valid value: string', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            labelColor: 'red',
          });
        `);
      }).not.toThrow();
    });

    test('valid value: keyframes', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const vars = stylex.defineVars({
            fadeIn: stylex.keyframes({
              '0%': { opacity: 0 },
              '100%': { opacity: 1}
            }),
          });
        `);
      }).not.toThrow();
    });
  });
});
