/* eslint-disable quotes */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');
const jsx = require('@babel/plugin-syntax-jsx');
const { utils } = require('@stylexjs/shared');

const hash = utils.hash;

const options = {
  classNamePrefix: '__hashed_var__',
};

function transform(source, opts = options) {
  return transformSync(source, {
    filename: opts.filename ?? 'test.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [jsx, [stylexPlugin, opts]],
  });
}

describe('Evaluation of imported values works based on configuration', () => {
  describe('Theme name hashing based on fileName alone works', () => {
    beforeEach(() => {
      options.unstable_moduleResolution = { type: 'haste' };
    });

    test('Importing file with ".stylex" suffix works', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          red: {
            color: MyTheme.foreground,
          }
        });
        stylex(styles.red);
      `);
      const expectedVarName = `var(--${options.classNamePrefix}${hash(
        'otherFile.stylex.js//MyTheme.foreground',
      )})`;
      expect(expectedVarName).toMatchInlineSnapshot(
        `"var(--__hashed_var__1jqb1tb)"`,
      );
      expect(transformation.code).toContain(expectedVarName);
      expect(transformation.code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        stylex.inject(".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}", 4);
        "__hashed_var__1r7rkhg";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1r7rkhg",
            {
              "ltr": ".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}",
              "rtl": null,
            },
            4,
          ],
        ]
      `);
    });
    test('Importing file with ".stylex.js" suffix works', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex.js';
        const styles = stylex.create({
          red: {
            color: MyTheme.foreground,
          }
        });
        stylex(styles.red);
      `);
      const expectedVarName = `var(--${options.classNamePrefix}${hash(
        'otherFile.stylex.js//MyTheme.foreground',
      )})`;
      expect(expectedVarName).toMatchInlineSnapshot(
        `"var(--__hashed_var__1jqb1tb)"`,
      );
      expect(transformation.code).toContain(expectedVarName);
      expect(transformation.code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex.js';
        stylex.inject(".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}", 4);
        "__hashed_var__1r7rkhg";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1r7rkhg",
            {
              "ltr": ".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}",
              "rtl": null,
            },
            4,
          ],
        ]
      `);
    });
    test('Importing file with ".stylex.js" with an alias suffix works', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme as mt } from 'otherFile.stylex.js';
        const styles = stylex.create({
          red: {
            color: mt.foreground,
          }
        });
        stylex(styles.red);
      `);
      const expectedVarName = `var(--${options.classNamePrefix}${hash(
        'otherFile.stylex.js//MyTheme.foreground',
      )})`;
      expect(expectedVarName).toMatchInlineSnapshot(
        `"var(--__hashed_var__1jqb1tb)"`,
      );
      expect(transformation.code).toContain(expectedVarName);
      expect(transformation.code).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        import { MyTheme as mt } from 'otherFile.stylex.js';
        stylex.inject(".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}", 4);
        "__hashed_var__1r7rkhg";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1r7rkhg",
            {
              "ltr": ".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}",
              "rtl": null,
            },
            4,
          ],
        ]
      `);
    });
    test('Importing file without a ".stylex" suffix fails', () => {
      const transformation = () =>
        transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile';
        const styles = stylex.create({
          red: {
            color: MyTheme.foreground,
          }
        });
        stylex(styles.red);
      `);
      expect(transformation).toThrow();
    });
  });
});
