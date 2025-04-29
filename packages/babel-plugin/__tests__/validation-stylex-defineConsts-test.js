/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import { messages } from '../src/shared';
import stylexPlugin from '../src/index';

const defaultOpts = {
  unstable_moduleResolution: { rootDir: '/stylex/packages/', type: 'commonJS' },
};

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          ...defaultOpts,
          ...opts,
        },
      ],
    ],
  });
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex.defineConsts()', () => {
    test('invalid export: not bound', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const constants = stylex.defineConsts({});
        `);
      }).toThrow(messages.nonExportNamedDeclaration('defineConsts'));

      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          stylex.defineConsts({});
        `);
      }).toThrow(messages.unboundCallValue('defineConsts'));
    });

    test('invalid argument: none', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts();
        `);
      }).toThrow(messages.illegalArgumentLength('defineConsts', 1));
    });

    test('invalid argument: too many', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({}, {});
        `);
      }).toThrow(messages.illegalArgumentLength('defineConsts', 1));
    });

    test('invalid argument: number', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts(1);
        `);
      }).toThrow(messages.nonStyleObject('defineConsts'));
    });

    test('invalid argument: string', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts('1');
        `);
      }).toThrow(messages.nonStyleObject('defineConsts'));
    });

    test('invalid argument: non-static', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts(genStyles());
        `);
      }).toThrow(messages.nonStaticValue('defineConsts'));
    });

    test('valid argument: object', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({});
        `);
      }).not.toThrow();
    });

    /* Properties */

    test('invalid key: starts with "--"', () => {
      expect(() =>
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
            '--small': '8px'
          });
        `),
      ).toThrow(messages.INVALID_CONST_KEY);
    });

    test('invalid key: non-static', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
            [labelColor]: 'red',
          });
        `);
      }).toThrow(messages.nonStaticValue('defineConsts'));
    });

    /* Values */

    test('invalid value: non-static', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
            labelColor: labelColor,
          });
        `);
      }).toThrow(messages.nonStaticValue('defineConsts'));

      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
            labelColor: labelColor(),
          });
        `);
      }).toThrow(messages.nonStaticValue('defineConsts'));
    });

    test('valid value: number', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
            small: 5,
          });
        `);
      }).not.toThrow();
    });

    test('valid value: string', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
            small: '5px',
          });
        `);
      }).not.toThrow();
    });

    test.skip('valid value: keyframes', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const constants = stylex.defineConsts({
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
