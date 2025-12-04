/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';
import * as messages from '../src/shared/messages';

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename || '/stylex/packages/vars.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: '/stylex/packages/',
            type: 'commonJS',
          },
          ...opts,
        },
      ],
    ],
  });
  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  describe('[validation] stylex.defineMarker()', () => {
    test('must be bound to a named export', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const marker = stylex.defineMarker();
        `);
      }).toThrow(messages.nonExportNamedDeclaration('defineMarker'));
    });

    test('no arguments allowed', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const marker = stylex.defineMarker(1);
        `);
      }).toThrow(messages.illegalArgumentLength('defineMarker', 0));
    });

    test('valid export: direct named export', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const marker = stylex.defineMarker();
        `);
      }).not.toThrow();
    });

    test('valid export: separate const and export statement', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const marker = stylex.defineMarker();
          export { marker };
        `);
      }).not.toThrow();
    });

    test('invalid export: re-export from another file does not count', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const marker = stylex.defineMarker();
          export { marker } from './other.stylex.js';
        `);
      }).toThrow(messages.nonExportNamedDeclaration('defineMarker'));
    });

    test('invalid export: renamed re-export from another file does not count', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const marker = stylex.defineMarker();
          export { marker as otherMarker } from './other.stylex.js';
        `);
      }).toThrow(messages.nonExportNamedDeclaration('defineMarker'));
    });

    test('invalid export: default export does not count', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const marker = stylex.defineMarker();
          export default marker;
        `);
      }).toThrow(messages.nonExportNamedDeclaration('defineMarker'));
    });

    test('invalid export: renamed export with as syntax', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const marker = stylex.defineMarker();
          export { marker as themeMarker };
        `);
      }).toThrow(messages.nonExportNamedDeclaration('defineMarker'));
    });
  });
});
