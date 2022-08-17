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
  describe('[validation] stylex imports', () => {
    test('ignore non-stylex imports', () => {
      expect(() => {
        transform(`
          import classnames from 'classnames';
        `);
      }).not.toThrow();
    });

    test('support named export of stylex.create()', () => {
      expect(() => {
        transform(`
          export const styles = stylex.create({});
        `);
      }).not.toThrow();
    });

    test('support default export of stylex.create()', () => {
      expect(() => {
        transform(`
          export default stylex.create({});
        `);
      }).not.toThrow();
    });
  });
});
