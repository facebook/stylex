/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();
jest.mock('@dual-bundle/import-meta-resolve');

/* eslint-disable quotes */
const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');
const jsx = require('@babel/plugin-syntax-jsx');
const { utils } = require('../src/shared');
const { moduleResolve } = require('@dual-bundle/import-meta-resolve');

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
        {
          treeshakeCompensation: true,
          runtimeInjection: true,
          unstable_moduleResolution: { type: 'haste' },
          ...opts,
        },
      ],
    ],
  });
}

describe('Evaluation of imported values works based on configuration', () => {
  describe('Theme name hashing based on fileName alone works', () => {
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
        _inject2({
          ltr: ".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}",
          priority: 3000
        });
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

    test('Importing file with ".stylex" and reading __varGroupHash__ returns a className', () => {
      const transformation = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          red: {
            color: MyTheme.__varGroupHash__,
          }
        });
        stylex(styles.red);
      `);
      const expectedVarName =
        options.classNamePrefix + hash('otherFile.stylex.js//MyTheme');
      expect(expectedVarName).toMatchInlineSnapshot(`"__hashed_var__jvfbhb"`);
      expect(transformation.code).toContain(expectedVarName);
      expect(transformation.code).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import 'otherFile.stylex';
        import { MyTheme } from 'otherFile.stylex';
        _inject2({
          ltr: ".__hashed_var__1yh36a2{color:__hashed_var__jvfbhb}",
          priority: 3000
        });
        "__hashed_var__1yh36a2";"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1yh36a2",
            {
              "ltr": ".__hashed_var__1yh36a2{color:__hashed_var__jvfbhb}",
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
        _inject2({
          ltr: ".__hashed_var__11jfisy{color:var(--foreground)}",
          priority: 3000
        });
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
        _inject2({
          ltr: "@keyframes __hashed_var__1cb153o-B{from{color:var(--__hashed_var__1jqb1tb);}}",
          priority: 0
        });
        const fade = "__hashed_var__1cb153o-B";
        _inject2({
          ltr: ".__hashed_var__1xwo6t1{animation-name:__hashed_var__1cb153o-B}",
          priority: 3000
        });
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
            0,
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
        _inject2({
          ltr: ".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".__hashed_var__1r7rkhg{color:var(--__hashed_var__1jqb1tb)}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".__hashed_var__1g7q0my{--__hashed_var__1jqb1tb:red}",
          priority: 1
        });
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
        _inject2({
          ltr: ".__hashed_var__1w8wjxo{--__hashed_var__1jqb1tb:var(--x---__hashed_var__1jqb1tb)}",
          priority: 1
        });
        _inject2({
          ltr: "@property --x---__hashed_var__1jqb1tb { syntax: \\"*\\"; inherits: false;}",
          priority: 0
        });
        const styles = {
          color: color => [{
            "--__hashed_var__1jqb1tb": color != null ? "__hashed_var__1w8wjxo" : color,
            $$css: true
          }, {
            "--x---__hashed_var__1jqb1tb": color != null ? color : undefined
          }]
        };
        stylex.props(styles.color('red'));"
      `);
      expect(transformation.metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "__hashed_var__1w8wjxo",
            {
              "ltr": ".__hashed_var__1w8wjxo{--__hashed_var__1jqb1tb:var(--x---__hashed_var__1jqb1tb)}",
              "rtl": null,
            },
            1,
          ],
          [
            "--x---__hashed_var__1jqb1tb",
            {
              "ltr": "@property --x---__hashed_var__1jqb1tb { syntax: "*"; inherits: false;}",
              "rtl": null,
            },
            0,
          ],
        ]
      `);
    });
  });

  describe('Module resolution commonJS', () => {
    afterEach(() => {
      moduleResolve.mockReset();
    });

    test('Recognizes .ts stylex imports when resolving .js relative imports', () => {
      moduleResolve.mockImplementation((value) => {
        if (!value.endsWith('/otherFile.stylex.ts')) {
          throw new Error('File not found');
        }
        return new URL('file:///project/otherFile.stylex.ts');
      });

      const transformation = transform(
        `
        import stylex from 'stylex';
        import { MyTheme } from './otherFile.stylex.js';
        const styles = stylex.create({
          red: {
            color: MyTheme.__varGroupHash__,
          }
        });
        stylex(styles.red);
        `,
        {
          unstable_moduleResolution: { type: 'commonJS' },
        },
      );

      expect(transformation.code).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        import './otherFile.stylex.js';
        import { MyTheme } from './otherFile.stylex.js';
        _inject2({
          ltr: ".xoh8dld{color:xb897f7}",
          priority: 3000
        });
        "xoh8dld";"
      `);
    });
  });

  describe('Arithmetic on imported tokens compiles to calc()', () => {
    const varName = (key) =>
      `var(--${options.classNamePrefix}${hash(
        `otherFile.stylex.js//MyTheme.${key}`,
      )})`;

    const transformStyle = (value) =>
      transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          box: {
            zIndex: ${value},
          }
        });
        stylex(styles.box);
      `).code;

    test('token + token', () => {
      expect(transformStyle('MyTheme.a + MyTheme.b')).toContain(
        `calc(${varName('a')} + ${varName('b')})`,
      );
    });

    test('token + number and number + token', () => {
      expect(transformStyle('MyTheme.a + 4')).toContain(
        `calc(${varName('a')} + 4)`,
      );
      expect(transformStyle('4 + MyTheme.a')).toContain(
        `calc(4 + ${varName('a')})`,
      );
    });

    test('token - number, token * number, token / number', () => {
      expect(transformStyle('MyTheme.a - 1')).toContain(
        `calc(${varName('a')} - 1)`,
      );
      expect(transformStyle('MyTheme.a * 2')).toContain(
        `calc(${varName('a')} * 2)`,
      );
      expect(transformStyle('MyTheme.a / 2')).toContain(
        `calc(${varName('a')} / 2)`,
      );
    });

    test('unary minus on a token', () => {
      expect(transformStyle('-MyTheme.a')).toContain(
        `calc(-1 * ${varName('a')})`,
      );
    });

    test('nested arithmetic flattens to parens', () => {
      expect(transformStyle('(MyTheme.a + MyTheme.b) * 2')).toContain(
        `calc((${varName('a')} + ${varName('b')}) * 2)`,
      );
    });

    test('token + jammed string throws instead of emitting broken CSS', () => {
      // A unit-string operand is excluded from calc() addition on purpose:
      // `token + '4px'` vs `token + ' 4px'` (list shorthand) must not
      // silently mean different things. And since the concatenation
      // 'var(--x)10px' is invalid CSS, it fails instead.
      expect(() => transformStyle("MyTheme.a + '10px'")).toThrow(
        /would\s+produce invalid CSS/,
      );
      expect(() => transformStyle("MyTheme.a + 'px'")).toThrow(
        /would\s+produce invalid CSS/,
      );
      expect(() => transformStyle("'10px' + MyTheme.a")).toThrow(
        /would\s+produce invalid CSS/,
      );
    });

    test('token + separated string stays list concatenation', () => {
      const code = transformStyle("MyTheme.a + ' 4px'");
      expect(code).not.toContain('calc');
      expect(code).toContain(`${varName('a')} 4px`);
    });

    test('string concatenation with non-numeric strings is preserved', () => {
      const code = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          box: {
            fontFamily: 'Arial, ' + MyTheme.font,
          }
        });
        stylex(styles.box);
      `).code;
      // The whitespace normalizer removes the space after the comma.
      expect(code).toContain(`Arial,${varName('font')}`);
      expect(code).not.toContain('calc');
    });

    test('template literal interpolation is preserved', () => {
      const code = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          box: {
            width: \`\${MyTheme.a}px\`,
          }
        });
        stylex(styles.box);
      `).code;
      expect(code).toContain(`${varName('a')}px`);
      expect(code).not.toContain('calc');
    });

    test('unsupported operators throw a compile error', () => {
      const unsupported = [
        'MyTheme.a % 2',
        'MyTheme.a ** 2',
        'MyTheme.a & 1',
        '~MyTheme.a',
        '!MyTheme.a',
        '+MyTheme.a',
      ];
      for (const value of unsupported) {
        expect(() => transformStyle(value)).toThrow(
          /cannot be applied to a StyleX variable or constant/,
        );
      }
    });

    test('comparisons on tokens throw a compile error', () => {
      expect(() => transformStyle('MyTheme.a > MyTheme.b ? 1 : 2')).toThrow(
        /cannot be compared with ">" at compile time/,
      );
      expect(() => transformStyle("MyTheme.a === 'red' ? 1 : 2")).toThrow(
        /cannot be compared with "===" at compile time/,
      );
    });

    test('null and undefined guards on tokens still compile', () => {
      expect(transformStyle('MyTheme.a != null ? 5 : 7')).toContain(
        'z-index:5',
      );
      expect(transformStyle('MyTheme.a === undefined ? 5 : 7')).toContain(
        'z-index:7',
      );
      expect(transformStyle('MyTheme.a ?? 7')).toContain(
        `z-index:${varName('a')}`,
      );
    });

    test('arithmetic in a computed style key throws a compile error', () => {
      expect(() =>
        transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          box: {
            [MyTheme.a + MyTheme.b]: 'red',
          }
        });
        stylex(styles.box);
      `),
      ).toThrow(/cannot be used as a style property key/);
    });

    test('token misuse inside a dynamic style throws instead of degrading', () => {
      expect(() =>
        transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          box: (opacity) => ({
            opacity,
            zIndex: MyTheme.a === 'big' ? 1 : 2,
          }),
        });
        stylex.props(styles.box(0.5));
      `),
      ).toThrow(/cannot be compared with "===" at compile time/);
    });

    test('unicode custom property keys work with arithmetic', () => {
      const { metadata } = transform(`
        import stylex from 'stylex';
        import { MyTheme } from 'otherFile.stylex';
        const styles = stylex.create({
          box: {
            zIndex: MyTheme['--größe'] * 2,
          }
        });
        stylex(styles.box);
      `);
      expect(metadata.stylex[0][1].ltr).toContain('calc(var(--größe) * 2)');
    });

    test('arithmetic with a non-numeric operand throws a compile error', () => {
      expect(() => transformStyle("MyTheme.a - 'foo'")).toThrow(
        /requires the other operand/,
      );
      expect(() => transformStyle("MyTheme.a * 'auto'")).toThrow(
        /requires the other operand/,
      );
    });
  });
});
