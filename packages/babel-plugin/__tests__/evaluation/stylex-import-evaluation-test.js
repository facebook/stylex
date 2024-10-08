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

/* eslint-disable quotes */
const { transformSync } = require('@babel/core');
const stylexPlugin = require('../../src/index');
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
    plugins: [
      jsx,
      [
        stylexPlugin,
        { treeshakeCompensation: true, runtimeInjection: true, ...opts },
      ],
    ],
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex';
        import { MyTheme } from 'otherFile.stylex';
        _inject2(".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}", 3000);
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
            3000,
          ],
        ]
      `);
    });

    test('Maintains variable names that start with -- from "*.stylex" files', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          red: {
            color: MyTheme['--foreground'],
          }
        });
        stylex(styles.red);
      `);
      const expectedVarName = 'var(--foreground)';
      expect(expectedVarName).toMatchInlineSnapshot(`"var(--foreground)"`);
      expect(transformation.code).toContain(expectedVarName);
      expect(transformation.code).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex';
        import { MyTheme } from 'otherFile.stylex';
        _inject2(".__hashed_var__11jfisy{color:var(--foreground)}", 3000);
        "__hashed_var__11jfisy";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__11jfisy",
            {
              "ltr": ".__hashed_var__11jfisy{color:var(--foreground)}",
              "rtl": null,
            },
            3000,
          ],
        ]
      `);
    });

    test('Importing file with ".stylex" suffix works with keyframes', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const fade = stylex.keyframes({
          from: {
            color: MyTheme.foreground,
          }
        });
        const styles = stylex.create({
          red: {
            animationName: fade,
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex';
        import { MyTheme } from 'otherFile.stylex';
        _inject2("@keyframes __hashed_var__1cb153o-B{from{color:var(--__hashed_var__1jqb1tb);}}", 1);
        const fade = "__hashed_var__1cb153o-B";
        _inject2(".__hashed_var__1xwo6t1{animation-name:__hashed_var__1cb153o-B}", 3000);
        "__hashed_var__1xwo6t1";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1cb153o-B",
            {
              "ltr": "@keyframes __hashed_var__1cb153o-B{from{color:var(--__hashed_var__1jqb1tb);}}",
              "rtl": null,
            },
            1,
          ],
          [
            "__hashed_var__1xwo6t1",
            {
              "ltr": ".__hashed_var__1xwo6t1{animation-name:__hashed_var__1cb153o-B}",
              "rtl": null,
            },
            3000,
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex.js';
        import { MyTheme } from 'otherFile.stylex.js';
        _inject2(".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}", 3000);
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
            3000,
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
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex.js';
        import { MyTheme as mt } from 'otherFile.stylex.js';
        _inject2(".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}", 3000);
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
            3000,
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

    test('Imported vars with ".stylex" suffix can be used as style keys', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          red: {
            [MyTheme.foreground]: 'red',
          }
        });
        stylex(styles.red);
      `);

      expect(transformation.code).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex';
        import { MyTheme } from 'otherFile.stylex';
        _inject2(".__hashed_var__1g7q0my{--__hashed_var__1jqb1tb:red}", 1);
        "__hashed_var__1g7q0my";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1g7q0my",
            {
              "ltr": ".__hashed_var__1g7q0my{--__hashed_var__1jqb1tb:red}",
              "rtl": null,
            },
            1,
          ],
        ]
      `);
    });

    test('Imported vars with ".stylex" suffix can be used as style keys dynamically', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          color: (color) => ({
            [MyTheme.foreground]: color,
          })
        });
        stylex.props(styles.color('red'));
      `);

      expect(transformation.code).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex';
        import { MyTheme } from 'otherFile.stylex';
        _inject2(".__hashed_var__b69i2g{--__hashed_var__1jqb1tb:var(----__hashed_var__1jqb1tb)}", 1);
        const styles = {
          color: color => [{
            "--__hashed_var__1jqb1tb": color == null ? null : "__hashed_var__b69i2g",
            $$css: true
          }, {
            "----__hashed_var__1jqb1tb": color != null ? color : undefined
          }]
        };
        stylex.props(styles.color('red'));"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__b69i2g",
            {
              "ltr": ".__hashed_var__b69i2g{--__hashed_var__1jqb1tb:var(----__hashed_var__1jqb1tb)}",
              "rtl": null,
            },
            1,
          ],
        ]
      `);
    });
  });
});
