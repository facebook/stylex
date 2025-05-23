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
  /**
   * stylex imports
   */
  describe('[validation] stylex imports', () => {
    test('valid import: non-stylex', () => {
      expect(() => {
        transform(`
          import classnames from 'classnames';
        `);
      }).not.toThrow();
    });

    test('valid import: named export of stylex.create()', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({});
        `);
      }).not.toThrow();
    });

    test('valid import: default export of stylex.create()', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          export default stylex.create({});
        `);
      }).not.toThrow();
    });

    test('valid import: positionTry named import', () => {
      expect(() => {
        transform(`
          import { positionTry } from '@stylexjs/stylex';
          const positionName = positionTry({});
        `);
      }).not.toThrow();
    });

    test('valid import: positionTry from namespace import', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const positionName = stylex.positionTry({});
        `);
      }).not.toThrow();
    });

    test('valid import: viewTransitionClass named import', () => {
      expect(() => {
        transform(`
          import { viewTransitionClass } from '@stylexjs/stylex';
          const transitionCls = viewTransitionClass({});
        `);
      }).not.toThrow();
    });

    test('valid import: viewTransitionClass from namespace import', () => {
      expect(() => {
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const transitionCls = stylex.viewTransitionClass({});
        `);
      }).not.toThrow();
    });
  });
});
